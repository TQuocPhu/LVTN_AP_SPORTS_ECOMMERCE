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

    private static final java.util.regex.Pattern BASE64_IMAGE_PATTERN =
            java.util.regex.Pattern.compile("src=[\"']data:(image/[^;]+);base64,([^\"']+)[\"']", java.util.regex.Pattern.CASE_INSENSITIVE);

    @Override
    public void sendContactReplyEmail(String toEmail, String customerName, String originalMessage, String replyHtmlContent) {
        log.info("==================================================================");
        log.info("📩 AP SPORTS CONTACT REPLY EMAIL TO {}:", toEmail);
        log.info("==================================================================");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            // True parameter enables multipart mode for inline images/attachments
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            // Process Base64 images inside replyHtmlContent into Inline CID attachments
            java.util.Map<String, Base64ImageAttachment> inlineImages = new java.util.HashMap<>();
            String processedReplyHtml = extractAndReplaceBase64Images(replyHtmlContent, inlineImages);

            String template = """
            <div style="font-family: Arial, Helvetica, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ea580c;">
                    <h2 style="color: #0f172a; margin: 0; font-size: 22px; text-transform: uppercase;">AP SPORTS STORE</h2>
                    <p style="color: #ea580c; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Enterprise Customer Care & Support</p>
                </div>
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; color: #1e293b;">Kính gửi <strong>{{customerName}}</strong>,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">Cảm ơn bạn đã liên hệ với <strong>AP Sports Store</strong>. Chúng tôi xin phản hồi nội dung thắc mắc / đóng góp ý kiến của bạn như sau:</p>
                    
                    <!-- Original Question -->
                    <div style="margin: 20px 0; padding: 14px; background-color: #f8fafc; border-left: 4px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #64748b;">
                        <strong style="color: #334155; display: block; margin-bottom: 4px;">Nội dung bạn đã gửi:</strong>
                        <em style="color: #475569;">"{{originalMessage}}"</em>
                    </div>

                    <!-- Staff Reply Content (HTML Rich Text) -->
                    <div style="margin: 20px 0; padding: 18px; background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 10px; font-size: 14px; color: #1e293b; line-height: 1.7;">
                        <strong style="color: #ea580c; display: block; margin-bottom: 12px; font-size: 15px; text-transform: uppercase;">💬 Phản hồi từ Ban Quản Trị AP Sports:</strong>
                        <div style="word-break: break-word;">
                            <style>
                                font[size="1"] { font-size: 10px; }
                                font[size="2"] { font-size: 13px; }
                                font[size="3"] { font-size: 16px; }
                                font[size="4"] { font-size: 18px; }
                                font[size="5"] { font-size: 24px; }
                                font[size="6"] { font-size: 32px; }
                                font[size="7"] { font-size: 48px; }
                                img { max-width: 100% !important; height: auto !important; border-radius: 8px; display: block; margin: 10px 0; }
                                h1 { font-size: 22px; font-weight: bold; margin: 12px 0 6px 0; color: #0f172a; }
                                h2 { font-size: 18px; font-weight: bold; margin: 10px 0 4px 0; color: #1e293b; }
                                ul, ol { padding-left: 22px; margin: 8px 0; }
                                li { margin-bottom: 4px; }
                            </style>
                            {{replyHtmlContent}}
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
            """;

            String htmlContent = template
                    .replace("{{customerName}}", customerName != null ? customerName : "Người dùng ẩn danh")
                    .replace("{{originalMessage}}", originalMessage != null ? originalMessage : "")
                    .replace("{{replyHtmlContent}}", processedReplyHtml != null ? processedReplyHtml : "");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("📩 AP Sports - Phản Hồi Thắc Mắc & Liên Hệ Của Bạn");
            helper.setText(htmlContent, true);

            // Add all extracted inline CID images to MimeMessageHelper
            for (java.util.Map.Entry<String, Base64ImageAttachment> entry : inlineImages.entrySet()) {
                String cid = entry.getKey();
                Base64ImageAttachment att = entry.getValue();
                helper.addInline(cid, new org.springframework.core.io.ByteArrayResource(att.getBytes()), att.getContentType());
            }

            mailSender.send(message);
            log.info("Đã gửi email phản hồi liên hệ (kèm {} ảnh nhúng inline) đến địa chỉ: {}", inlineImages.size(), toEmail);
        } catch (Exception e) {
            log.error("Không thể gửi email phản hồi liên hệ qua SMTP server ({}): {}", e.getMessage(), e.getClass().getName(), e);
        }
    }

    private String extractAndReplaceBase64Images(String html, java.util.Map<String, Base64ImageAttachment> inlineImages) {
        if (html == null || html.isBlank()) return "";

        java.util.regex.Matcher matcher = BASE64_IMAGE_PATTERN.matcher(html);
        StringBuffer sb = new StringBuffer();
        int imgCount = 0;

        while (matcher.find()) {
            String contentType = matcher.group(1);
            String base64Data = matcher.group(2);

            try {
                // Remove line breaks or whitespace in base64 string if present
                String cleanBase64 = base64Data.replaceAll("\\s+", "");
                byte[] imageBytes = java.util.Base64.getDecoder().decode(cleanBase64);
                String cid = "img_embed_" + imgCount + "_" + System.currentTimeMillis();
                inlineImages.put(cid, new Base64ImageAttachment(imageBytes, contentType));

                matcher.appendReplacement(sb, "src=\"cid:" + cid + "\"");
                imgCount++;
            } catch (Exception e) {
                log.warn("Không thể decode base64 image trong email html: {}", e.getMessage());
                matcher.appendReplacement(sb, matcher.group(0));
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    @Override
    public void sendOrderConfirmationEmail(String toEmail, String customerName, String orderCode, String totalAmount, String paymentMethod) {
        log.info("==================================================================");
        log.info("🛒 AP SPORTS ORDER CONFIRMATION EMAIL FOR {}: OrderCode = {}", toEmail, orderCode);
        log.info("==================================================================");

        String htmlContent = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ea580c;">
                    <h2 style="color: #111827; margin: 0;">⚡ AP SPORTS ENTERPRISE</h2>
                    <p style="color: #ea580c; margin: 4px 0 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">Xác Nhận Đặt Hàng Thành Công</p>
                </div>
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; color: #374151;">Xin chào <strong>%s</strong>,</p>
                    <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">Cảm ơn bạn đã đặt hàng tại <strong>AP Sports Enterprise</strong>. Đơn hàng của bạn đã được ghi nhận trên hệ thống với thông tin như sau:</p>
                    
                    <div style="margin: 20px 0; padding: 16px; background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px;">
                        <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">Mã đơn hàng: <strong style="color: #ea580c;">#%s</strong></p>
                        <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">Tổng tiền thanh toán: <strong>%s đ</strong></p>
                        <p style="margin: 4px 0; font-size: 14px; color: #1e293b;">Phương thức thanh toán: <strong>%s</strong></p>
                    </div>

                    <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Chúng tôi sẽ nhanh chóng kiểm tra và vận chuyển đơn hàng đến địa chỉ của bạn. Bạn có thể theo dõi hành trình đơn hàng bằng cách truy cập tài khoản của bạn tại trang web.</p>
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
                    <p>Nếu có thắc mắc, vui lòng liên hệ hotline: 0913-193-009</p>
                    <p>© 2026 AP Sports Enterprise. All rights reserved.</p>
                </div>
            </div>
            """.formatted(customerName, orderCode, totalAmount, paymentMethod);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("⚡ AP Sports - Xác Nhận Đơn Hàng #" + orderCode);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email xác nhận đơn hàng #{} thành công đến địa chỉ: {}", orderCode, toEmail);
        } catch (Exception e) {
            log.warn("Không thể gửi email xác nhận đơn hàng qua SMTP server ({}): {}", e.getMessage(), e.getClass().getName());
        }
    }

    @lombok.AllArgsConstructor
    @lombok.Getter
    private static class Base64ImageAttachment {
        private final byte[] bytes;
        private final String contentType;
    }
}
