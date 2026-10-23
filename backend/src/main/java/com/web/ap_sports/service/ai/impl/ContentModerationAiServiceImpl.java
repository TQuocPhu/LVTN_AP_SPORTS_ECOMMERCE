package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.service.ai.ContentModerationAiService;
import com.web.ap_sports.service.ai.GeminiRestClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContentModerationAiServiceImpl implements ContentModerationAiService {

    private final GeminiRestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    // Fast-path Regex Blacklist các từ ngữ thô tục, lăng mạ, chửi bới tiếng Việt phổ biến (< 1ms)
    private static final Pattern FAST_PROFANITY_PATTERN = Pattern.compile(
            "\\b(đụ|đụ má|đụ mẹ|đm|dcm|đcm|vcl|vcc|clmm|con cặc|cặc|lồn|đĩ mẹ|mẹ mày|chó đẻ|dkm|đkm|đmm|dmm|bú lồn|súc vật|bắn chết|giết mày)\\b|" +
            "\\b(cá độ|link cá cược|đánh bạc online|kubet|thabet)\\b",
            Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    private static final String MODERATION_SYSTEM_INSTRUCTION = """
            Bạn là Hệ thống Kiểm duyệt Nội dung An toàn (AI Content Safety Moderator) của sàn thương mại điện tử AP Sports Việt Nam.
            Nhiệm vụ: Phân tích tin nhắn của người dùng trong hệ thống chat chăm sóc khách hàng và tư vấn thể thao để xác định xem có vi phạm tiêu chuẩn cộng đồng hay không.

            Tiêu chí vi phạm:
            1. PROFANITY: Chửi bới, văng tục, xúc phạm danh dự, nhân phẩm nhân viên hoặc người khác.
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

        // 1. Lớp 1: Fast-path Regex Blacklist
        if (FAST_PROFANITY_PATTERN.matcher(cleanText).find()) {
            log.info("[Content Moderation] Bắt vi phạm qua Fast-path Regex cho nội dung: '{}'", cleanText);
            return ModerationResult.violation("PROFANITY", "Sử dụng từ ngữ thô tục / xúc phạm");
        }

        // Nếu nội dung quá ngắn (dưới 2 từ không vi phạm từ khóa thô tục), bỏ qua gọi Gemini để tối ưu hiệu năng
        if (cleanText.split("\\s+").length < 2) {
            return ModerationResult.clean();
        }

        // 2. Lớp 2: Phân tích ngữ nghĩa chuyên sâu qua Google Gemini Flash API
        try {
            String prompt = "Phân tích tin nhắn sau:\n\"" + cleanText + "\"";
            String rawJson = geminiRestClient.generateContent(MODERATION_SYSTEM_INSTRUCTION, prompt, 0.1, 256);

            if (rawJson != null && !rawJson.isBlank()) {
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
        } catch (Exception e) {
            log.warn("[Content Moderation] Lỗi khi gọi Gemini kiểm duyệt (chuyển sang fail-safe an toàn): {}", e.getMessage());
        }

        return ModerationResult.clean();
    }
}
