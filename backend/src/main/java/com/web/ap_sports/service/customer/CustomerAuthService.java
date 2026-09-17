package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.ForgotPasswordRequest;
import com.web.ap_sports.dto.request.customer.LoginCustomerRequest;
import com.web.ap_sports.dto.request.customer.RegisterCustomerRequest;
import com.web.ap_sports.dto.request.customer.ResetPasswordRequest;
import com.web.ap_sports.dto.response.customer.CustomerLoginResponse;
import com.web.ap_sports.dto.response.customer.TokenResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Interface cho dịch vụ Xác thực Khách hàng Storefront (Customer Auth Service).
 * Hỗ trợ đa nền tảng Web (Next.js - Cookies) & Mobile (React Native - Bearer Header).
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
     * Xử lý Đăng nhập Khách hàng -> Cấp Token & Phân nhánh Cookies (Web) / JSON Body (Mobile).
     */
    CustomerLoginResponse login(LoginCustomerRequest request, String clientType, HttpServletResponse response);

    /**
     * Xử lý Đăng xuất Khách hàng -> Thu hồi Token & Xóa Cookies.
     */
    void logout(HttpServletRequest request, HttpServletResponse response);

    /**
     * Lấy thông tin User hiện tại từ JWT Access Token.
     */
    UserResponse getCurrentUser(HttpServletRequest request);

    /**
     * Xử lý Làm mới Access Token với quy tắc Strict Mobile Request Body.
     */
    TokenResponse refreshToken(String clientType, String rtFromCookie, String rtFromBody, HttpServletRequest request, HttpServletResponse response);

    /**
     * Xử lý Yêu cầu Quên Mật Khẩu -> Sinh Token & Gửi Email.
     */
    void forgotPassword(ForgotPasswordRequest request);

    /**
     * Xử lý Đặt Lại Mật Khẩu Mới với Token xác nhận.
     */
    void resetPassword(ResetPasswordRequest request);
}
