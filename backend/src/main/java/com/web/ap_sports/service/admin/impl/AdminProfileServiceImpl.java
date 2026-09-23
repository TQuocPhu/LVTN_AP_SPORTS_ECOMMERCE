package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.admin.ChangeAdminPasswordRequest;
import com.web.ap_sports.dto.request.admin.UpdateAdminProfileRequest;
import com.web.ap_sports.dto.response.customer.AuthTokens;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.RolePermission;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.RefreshTokenRepository;
import com.web.ap_sports.repository.RolePermissionRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminProfileService;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.impl.CloudinaryServiceImpl.CloudinaryUploadResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Lớp triển khai AdminProfileService cho Admin Portal.
 * Xử lý cập nhật hồ sơ cá nhân, tải ảnh avatar lên Cloudinary, đổi mật khẩu & làm mới token cookies.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminProfileServiceImpl implements AdminProfileService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final CloudinaryService cloudinaryService;

    private static final String AVATAR_FOLDER = "ap-sports-e-commerce/avatars";

    @Override
    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = getAdminUserByEmail(email);
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateAdminProfileRequest request) {
        User user = getAdminUserByEmail(email);

        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        User updatedUser = userRepository.save(user);
        log.info("Cập nhật thông tin hồ sơ Admin thành công cho ID: {}, email: {}", user.getId(), user.getEmail());
        return mapToUserResponse(updatedUser);
    }

    /**
     * Tải lên avatar mới lên Cloudinary và xóa avatar cũ của Admin nếu có.
     */
    @Override
    @Transactional
    public UserResponse updateAvatar(String email, MultipartFile file) {
        User user = getAdminUserByEmail(email);

        // 1. Lưu public_id cũ của ảnh trước đó
        String oldPublicId = user.getAvatarPublicId();

        // 2. Tải ảnh mới lên Cloudinary
        CloudinaryUploadResult uploadResult = cloudinaryService.uploadImage(file, AVATAR_FOLDER);

        // 3. Cập nhật URL & public_id mới vào DB
        user.setAvatar(uploadResult.secureUrl());
        user.setAvatarPublicId(uploadResult.publicId());
        User updatedUser = userRepository.save(user);

        log.info("Cập nhật Avatar Cloudinary thành công cho Admin ID: {}, URL: {}", user.getId(), uploadResult.secureUrl());

        // 4. Xóa ảnh cũ khỏi Cloudinary (best-effort)
        if (oldPublicId != null && !oldPublicId.isBlank()) {
            cloudinaryService.deleteImage(oldPublicId);
        }

        return mapToUserResponse(updatedUser);
    }

    /**
     * Đổi mật khẩu tài khoản Admin, thu hồi toàn bộ Refresh Token cũ và cấp cặp Token mới.
     */
    @Override
    @Transactional
    public AuthTokens changePassword(String email, ChangeAdminPasswordRequest request) {
        User user = getAdminUserByEmail(email);

        // 1. Kiểm tra xác nhận mật khẩu trùng khớp
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu mới không khớp.");
        }

        // 2. Kiểm tra mật khẩu cũ chính xác
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác.");
        }

        // 3. Mã hóa và cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Revoke toàn bộ Refresh Token cũ của Admin
        refreshTokenRepository.revokeAllUserTokens(user);

        // 5. Cấp cặp Access Token & Refresh Token mới cho phiên hiện tại
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().getName());
        String newRawRefreshToken = jwtTokenProvider.generateRawRefreshToken();
        String newHashedRefreshToken = jwtTokenProvider.hashRefreshToken(newRawRefreshToken);

        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(newHashedRefreshToken)
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshTokenEntity);

        log.info("Đổi mật khẩu tài khoản Admin thành công cho ID: {}", user.getId());

        return AuthTokens.builder()
                .accessToken(newAccessToken)
                .rawRefreshToken(newRawRefreshToken)
                .build();
    }

    // --- Helper Methods ---

    private User getAdminUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản người dùng."));

        if ("CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            throw new SecurityException("Tài khoản Khách hàng không thể thao tác hồ sơ Quản trị!");
        }

        return user;
    }

    private UserResponse mapToUserResponse(User user) {
        List<String> permissions = rolePermissionRepository.findByRole(user.getRole())
                .stream()
                .map(RolePermission::getPermission)
                .map(p -> p.getName())
                .toList();

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .roleName(user.getRole().getName())
                .permissions(permissions)
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
