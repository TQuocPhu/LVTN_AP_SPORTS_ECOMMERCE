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

    @Override
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken + "&email=" + toEmail;

        log.info("==================================================================");
        log.info("🔒 AP SPORTS PASSWORD RESET LINK FOR {}:", toEmail);
        log.info("{}", resetUrl);
        log.info("==================================================================");

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ff5722;">
                    <h2 style="color: #111827; margin: 0;">🔒 AP SPORTS E-COMMERCE</h2>
                </div>
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; color: #374151;">Xin chào <strong>%s</strong>,</p>
                    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>AP Sports</strong> của bạn. Vui lòng bấm vào nút bên dưới để thiết lập mật khẩu mới (liên kết có hiệu lực trong 15 phút):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #ff5722; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(255, 87, 34, 0.3);">
                            🔒 ĐẶT LẠI MẬT KHẨU MỚI
                        </a>
                    </div>
                    <p style="font-size: 13px; color: #6b7280;">Hoặc sao chép đường dẫn sau dán vào trình duyệt: <br><a href="%s" style="color: #ff5722;">%s</a></p>
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này để bảo vệ tài khoản.</p>
                    <p>© 2026 AP Sports Enterprise. All rights reserved.</p>
                </div>
            </div>
            """.formatted(userName, resetUrl, resetUrl, resetUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔒 AP Sports - Đặt Lại Mật Khẩu Tài Khoản");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email đặt lại mật khẩu thành công đến địa chỉ: {}", toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email đặt lại mật khẩu qua SMTP server ({}), tuy nhiên token đã được tạo. Bạn có thể sử dụng link đặt lại mật khẩu từ log server: {}", e.getMessage(), resetUrl);
        }
    }

    @Override
    public void sendContactReplyEmail(String toEmail, String customerName, String originalMessage, String replyHtmlContent) {
        log.info("==================================================================");
        log.info("📩 AP SPORTS CONTACT REPLY EMAIL TO {}:", toEmail);
        log.info("==================================================================");

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ea580c;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 22px; text-transform: uppercase;">AP SPORTS STORE</h2>
                    <p style="color: #ea580c; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Enterprise Customer Care & Support</p>
                </div>
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; color: #1e293b;">Kính gửi <strong>%s</strong>,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">Cảm ơn bạn đã liên hệ với <strong>AP Sports Store</strong>. Chúng tôi xin phản hồi nội dung thắc mắc / đóng góp ý kiến của bạn như sau:</p>
                    
                    <!-- Original Question -->
                    <div style="margin: 20px 0; padding: 14px; background-color: #f8fafc; border-left: 4px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #64748b;">
                        <strong style="color: #334155; display: block; margin-bottom: 4px;">Nội dung bạn đã gửi:</strong>
                        <em style="color: #475569;">"%s"</em>
                    </div>

                    <!-- Staff Reply Content (HTML Rich Text) -->
                    <div style="margin: 20px 0; padding: 18px; background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 10px; font-size: 14px; color: #1e293b; line-height: 1.7;">
                        <strong style="color: #ea580c; display: block; margin-bottom: 10px; font-size: 15px; text-transform: uppercase;">💬 Phản hồi từ Ban Quản Trị AP Sports:</strong>
                        <div>
                            %s
                        </div>
                    </div>

                    <p style="font-size: 14px; color: #475569;">Nếu bạn có bất kỳ câu hỏi hoặc cần hỗ trợ thêm, vui lòng phản hồi lại email này hoặc liên hệ hotline CSKH của chúng tôi.</p>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
                    <p style="margin: 2px 0;">Hotline: 0913-193-009 • Email: tqphu240804@gmail.com</p>
                    <p style="margin: 2px 0;">Địa chỉ: Đường Phan Đình Phùng, K10, Phường Trà Vinh, Vĩnh Long</p>
                    <p style="margin: 8px 0 0 0; font-weight: bold; color: #64748b;">© 2026 AP Sports Enterprise. All rights reserved.</p>
                </div>
            </div>
            """.formatted(customerName, originalMessage, replyHtmlContent);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("📩 AP Sports - Phản Hồi Thắc Mắc & Liên Hệ Của Bạn");
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email phản hồi liên hệ thành công đến địa chỉ: {}", toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email phản hồi liên hệ qua SMTP server ({}): {}", e.getMessage(), e.getLocalizedMessage());
        }
    }
}
