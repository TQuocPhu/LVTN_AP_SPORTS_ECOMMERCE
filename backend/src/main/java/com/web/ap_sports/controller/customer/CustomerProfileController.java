package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.ChangePasswordRequest;
import com.web.ap_sports.dto.request.customer.UpdateProfileRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.UserProfileResponse;
import com.web.ap_sports.service.customer.CustomerProfileService;
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
     * Tải lên và đổi Ảnh đại diện Avatar via Cloudinary.
     * POST /api/v1/customer/profile/avatar
     */
    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        UserProfileResponse updated = customerProfileService.updateAvatar(authentication.getName(), file);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ảnh đại diện thành công.", updated));
    }

    /**
     * Thay đổi Mật khẩu tài khoản.
     * PUT /api/v1/customer/profile/change-password
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        customerProfileService.changePassword(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Thay đổi mật khẩu thành công."));
    }
}
