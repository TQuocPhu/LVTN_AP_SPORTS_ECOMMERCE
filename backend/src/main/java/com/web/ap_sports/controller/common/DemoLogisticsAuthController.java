package com.web.ap_sports.controller.common;

import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.dto.request.admin.AdminLoginRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.service.common.DemoLogisticsAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/demo/logistics/auth")
@RequiredArgsConstructor
public class DemoLogisticsAuthController {

    private final DemoLogisticsAuthService authService;

    @PostMapping("/login")
    @RateLimit(key = "logistics_login", maxRequests = 5, windowSeconds = 60)
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletResponse response) {
        UserResponse userResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập Logistics thành công!", userResponse));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(HttpServletRequest request) {
        UserResponse userResponse = authService.getCurrentUser(request);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin Logistics thành công.", userResponse));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất Logistics thành công!", null));
    }
}
