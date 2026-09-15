package com.web.ap_sports.service.common;

/**
 * Interface cho dịch vụ gửi Email hệ thống.
 */
public interface EmailService {

    /**
     * Gửi Email chứa đường dẫn Kích hoạt tài khoản dạng HTML cho Khách hàng.
     * 
     * @param toEmail Email người nhận
     * @param userName Tên người nhận
     * @param activationToken Mã kích hoạt 64 ký tự
     */
    void sendActivationEmail(String toEmail, String userName, String activationToken);
}
