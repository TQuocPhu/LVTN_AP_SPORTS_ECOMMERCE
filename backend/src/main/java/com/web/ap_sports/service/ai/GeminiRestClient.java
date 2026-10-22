package com.web.ap_sports.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.config.GeminiAiConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service Connector giao tiếp trực tiếp với Google Gemini Flash REST API.
 * Hỗ trợ:
 * 1. Trường system_instruction chuẩn hóa của Google Gemini.
 * 2. Cơ chế tự động thử lại (Auto-Retry với Backoff) khi Google bị 503 High Demand Spikes hoặc 429 Rate Limit.
 * 3. Phân tích bóc tách response JSON chuẩn xác.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiRestClient {

    private final GeminiAiConfig geminiAiConfig;
    private final ObjectMapper objectMapper;

    @Qualifier("geminiRestTemplate")
    private final RestTemplate restTemplate;

    public record GeminiMessage(String role, String text) {}

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
     * Tự động thử lại tối đa 3 lần nếu gặp 503 (High Demand) hoặc 429 từ Google Cloud.
     */
    public String generateChatContent(String systemInstruction, List<GeminiMessage> conversationHistory, double temperature, int maxOutputTokens) {
        String apiKey = geminiAiConfig.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.error("Google Gemini API Key chưa được cấu hình trong backend/.env");
            return "Tính năng AI đang được bảo trì hoặc chưa cấu hình API Key. Vui lòng thử lại sau.";
        }

        // Xây dựng request payload
        Map<String, Object> requestBody = new HashMap<>();

        // 1. Trường system_instruction chuẩn của Gemini
        if (systemInstruction != null && !systemInstruction.isBlank()) {
            requestBody.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemInstruction))
            ));
        }

        // 2. Danh sách contents (hội thoại)
        List<Map<String, Object>> contents = new ArrayList<>();
        for (GeminiMessage msg : conversationHistory) {
            String role = "model".equalsIgnoreCase(msg.role()) || "bot".equalsIgnoreCase(msg.role()) ? "model" : "user";
            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", msg.text()))
            ));
        }
        requestBody.put("contents", contents);

        // 3. Cấu hình generationConfig tối ưu:
        // Đặt thinkingBudget = 0 để tắt chế độ suy nghĩ ngầm (Thinking), giúp AI phản hồi tức thì (< 2s)
        // và không bị chiếm dụng token làm câu trả lời bị cắt cụt giữa chừng.
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", Math.max(0.0, Math.min(1.0, temperature)));
        generationConfig.put("maxOutputTokens", Math.max(1024, Math.min(4096, maxOutputTokens)));
        generationConfig.put("thinkingConfig", Map.of("thinkingBudget", 0));
        requestBody.put("generationConfig", generationConfig);

        // 4. Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // 5. Gọi API kèm cơ chế Auto-Retry & Tự động Fallback Model khi Google bị 503 hoặc Read timed out
        int maxRetries = 3;
        String currentUrl = geminiAiConfig.getApiUrl();

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            // Nếu từ lần 2 trở đi mà gặp lỗi ở lần 1, tự động chuyển sang Fallback Model (gemini-3.5-flash-lite)
            if (attempt > 1 && geminiAiConfig.getFallbackApiUrl() != null) {
                currentUrl = geminiAiConfig.getFallbackApiUrl();
            }

            try {
                long startTime = System.currentTimeMillis();
                ResponseEntity<String> response = restTemplate.exchange(
                        currentUrl,
                        HttpMethod.POST,
                        entity,
                        String.class
                );
                long duration = System.currentTimeMillis() - startTime;
                log.info("Gemini Flash phản hồi thành công trong {} ms (Attempt: {}, URL: {}, HTTP: {})",
                        duration, attempt, currentUrl, response.getStatusCode());

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return extractTextFromResponse(response.getBody());
                }

                log.warn("Gemini API trả về mã HTTP không mong muốn: {}", response.getStatusCode());
                return "Hệ thống AI hiện đang bận xử lý, bạn vui lòng thử lại sau giây lát nhé.";

            } catch (HttpStatusCodeException ex) {
                int status = ex.getStatusCode().value();
                // Nếu Google bị 503 (High Demand), 429 (Rate Limit), hoặc 404 (Model deprecated) -> Tự động thử lại hoặc fallback
                if ((status == 503 || status == 429 || status == 404) && attempt < maxRetries) {
                    long backoffMs = 1000L * attempt;
                    log.warn("Google Gemini phản hồi HTTP {} ({}) tại lần {}. Tự động fallback/thử lại lần {} sau {} ms...",
                            status, ex.getStatusText(), attempt, attempt + 1, backoffMs);
                    try {
                        Thread.sleep(backoffMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    continue;
                }

                log.error("Lỗi HTTP khi gọi Google Gemini API (Attempt {}): {} - Body: {}", attempt, ex.getStatusCode(), ex.getResponseBodyAsString());
                return "Hệ thống AI đang tạm thời gián đoạn kết nối. Vui lòng thử lại sau ít phút.";

            } catch (org.springframework.web.client.ResourceAccessException ex) {
                // Xử lý triệt để lỗi "Read timed out" / I/O error
                log.warn("Google Gemini bị timeout/I/O error tại lần {} (URL: {}): {}", attempt, currentUrl, ex.getMessage());
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(800L);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    continue; // Tự động thử tiếp với fallback URL
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
