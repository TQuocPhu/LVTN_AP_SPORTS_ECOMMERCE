package com.web.ap_sports.controller.customer;

import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.dto.request.customer.ForgotPasswordRequest;
import com.web.ap_sports.dto.request.customer.LoginCustomerRequest;
import com.web.ap_sports.dto.request.customer.RegisterCustomerRequest;
import com.web.ap_sports.dto.request.customer.ResetPasswordRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.service.customer.CustomerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các REST API xác thực dành riêng cho Khách hàng Storefront (/api/v1/customer/auth).
 */
@RestController
@RequestMapping("/api/v1/customer/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    /**
     * API Đăng ký tài khoản Khách hàng mới.
     * POST /api/v1/customer/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterCustomerRequest request) {
        customerAuthService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản."));
    }

    /**
     * API Kích hoạt tài khoản từ Email link.
     * GET /api/v1/customer/auth/activate?token=...
     */
    @GetMapping("/activate")
    public ResponseEntity<ApiResponse<Void>> activateAccount(@RequestParam("token") String token) {
        customerAuthService.activateAccount(token);
        return ResponseEntity.ok(ApiResponse.success("Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ."));
    }

    /**
     * API Đăng nhập Khách hàng -> Đẩy Cookies (accessToken & refreshToken).
     * Rate limit: Tối đa 5 lần thử / 1 phút per IP (chống Brute Force dò quét mật khẩu).
     * POST /api/v1/customer/auth/login
     */
    @PostMapping("/login")
    @RateLimit(key = "login", maxRequests = 5, windowSeconds = 60)
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody LoginCustomerRequest request,
            HttpServletResponse response) {
        UserResponse userResponse = customerAuthService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công!", userResponse));
    }

    /**
     * API Đăng xuất Khách hàng -> Xóa Cookies.
     * POST /api/v1/customer/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        customerAuthService.logout(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công!"));
    }

    /**
     * API Lấy thông tin người dùng đang đăng nhập.
     * GET /api/v1/customer/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(HttpServletRequest request) {
        UserResponse userResponse = customerAuthService.getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công.", userResponse));
    }

    /**
     * API Làm mới Access Token tự động từ Refresh Token Cookie.
     * POST /api/v1/customer/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Void>> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        customerAuthService.refreshToken(request, response);
        return ResponseEntity.ok(ApiResponse.success("Làm mới token thành công."));
    }

    /**
     * API Gửi yêu cầu Quên Mật Khẩu (Sinh Token & Gửi Email).
     * Rate limit: Tối đa 3 lần / 10 phút per IP (chống spam email).
     * POST /api/v1/customer/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    @RateLimit(key = "forgot_password", maxRequests = 3, windowSeconds = 600)
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        customerAuthService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Yêu cầu đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư email của bạn."));
    }

    /**
     * API Đặt Lại Mật Khẩu Mới bằng Token.
     * Rate limit: Tối đa 5 lần / 10 phút per IP.
     * POST /api/v1/customer/auth/reset-password
     */
    @PostMapping("/reset-password")
    @RateLimit(key = "reset_password", maxRequests = 5, windowSeconds = 600)
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        customerAuthService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ."));
    }
}
