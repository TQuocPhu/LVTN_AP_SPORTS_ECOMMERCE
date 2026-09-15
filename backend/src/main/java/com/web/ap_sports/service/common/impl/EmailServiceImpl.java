package com.web.ap_sports.service.common.impl;

import com.web.ap_sports.service.common.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

/**
 * Lớp triển khai (Implementation) của EmailService giao tiếp qua Spring Mail SMTP.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendActivationEmail(String toEmail, String userName, String activationToken) {
        String activationUrl = "http://localhost:3000/activate?token=" + activationToken;

        log.info("==================================================================");
        log.info("⚡ AP SPORTS ACTIVATION LINK FOR {}:", toEmail);
        log.info("{}", activationUrl);
        log.info("==================================================================");

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ff5722;">
                    <h2 style="color: #111827; margin: 0;">⚡ AP SPORTS E-COMMERCE</h2>
                </div>
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; color: #374151;">Xin chào <strong>%s</strong>,</p>
                    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản tại <strong>AP Sports</strong>. Để bắt đầu trải nghiệm mua sắm trang thiết bị thể thao cao cấp, vui lòng bấm vào nút bên dưới để kích hoạt tài khoản của bạn:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #ff5722; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(255, 87, 34, 0.3);">
                            ⚡ KÍCH HOẠT TÀI KHOẢN NGUYÊN BẢN
                        </a>
                    </div>
                    <p style="font-size: 13px; color: #6b7280;">Hoặc sao chép đường dẫn sau dán vào trình duyệt: <br><a href="%s" style="color: #ff5722;">%s</a></p>
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
                    <p>© 2026 AP Sports Enterprise. All rights reserved.</p>
                </div>
            </div>
            """.formatted(userName, activationUrl, activationUrl, activationUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("⚡ AP Sports - Kích Hoạt Tài Khoản Của Bạn");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email kích hoạt thành công đến địa chỉ: {}", toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email kích hoạt qua SMTP server ({}), tuy nhiên token đã được tạo. Bạn có thể sử dụng link kích hoạt từ log server: {}", e.getMessage(), activationUrl);
        }
    }
}
