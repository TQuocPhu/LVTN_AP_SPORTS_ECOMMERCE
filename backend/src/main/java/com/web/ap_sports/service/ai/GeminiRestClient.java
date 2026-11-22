package com.web.ap_sports.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.config.GeminiAiConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service Connector giao tiếp trực tiếp với Google Gemini Flash REST API.
 * Hỗ trợ:
 * 1. Trường system_instruction chuẩn hóa của Google Gemini.
 * 2. Chuẩn hóa lịch sử hội thoại (luân phiên user/model nghiêm ngặt, loại bỏ tin nhắn rỗng) tránh lỗi 400 INVALID_ARGUMENT.
 * 3. Tự động gỡ bỏ thinkingConfig khi gọi dòng model Lite (gemini-3.5-flash-lite) vì model Lite không nhận thinkingBudget=0.
 * 4. Cơ chế Auto-Retry & Cooldown thông minh khi model chính bị 503, 429 hoặc Timeout.
 * 5. Kênh gọi nhanh generateFastContent dành riêng cho tác vụ phụ trợ (Intent / Moderation) dùng flash-lite timeout ngắn.
 */
@Service
@Slf4j
public class GeminiRestClient {

    private final GeminiAiConfig geminiAiConfig;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final RestTemplate fastRestTemplate;

    public GeminiRestClient(
            GeminiAiConfig geminiAiConfig,
            ObjectMapper objectMapper,
            @Qualifier("geminiRestTemplate") RestTemplate restTemplate,
            @Qualifier("fastGeminiRestTemplate") RestTemplate fastRestTemplate
    ) {
        this.geminiAiConfig = geminiAiConfig;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
        this.fastRestTemplate = fastRestTemplate;
    }

    /**
     * Đánh dấu thời điểm hết hạn cooldown của model chính (gemini-3.5-flash) khi gặp 503/429/Timeout,
     * giúp các tin nhắn tiếp theo chuyển thẳng sang gemini-3.5-flash-lite phản hồi tức thì (~350ms).
     */
    private final AtomicLong primaryModelCooldownUntil = new AtomicLong(0L);

    public record GeminiMessage(String role, String text) {}

