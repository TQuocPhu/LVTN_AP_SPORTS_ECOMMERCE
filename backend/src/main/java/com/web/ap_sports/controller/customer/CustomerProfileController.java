package com.web.ap_sports.controller.customer;

import com.web.ap_sports.config.annotation.RateLimit;
import com.web.ap_sports.dto.request.customer.ChangePasswordRequest;
import com.web.ap_sports.dto.request.customer.UpdateProfileRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.AuthTokens;
import com.web.ap_sports.dto.response.customer.UserProfileResponse;
import com.web.ap_sports.service.customer.CustomerProfileService;
import com.web.ap_sports.util.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST Controller xử lý Hồ sơ cá nhân người dùng Storefront (/api/v1/customer/profile).
 */
@RestController
@RequestMapping("/api/v1/customer/profile")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerProfileService customerProfileService;

    /**
     * Lấy thông tin Hồ sơ người dùng hiện tại.
     * GET /api/v1/customer/profile/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        UserProfileResponse profile = customerProfileService.getProfile(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin hồ sơ cá nhân thành công.", profile));
    }

    /**
     * Cập nhật thông tin cá nhân.
     * PUT /api/v1/customer/profile/update
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse updated = customerProfileService.updateProfile(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin cá nhân thành công.", updated));
    }

    /**
     * Tải lên và đổi Ảnh đại diện Avatar via Cloudinary (Rate limit: 5 lần / 10 phút).
     * POST /api/v1/customer/profile/avatar
     */
    @PostMapping("/avatar")
    @RateLimit(key = "avatar", maxRequests = 5, windowSeconds = 600)
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        UserProfileResponse updated = customerProfileService.updateAvatar(authentication.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh đại diện thành công.", updated));
    }

    /**
     * Thay đổi Mật khẩu tài khoản (Rate limit: 3 lần / 15 phút).
     * Tự động thu hồi token cũ & cấp cặp Token mới vào Cookie HttpOnly (Seamless UX).
     * PUT /api/v1/customer/profile/change-password
     */
    @PutMapping("/change-password")
    @RateLimit(key = "change_password", maxRequests = 3, windowSeconds = 900)
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletResponse response) {
        AuthTokens tokens = customerProfileService.changePassword(authentication.getName(), request);

        // Đính kèm cặp Token mới vào Cookies của phiên hiện tại (Seamless UX)
        CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, tokens.getAccessToken(), CookieUtils.ACCESS_TOKEN_MAX_AGE);
        CookieUtils.addTokenCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, tokens.getRawRefreshToken(), CookieUtils.REFRESH_TOKEN_MAX_AGE);

        return ResponseEntity.ok(ApiResponse.success("Thay đổi mật khẩu thành công."));
    }
}
