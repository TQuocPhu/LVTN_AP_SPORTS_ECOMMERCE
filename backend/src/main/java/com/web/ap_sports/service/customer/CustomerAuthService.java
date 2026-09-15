package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.LoginCustomerRequest;
import com.web.ap_sports.dto.request.customer.RegisterCustomerRequest;
import com.web.ap_sports.dto.response.customer.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Interface cho dịch vụ Xác thực Khách hàng Storefront (Customer Auth Service).
 */
public interface CustomerAuthService {

    /**
     * Xử lý Đăng ký Tài khoản Khách hàng mới.
     */
    void register(RegisterCustomerRequest request);

    /**
     * Xử lý Kích hoạt Tài khoản bằng Token từ Email.
     */
    void activateAccount(String token);

    /**
     * Xử lý Đăng nhập Khách hàng -> Cấp Token & Thiết lập Cookies.
     */
    UserResponse login(LoginCustomerRequest request, HttpServletResponse response);

    /**
     * Xử lý Đăng xuất Khách hàng -> Thu hồi Token & Xóa Cookies.
     */
    void logout(HttpServletRequest request, HttpServletResponse response);

    /**
     * Lấy thông tin User hiện tại từ JWT Access Token trong Cookie.
     */
    UserResponse getCurrentUser(HttpServletRequest request);

    /**
     * Xử lý Làm mới Access Token từ Refresh Token Cookie (Silent Refresh).
     */
    void refreshToken(HttpServletRequest request, HttpServletResponse response);

    /**
     * Xử lý Yêu cầu Quên Mật Khẩu -> Sinh Token & Gửi Email.
     */
    void forgotPassword(com.web.ap_sports.dto.request.customer.ForgotPasswordRequest request);

    /**
     * Xử lý Đặt Lại Mật Khẩu Mới với Token xác nhận.
     */
    void resetPassword(com.web.ap_sports.dto.request.customer.ResetPasswordRequest request);
}
