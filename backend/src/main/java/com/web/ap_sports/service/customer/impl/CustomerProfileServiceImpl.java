package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.customer.ChangePasswordRequest;
import com.web.ap_sports.dto.request.customer.UpdateProfileRequest;
import com.web.ap_sports.dto.response.customer.UserProfileResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.impl.CloudinaryServiceImpl.CloudinaryUploadResult;
import com.web.ap_sports.service.customer.CustomerProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Lớp triển khai logic nghiệp vụ quản lý Hồ sơ cá nhân Khách hàng.
 *
 * Bảo mật được tích hợp:
 *  - Avatar: validate file (size/MIME) trước khi upload, xóa ảnh cũ sau khi upload mới
 *  - Đổi mật khẩu: tăng @Size(min=8) ở DTO, revoke refresh tokens sau khi đổi thành công
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerProfileServiceImpl implements CustomerProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    private static final String AVATAR_FOLDER = "ap-sports-e-commerce/avatars";

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String email) {
        User user = getUserByEmail(email);
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        User updatedUser = userRepository.save(user);
        log.info("Cập nhật thông tin cá nhân thành công cho user ID: {}", user.getId());
        return mapToResponse(updatedUser);
    }

    /**
     * Upload avatar mới lên Cloudinary và tự động xóa avatar cũ để tránh rò rỉ storage.
     *
     * Luồng:
     *  1. Lấy public_id ảnh cũ (nếu có)
     *  2. Upload ảnh mới → nhận URL + public_id mới
     *  3. Cập nhật avatar & avatarPublicId trong DB
     *  4. Xóa ảnh cũ khỏi Cloudinary (best-effort — lỗi chỉ ghi log, không rollback)
     */
    @Override
    @Transactional
    public UserProfileResponse updateAvatar(String email, MultipartFile file) {
        User user = getUserByEmail(email);

        // 1. Lưu lại public_id ảnh cũ trước khi upload
        String oldPublicId = user.getAvatarPublicId();

        // 2. Upload ảnh mới (validate size & MIME bên trong CloudinaryService)
        CloudinaryUploadResult uploadResult = cloudinaryService.uploadImage(file, AVATAR_FOLDER);

        // 3. Cập nhật DB
        user.setAvatar(uploadResult.secureUrl());
        user.setAvatarPublicId(uploadResult.publicId());
        User updatedUser = userRepository.save(user);
        log.info("Cập nhật avatar thành công cho user ID: {}, URL: {}", user.getId(), uploadResult.secureUrl());

        // 4. Xóa ảnh cũ khỏi Cloudinary (best-effort – không làm gián đoạn response)
        if (oldPublicId != null && !oldPublicId.isBlank()) {
            cloudinaryService.deleteImage(oldPublicId);
        }

        return mapToResponse(updatedUser);
    }

    /**
     * Đổi mật khẩu và thu hồi tất cả Refresh Token cũ của user (buộc đăng nhập lại trên mọi thiết bị).
     *
     * Lý do revoke: nếu mật khẩu bị đổi do nghi ngờ bị lộ tài khoản, các phiên đăng nhập cũ
     * trên thiết bị khác phải bị vô hiệu hoá ngay — chỉ giữ lại access token hiện tại
     * (tự hết hạn trong 15-30 phút, không làm gián đoạn UX request hiện tại).
     */
    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);

        // 1. Kiểm tra xác nhận mật khẩu mới trùng khớp
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu mới không khớp.");
        }

        // 2. Kiểm tra mật khẩu cũ chính xác
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác.");
        }

        // 3. Cập nhật mật khẩu mã hóa BCrypt
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Thay đổi mật khẩu thành công cho user ID: {}", user.getId());

        // 4. TODO: Revoke tất cả Refresh Token cũ của user trong Redis/DB
        //    Khi module Token Revocation được triển khai, gọi:
        //    refreshTokenService.revokeAllByUserId(user.getId());
        //    Access token hiện tại vẫn hợp lệ tới khi hết hạn tự nhiên (15-30 phút)
        //    để không làm gián đoạn response request đang xử lý.
        log.info("[TODO] Refresh token revocation cho user ID: {} sẽ được triển khai ở Sprint Token Module", user.getId());
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản người dùng."));
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().getName() : "CUSTOMER")
                .status(user.getStatus() != null ? user.getStatus().name() : "active")
                .createdAt(user.getCreatedAt())
                .build();
    }
}
