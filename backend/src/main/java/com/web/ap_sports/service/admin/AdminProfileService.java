package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.ChangeAdminPasswordRequest;
import com.web.ap_sports.dto.request.admin.UpdateAdminProfileRequest;
import com.web.ap_sports.dto.response.customer.AuthTokens;
import com.web.ap_sports.dto.response.customer.UserResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service quản lý Hồ sơ tài khoản Admin Portal.
 */
public interface AdminProfileService {

    /**
     * Lấy thông tin chi tiết của Admin đang đăng nhập theo email.
     */
    UserResponse getProfile(String email);

    /**
     * Cập nhật thông tin cá nhân của Admin (Họ tên, SĐT, Địa chỉ).
     */
    UserResponse updateProfile(String email, UpdateAdminProfileRequest request);

    /**
     * Cập nhật Ảnh đại diện (Avatar) của Admin qua Cloudinary.
     */
    UserResponse updateAvatar(String email, MultipartFile file);

    /**
     * Đổi mật khẩu tài khoản Admin, thu hồi refresh tokens cũ và cấp cặp Token mới.
     */
    AuthTokens changePassword(String email, ChangeAdminPasswordRequest request);
}
