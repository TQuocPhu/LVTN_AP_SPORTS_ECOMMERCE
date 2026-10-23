package com.web.ap_sports.service.ai;

/**
 * Service kiểm duyệt ngôn từ thông minh (Content Moderation) cho hệ thống chat và tư vấn.
 * Sử dụng cơ chế kết hợp: Fast-Path Blacklist Regex + Deep Analysis qua Google Gemini Flash API.
 */
public interface ContentModerationAiService {

    record ModerationResult(
            boolean isViolation,
            String category,
            String reason,
            String maskedContent
    ) {
        public static ModerationResult clean() {
            return new ModerationResult(false, "NONE", null, null);
        }

        public static ModerationResult violation(String category, String reason) {
            return new ModerationResult(
                    true,
                    category != null ? category : "PROFANITY",
                    reason != null ? reason : "Ngôn từ vi phạm chuẩn mực cộng đồng",
                    "[Tin nhắn đã bị ẩn do vi phạm chuẩn mực ngôn từ]"
            );
        }
    }

    /**
     * Kiểm duyệt nội dung văn bản.
     * @param content Nội dung tin nhắn cần kiểm tra
     * @return ModerationResult chứa thông tin vi phạm, lý do và nội dung đã che
     */
    ModerationResult moderate(String content);
}
