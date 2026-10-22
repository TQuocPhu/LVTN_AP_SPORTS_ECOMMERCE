package com.web.ap_sports.service.ai;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Tiện ích làm sạch và kiểm duyệt nội dung Prompt đầu vào trước khi gửi lên Gemini API.
 * Giúp ngăn chặn tấn công Prompt Injection, Jailbreak, và bảo vệ thông tin cá nhân (PII) của khách hàng.
 */
@Component
public class AiPromptSanitizer {

    // Regex phát hiện các cụm từ jailbreak / prompt injection phổ biến
    private static final Pattern INJECTION_PATTERN = Pattern.compile(
            "(?i)(ignore\\s+all\\s+previous\\s+instructions|ignore\\s+previous\\s+instructions|system\\s+prompt|forget\\s+your\\s+rules|reveal\\s+api\\s+key|act\\s+as\\s+dan|jailbreak)"
    );

    // Regex nhận diện số điện thoại Việt Nam (10 chữ số bắt đầu bằng 0)
    private static final Pattern PHONE_PATTERN = Pattern.compile("(0[3|5|7|8|9][0-9]{8})");

    // Regex nhận diện email
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}");

    // Regex lọc thẻ script và mã độc HTML
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script.*?>.*?</script>|<.*?javascript:.*?>");

    /**
     * Làm sạch câu hỏi của người dùng:
     * 1. Cắt tỉa khoảng trắng và giới hạn độ dài ký tự
     * 2. Loại bỏ các đoạn mã độc hại hoặc prompt injection
     * 3. Che giấu thông tin nhạy cảm cá nhân (PII)
     */
    public String sanitizeUserPrompt(String input, int maxCharacters) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String cleaned = input.trim();

        // 1. Giới hạn độ dài để tránh DoS token
        if (cleaned.length() > maxCharacters) {
            cleaned = cleaned.substring(0, maxCharacters);
        }

        // 2. Loại bỏ mã độc script
        cleaned = SCRIPT_PATTERN.matcher(cleaned).replaceAll("");

        // 3. Thay thế các cụm từ cố tình tấn công Prompt Injection
        if (INJECTION_PATTERN.matcher(cleaned).find()) {
            cleaned = INJECTION_PATTERN.matcher(cleaned).replaceAll("[Yêu cầu đã được lọc an toàn]");
        }

        // 4. Che giấu thông tin cá nhân (PII) trước khi chuyển lên cloud
        cleaned = PHONE_PATTERN.matcher(cleaned).replaceAll("[Số điện thoại đã ẩn]");
        cleaned = EMAIL_PATTERN.matcher(cleaned).replaceAll("[Email đã ẩn]");

        return cleaned;
    }
}
