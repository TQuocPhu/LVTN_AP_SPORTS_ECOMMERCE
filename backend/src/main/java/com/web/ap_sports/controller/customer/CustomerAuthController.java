package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.LoginCustomerRequest;
import com.web.ap_sports.dto.request.customer.RegisterCustomerRequest;
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
     * POST /api/v1/customer/auth/login
     */
    @PostMapping("/login")
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
}
