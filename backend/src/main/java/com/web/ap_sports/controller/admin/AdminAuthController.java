package com.web.ap_sports.controller.admin;

import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.dto.request.admin.AdminLoginRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.service.admin.AdminAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các REST API xác thực dành riêng cho Admin Portal (/api/v1/admin/auth).
 */
@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    /**
     * API Đăng nhập Admin Portal -> Đẩy Cookies (accessToken & refreshToken).
     * Rate limit: Tối đa 5 lần thử / 1 phút per IP.
     * POST /api/v1/admin/auth/login
     */
    @PostMapping("/login")
    @RateLimit(key = "admin_login", maxRequests = 5, windowSeconds = 60)
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletResponse response) {
        UserResponse userResponse = adminAuthService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập Admin thành công!", userResponse));
    }

    /**
     * API Lấy thông tin Admin đang đăng nhập.
     * GET /api/v1/admin/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentAdmin(HttpServletRequest request) {
        UserResponse userResponse = adminAuthService.getCurrentAdmin(request);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin Admin thành công.", userResponse));
    }

    /**
     * API Đăng xuất khỏi Admin Portal.
     * POST /api/v1/admin/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        adminAuthService.logout(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất Admin thành công!"));
    }
}