    /**
     * Gọi nhanh Gemini Flash Lite cho các tác vụ phụ trợ nhẹ (bóc tách Intent, kiểm duyệt nội dung).
     * Dùng fastRestTemplate (timeout đọc 4s, không retry) để không làm chậm luồng chính hay ngốn quota API Key.
     * Trả về chuỗi rỗng "" nếu lỗi hoặc timeout để caller dùng fallback cục bộ.
     */
    public String generateFastContent(String systemInstruction, String userPrompt, double temperature, int maxOutputTokens) {
        String apiKey = geminiAiConfig.getApiKey();
        if (apiKey == null || apiKey.isBlank() || userPrompt == null || userPrompt.isBlank()) {
            return "";
        }

        String fallbackUrl = normalizeFallbackGeminiUrl(geminiAiConfig.getFallbackApiUrl());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        if (systemInstruction != null && !systemInstruction.isBlank()) {
            requestBody.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemInstruction.trim()))
            ));
        }
        requestBody.put("contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userPrompt.trim()))
        )));

        Map<String, Object> generationConfig = new LinkedHashMap<>();
        generationConfig.put("temperature", Math.max(0.0, Math.min(1.0, temperature)));
        generationConfig.put("maxOutputTokens", Math.max(32, Math.min(1024, maxOutputTokens)));
        requestBody.put("generationConfig", generationConfig);

        try {
            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = fastRestTemplate.exchange(
                    fallbackUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Gemini Fast AI phản hồi trong {} ms (URL: {})", duration, fallbackUrl);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String extracted = extractTextFromResponse(response.getBody());
                return extracted != null ? extracted : "";
            }
        } catch (Exception ex) {
            log.warn("Gemini Fast AI lỗi/timeout (bỏ qua sang fallback cục bộ): {}", ex.getMessage());
        }
        return "";
    }

    /**
     * Gọi Gemini Flash với một câu hỏi đơn lẻ (Single-turn).
     */
    public String generateContent(String systemInstruction, String userPrompt, double temperature, int maxOutputTokens) {
        List<GeminiMessage> messages = new ArrayList<>();
        messages.add(new GeminiMessage("user", userPrompt));
        return generateChatContent(systemInstruction, messages, temperature, maxOutputTokens);
    }

    /**
     * Gọi Gemini Flash với lịch sử hội thoại nhiều lượt (Multi-turn chat).
     * Tự động thử lại tối đa 3 lần nếu gặp 503 (High Demand), 429 hoặc 400 từ Google Cloud.
     */
    public String generateChatContent(String systemInstruction, List<GeminiMessage> conversationHistory, double temperature, int maxOutputTokens) {
        String apiKey = geminiAiConfig.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.error("Google Gemini API Key chưa được cấu hình trong backend/.env");
            return "Tính năng AI đang được bảo trì hoặc chưa cấu hình API Key. Vui lòng thử lại sau.";
        }

        // Chuẩn hóa danh sách contents: đảm bảo bắt đầu bằng "user", luân phiên user/model và không có text rỗng
        List<Map<String, Object>> normalizedContents = buildNormalizedContents(conversationHistory, false);
        if (normalizedContents.isEmpty()) {
            return "Dạ anh/chị vui lòng nhập nội dung câu hỏi để em hỗ trợ tư vấn nhé ạ!";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);

        int maxRetries = 2;
        long now = System.currentTimeMillis();
        boolean primaryInCooldown = now < primaryModelCooldownUntil.get();

        String primaryUrl = normalizePrimaryGeminiUrl(geminiAiConfig.getApiUrl());
        String fallbackUrl = normalizeFallbackGeminiUrl(geminiAiConfig.getFallbackApiUrl());

        boolean forceSingleTurn = false;
        boolean disableThinkingConfig = false;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            // Chọn URL theo thứ tự: nếu model chính đang bị 503 cooldown hoặc từ lần thử thứ 2 trở đi -> dùng thẳng gemini-3.5-flash-lite
            String currentUrl = (attempt == 1 && !primaryInCooldown) ? primaryUrl : fallbackUrl;
            boolean isLiteModel = currentUrl.toLowerCase(Locale.ROOT).contains("lite");

            // Xây dựng requestBody phù hợp với từng model (tuyệt đối không gửi thinkingBudget=0 cho model -lite hoặc khi retry lỗi 400)
            List<Map<String, Object>> activeContents = forceSingleTurn
                    ? buildNormalizedContents(conversationHistory, true)
                    : normalizedContents;

            Map<String, Object> requestBody = new LinkedHashMap<>();
            if (systemInstruction != null && !systemInstruction.isBlank()) {
                requestBody.put("system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemInstruction.trim()))
                ));
            }
            requestBody.put("contents", activeContents);

            Map<String, Object> generationConfig = new LinkedHashMap<>();
            generationConfig.put("temperature", Math.max(0.0, Math.min(1.0, temperature)));
            generationConfig.put("maxOutputTokens", Math.max(32, Math.min(4096, maxOutputTokens)));
            // Chỉ gắn thinkingConfig cho model chuẩn ở lần thử đầu tiên; model -lite không hỗ trợ thinkingBudget=0 (sẽ báo 400 INVALID_ARGUMENT)
            if (!isLiteModel && !disableThinkingConfig && attempt == 1) {
                generationConfig.put("thinkingConfig", Map.of("thinkingBudget", 0));
            }
            requestBody.put("generationConfig", generationConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            try {
                long startTime = System.currentTimeMillis();
                ResponseEntity<String> response = restTemplate.exchange(
                        currentUrl,
                        HttpMethod.POST,
                        entity,
                        String.class
                );
                long duration = System.currentTimeMillis() - startTime;
                log.info("Gemini AI phản hồi thành công trong {} ms (Attempt: {}, URL: {}, HTTP: {})",
                        duration, attempt, currentUrl, response.getStatusCode());

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    String extracted = extractTextFromResponse(response.getBody());
                    if (extracted != null && !extracted.isBlank()) {
                        return extracted;
                    }
                }

                log.warn("Gemini API trả về phản hồi rỗng hoặc mã HTTP không mong muốn: {}", response.getStatusCode());
                return "Hệ thống AI hiện đang bận xử lý, bạn vui lòng thử lại sau giây lát nhé.";

            } catch (HttpStatusCodeException ex) {
                int status = ex.getStatusCode().value();
                String errorBody = ex.getResponseBodyAsString();

                // Nếu model chính gặp 503 (Service Unavailable) hoặc 429 (Rate Limit), đặt cooldown 2 phút để các câu sau gọi thẳng sang flash-lite
                if ((status == 503 || status == 429) && currentUrl.equals(primaryUrl)) {
                    primaryModelCooldownUntil.set(System.currentTimeMillis() + 120_000L);
                }

                // Nếu gặp 400 BAD_REQUEST, tắt ngay thinkingConfig và rút gọn lịch sử hội thoại về câu hỏi cuối cùng
                if (status == 400) {
                    disableThinkingConfig = true;
                    forceSingleTurn = true;
                }

                if ((status == 503 || status == 429 || status == 404 || status == 400) && attempt < maxRetries) {
                    // Khi chuyển từ model chính sang model dự phòng khác endpoint thì gọi ngay lập tức (0ms delay)
                    log.warn("Google Gemini phản hồi HTTP {} tại lần {} (URL: {}). Tự động chuyển ngay sang model dự phòng (lần {})...",
                            status, attempt, currentUrl, attempt + 1);
                    continue;
                }

                log.error("Lỗi HTTP khi gọi Google Gemini API (Attempt {}, URL {}): {} - Body: {}",
                        attempt, currentUrl, ex.getStatusCode(), errorBody);
                return "Hệ thống AI đang tạm thời gián đoạn kết nối. Vui lòng thử lại sau ít phút.";

            } catch (org.springframework.web.client.ResourceAccessException ex) {
                if (currentUrl.equals(primaryUrl)) {
                    primaryModelCooldownUntil.set(System.currentTimeMillis() + 120_000L);
                }
                log.warn("Google Gemini bị timeout/I/O error tại lần {} (URL: {}): {}", attempt, currentUrl, ex.getMessage());
                if (attempt < maxRetries) {
                    log.info("Chuyển ngay sang model dự phòng (lần {}) sau khi model chính timeout...", attempt + 1);
                    continue;
                }
                log.error("Hết số lần thử kết nối Google Gemini do Timeout.");
                return "Xin lỗi, kết nối tới trợ lý AI mất nhiều thời gian hơn dự kiến. Bạn vui lòng thử lại sau giây lát nhé.";

            } catch (Exception ex) {
                log.error("Lỗi ngoại lệ khi giao tiếp với Gemini API: {}", ex.getMessage(), ex);
                return "Xin lỗi, hiện không thể kết nối tới trợ lý AI. Vui lòng thử lại sau.";
            }
        }

        return "Hệ thống AI đang tạm thời gián đoạn kết nối do nhu cầu truy cập tăng cao. Vui lòng thử lại sau ít phút.";
    }

    /**
     * Chuẩn hóa danh sách hội thoại gửi lên Gemini:
     * - Bỏ qua mọi tin nhắn null hoặc rỗng.
     * - Bỏ qua các tin nhắn "model" đứng đầu (Gemini bắt buộc lượt đầu tiên trong contents phải là "user").
     * - Gộp các tin nhắn liên tiếp cùng role ("user"-"user" hoặc "model"-"model") để đảm bảo luân phiên tuyệt đối.
     */
    private List<Map<String, Object>> buildNormalizedContents(List<GeminiMessage> conversationHistory, boolean singleTurnOnly) {
        if (conversationHistory == null || conversationHistory.isEmpty()) {
            return Collections.emptyList();
        }

        if (singleTurnOnly) {
            for (int i = conversationHistory.size() - 1; i >= 0; i--) {
                GeminiMessage msg = conversationHistory.get(i);
                if (msg != null && msg.text() != null && !msg.text().isBlank()) {
                    String role = ("model".equalsIgnoreCase(msg.role()) || "bot".equalsIgnoreCase(msg.role())) ? "model" : "user";
                    if ("user".equals(role)) {
                        return List.of(Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", msg.text().trim()))
                        ));
                    }
                }
            }
        }

        List<GeminiMessage> cleaned = new ArrayList<>();
        for (GeminiMessage msg : conversationHistory) {
            if (msg == null || msg.text() == null || msg.text().isBlank()) {
                continue;
            }
            String role = ("model".equalsIgnoreCase(msg.role()) || "bot".equalsIgnoreCase(msg.role())) ? "model" : "user";
            String text = msg.text().trim();

            // Gemini yêu cầu lượt đầu tiên trong contents bắt buộc là "user"
            if (cleaned.isEmpty() && "model".equals(role)) {
                continue;
            }

            // Nếu tin nhắn liền trước có cùng role thì gộp lại để tránh lỗi 400 do 2 lượt cùng role liên tiếp
            if (!cleaned.isEmpty() && cleaned.get(cleaned.size() - 1).role().equals(role)) {
                GeminiMessage prev = cleaned.get(cleaned.size() - 1);
                cleaned.set(cleaned.size() - 1, new GeminiMessage(role, prev.text() + "\n" + text));
            } else {
                cleaned.add(new GeminiMessage(role, text));
            }
        }

        List<Map<String, Object>> contents = new ArrayList<>(cleaned.size());
        for (GeminiMessage msg : cleaned) {
            contents.add(Map.of(
                    "role", msg.role(),
                    "parts", List.of(Map.of("text", msg.text()))
            ));
        }
        return contents;
    }

    private String normalizePrimaryGeminiUrl(String url) {
        if (url == null || url.isBlank()) {
            return "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";
        }
        return url.replace("gemini-3.8-flash:", "gemini-3.5-flash:");
    }

    private String normalizeFallbackGeminiUrl(String url) {
        if (url == null || url.isBlank()) {
            return "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";
        }
        return url.replace("gemini-2.5-flash-lite", "gemini-3.5-flash-lite");
    }

    /**
     * Bóc tách nội dung text từ JSON phản hồi của Google Gemini Flash
     */
    private String extractTextFromResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    StringBuilder fullText = new StringBuilder();
                    for (JsonNode part : parts) {
                        if (part.has("text")) {
                            fullText.append(part.get("text").asText(""));
                        }
                    }
                    return fullText.toString();
                }
            }
        } catch (Exception ex) {
            log.error("Không thể phân tích cú pháp JSON phản hồi từ Gemini: {}", ex.getMessage());
        }
        return "";
    }
}
