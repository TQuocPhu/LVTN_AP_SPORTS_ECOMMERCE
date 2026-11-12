package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.service.ai.ContentModerationAiService;
import com.web.ap_sports.service.ai.GeminiRestClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentModerationAiServiceImpl implements ContentModerationAiService {

    private final GeminiRestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    // Ranh giới từ chuẩn Unicode tiếng Việt (tránh lỗi \b của Java không nhận diện chữ cái có dấu như đ, ặ, ồ, ụ)
    private static final String WORD_START = "(?<=^|[\\s,\\.;:!?()\\[\\]\"'/_\\-])";
    private static final String WORD_END = "(?=$|[\\s,\\.;:!?()\\[\\]\"'/_\\-])";

    // Fast-path Regex Blacklist: bắt tức thì (< 1ms) cả tiếng Việt có dấu, không dấu và từ viết tắt thô tục
    private static final Pattern FAST_PROFANITY_PATTERN = Pattern.compile(
            WORD_START + "(" +
                    "đụ|đụ má|đụ mẹ|du ma|du me|địt|địt mẹ|địt cụ|địt con mẹ|dit me|dit con me|dit cu|" +
                    "con cặc|cái cặc|cặc|cặt|con cac|cai cac|cac|c\\.a\\.c|cc|" +
                    "cái lồn|con lồn|bú lồn|lồn|cai lon|con lon|bu lon|" +
                    "đéo|deo|con đĩ|đĩ mẹ|con di|di me|mẹ mày|má mày|chó đẻ|cho de|óc chó|oc cho|" +
                    "súc vật|suc vat|súc sinh|suc sinh|ngu lồn|ngu vcl|bắn chết|giết mày|chém chết|" +
                    "đm|dm|dcm|đcm|dkm|đkm|dmm|đmm|cmm|clmm|clm|vcl|vkl|vcc|vl" +
            ")" + WORD_END + "|" +
            WORD_START + "(cá độ|ca do|link cá cược|đánh bạc online|kubet|thabet|sunwin|go88|rikvip)" + WORD_END,
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE | Pattern.UNICODE_CHARACTER_CLASS
    );

    private static final String MODERATION_SYSTEM_INSTRUCTION = """
            Bạn là Hệ thống Kiểm duyệt Nội dung An toàn (AI Content Safety Moderator) của sàn thương mại điện tử AP Sports Việt Nam.
            Nhiệm vụ: Phân tích tin nhắn của người dùng trong hệ thống chat chăm sóc khách hàng và tư vấn thể thao để xác định xem có vi phạm tiêu chuẩn cộng đồng hay không.

            Tiêu chí vi phạm:
            1. PROFANITY: Chửi bới, văng tục (kể cả viết không dấu hoặc viết tắt như con cac, dm, vcl...), xúc phạm danh dự, nhân phẩm nhân viên hoặc người khác.
            2. HARASSMENT: Đe dọa bạo lực, quấy rối, khủng bố tinh thần, quấy rối tình dục.
            3. HATE_SPEECH: Phân biệt chủng tộc, vùng miền, tôn giáo, xúc phạm thô bạo.
            4. SCAM_SPAM: Lừa đảo, quảng cáo web cá độ, chia sẻ link độc hại, cố tình lôi kéo sang ứng dụng ngoài để lừa gạt.

            Quy tắc phản hồi:
            - Chỉ trả về duy nhất 1 chuỗi JSON hợp lệ, TUYỆT ĐỐI KHÔNG bọc markdown, KHÔNG thêm ```json hay lời giải thích.
            - Cấu trúc JSON bắt buộc:
            {
              "isViolation": true hoặc false,
              "category": "PROFANITY" | "HARASSMENT" | "HATE_SPEECH" | "SCAM_SPAM" | "NONE",
              "reason": "Mô tả ngắn gọn tiếng Việt lý do vi phạm (ví dụ: Sử dụng từ ngữ xúc phạm danh dự nhân viên) hoặc rỗng nếu không vi phạm"
            }
            """;

    @Override
    public ModerationResult moderate(String content) {
        if (content == null || content.isBlank()) {
            return ModerationResult.clean();
        }

        String cleanText = content.trim();

        // 1. Lớp 1: Fast-path Regex Blacklist (< 1ms, bắt ngay cả từ có dấu lẫn không dấu)
        if (FAST_PROFANITY_PATTERN.matcher(cleanText).find()) {
            log.info("[Content Moderation] Bắt vi phạm qua Fast-path Regex cho nội dung: '{}'", cleanText);
            return ModerationResult.violation("PROFANITY", "Sử dụng từ ngữ thô tục / xúc phạm");
        }

        // Nếu nội dung quá ngắn (dưới 3 từ không nằm trong danh sách từ khóa thô tục), bỏ qua gọi Gemini để phản hồi tức thì
        if (cleanText.split("\\s+").length < 3) {
            return ModerationResult.clean();
        }

        // 2. Lớp 2: Phân tích ngữ nghĩa chuyên sâu qua Google Gemini Flash API (bọc Timeout cứng 2.5s để không bao giờ treo chat)
        CompletableFuture<String> aiFuture = CompletableFuture.supplyAsync(() -> {
            String prompt = "Phân tích tin nhắn sau:\n\"" + cleanText + "\"";
            return geminiRestClient.generateContent(MODERATION_SYSTEM_INSTRUCTION, prompt, 0.1, 256);
        });

        try {
            String rawJson = aiFuture.get(2500, TimeUnit.MILLISECONDS);

            if (rawJson != null && !rawJson.isBlank() && rawJson.contains("{")) {
                String sanitizedJson = rawJson.replace("```json", "").replace("```", "").trim();
                Map<String, Object> resultMap = objectMapper.readValue(sanitizedJson, new TypeReference<Map<String, Object>>() {});

                Boolean isViolation = (Boolean) resultMap.get("isViolation");
                if (Boolean.TRUE.equals(isViolation)) {
                    String category = resultMap.get("category") != null ? String.valueOf(resultMap.get("category")) : "PROFANITY";
                    String reason = resultMap.get("reason") != null ? String.valueOf(resultMap.get("reason")) : "Vi phạm tiêu chuẩn cộng đồng";
                    log.warn("[Content Moderation] ⚠️ Gemini phát hiện vi phạm: [{}] - Lý do: {}", category, reason);
                    return ModerationResult.violation(category, reason);
                }
            }
        } catch (TimeoutException te) {
            aiFuture.cancel(true);
            log.warn("[Content Moderation] Quá thời gian chờ Gemini (2.5s), bỏ qua để gửi tin nhắn tức thì.");
        } catch (Exception e) {
            log.warn("[Content Moderation] Lỗi khi gọi Gemini kiểm duyệt (chuyển sang fail-safe an toàn): {}", e.getMessage());
        }

        return ModerationResult.clean();
    }
}
