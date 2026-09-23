package com.web.ap_sports.controller.admin;

import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.dto.request.admin.ChangeAdminPasswordRequest;
import com.web.ap_sports.dto.request.admin.UpdateAdminProfileRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.AuthTokens;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.service.admin.AdminProfileService;
import com.web.ap_sports.util.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST Controller xử lý Hồ sơ tài khoản Admin Portal (/api/v1/admin/profile).
 */
@RestController
@RequestMapping("/api/v1/admin/profile")
@RequiredArgsConstructor
public class AdminProfileController {

    private final AdminProfileService adminProfileService;

    /**
     * Lấy thông tin tài khoản Admin đang đăng nhập.
     * GET /api/v1/admin/profile/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        UserResponse profile = adminProfileService.getProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tài khoản thành công.", profile));
    }

    /**
     * Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ).
     * PUT /api/v1/admin/profile/update
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateAdminProfileRequest request) {
        UserResponse updated = adminProfileService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin tài khoản thành công.", updated));
    }

    /**
     * Upload ảnh đại diện Avatar qua Cloudinary.
     * POST /api/v1/admin/profile/avatar
     */
    @PostMapping("/avatar")
    @RateLimit(key = "admin_avatar", maxRequests = 5, windowSeconds = 600)
    public ResponseEntity<ApiResponse<UserResponse>> updateAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        UserResponse updated = adminProfileService.updateAvatar(authentication.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh đại diện thành công.", updated));
    }

    /**
     * Thay đổi Mật khẩu tài khoản Admin.
     * Tự động thu hồi token cũ & cấp cặp Token mới vào Cookie HttpOnly (Seamless UX).
     * PUT /api/v1/admin/profile/change-password
     */
    @PutMapping("/change-password")
    @RateLimit(key = "admin_change_password", maxRequests = 3, windowSeconds = 900)
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangeAdminPasswordRequest request,
            HttpServletResponse response) {
        AuthTokens tokens = adminProfileService.changePassword(authentication.getName(), request);

        // Đính kèm cặp Token mới vào Cookies của phiên hiện tại (Seamless UX)
        CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, tokens.getAccessToken(), CookieUtils.ACCESS_TOKEN_MAX_AGE);
        CookieUtils.addTokenCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, tokens.getRawRefreshToken(), CookieUtils.REFRESH_TOKEN_MAX_AGE);

        return ResponseEntity.ok(ApiResponse.success("Thay đổi mật khẩu thành công."));
    }
}
