package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.ChangePasswordRequest;
import com.web.ap_sports.dto.request.customer.UpdateProfileRequest;
import com.web.ap_sports.dto.response.customer.AuthTokens;
import com.web.ap_sports.dto.response.customer.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interface dịch vụ quản lý Hồ sơ cá nhân Khách hàng.
 */
public interface CustomerProfileService {

    /**
     * Lấy thông tin Hồ sơ cá nhân của người dùng dựa theo Email trong SecurityContext.
     */
    UserProfileResponse getProfile(String email);

    /**
     * Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ).
     */
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);

    /**
     * Tải lên và cập nhật Ảnh đại diện (Avatar) qua Cloudinary (thư mục "ap-sports-e-commerce/avatars").
     */
    UserProfileResponse updateAvatar(String email, MultipartFile file);

    /**
     * Thay đổi mật khẩu tài khoản (Kiểm tra mật khẩu cũ & mật khẩu mới).
     * Thu hồi tất cả Refresh Token cũ và cấp cặp Access Token & Refresh Token mới cho phiên hiện tại (Seamless UX).
     */
    AuthTokens changePassword(String email, ChangePasswordRequest request);
}
