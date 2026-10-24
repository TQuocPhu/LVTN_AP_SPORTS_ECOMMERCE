package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.customer.ChangePasswordRequest;
import com.web.ap_sports.dto.request.customer.UpdateProfileRequest;
import com.web.ap_sports.dto.response.customer.AuthTokens;
import com.web.ap_sports.dto.response.customer.UserProfileResponse;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.RefreshTokenRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.CloudinaryService.CloudinaryUploadResult;
import com.web.ap_sports.service.customer.CustomerProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

/**
 * Lớp triển khai logic nghiệp vụ quản lý Hồ sơ cá nhân Khách hàng.
 *
 * Bảo mật & Ràng buộc tài khoản Google OAuth2:
 *  - Tài khoản Google (`googleId != null`):
 *      + Không cho phép thay đổi Ảnh đại diện (sử dụng trực tiếp URL ảnh từ Google, không gọi Cloudinary).
 *      + Không cho phép thay đổi Họ tên và Email, chỉ cho phép cập nhật Số điện thoại (và Địa chỉ liên hệ).
 *      + Không cho phép thay đổi Mật khẩu.
 *  - Tài khoản thường (`googleId == null`):
 *      + Avatar: validate file (size/MIME) trước khi upload, xóa ảnh cũ trên Cloudinary sau khi upload mới.
 *      + Đổi mật khẩu: thu hồi toàn bộ Refresh Token cũ & cấp token mới ngay cho phiên hiện tại (Seamless UX).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerProfileServiceImpl implements CustomerProfileService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
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
        boolean isGoogleAccount = StringUtils.hasText(user.getGoogleId());

        if (isGoogleAccount) {
            // Tài khoản Google: Chặn tuyệt đối nếu cố tình gửi tên khác với tên đồng bộ từ Google
            if (StringUtils.hasText(request.getName())
                    && user.getName() != null
                    && !request.getName().trim().equals(user.getName().trim())) {
                throw new IllegalArgumentException("Tài khoản đăng nhập bằng Google không được phép thay đổi họ và tên.");
            }
        } else {
            // Tài khoản thường: cập nhật Họ và tên đã được validate @NotBlank tại DTO
            user.setName(request.getName().trim());
        }
        // Cả tài khoản thường và tài khoản Google đều được cập nhật Số điện thoại và Địa chỉ
        if (request.getPhoneNumber() != null) {
            String trimmedPhone = request.getPhoneNumber().trim();
            user.setPhoneNumber(trimmedPhone.isEmpty() ? null : trimmedPhone);
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        User updatedUser = userRepository.save(user);
        log.info("Cập nhật thông tin cá nhân thành công cho user ID: {} (isGoogleAccount={})", user.getId(), isGoogleAccount);
        return mapToResponse(updatedUser);
    }

    /**
     * Upload avatar mới lên Cloudinary và tự động xóa avatar cũ để tránh rò rỉ storage.
     * Chặn hoàn toàn nếu tài khoản là tài khoản Google (`googleId != null`).
     */
    @Override
    @Transactional
    public UserProfileResponse updateAvatar(String email, MultipartFile file) {
        User user = getUserByEmail(email);

        // Chặn chọn/đổi ảnh đại diện đối với tài khoản Google
        if (StringUtils.hasText(user.getGoogleId())) {
            throw new IllegalArgumentException("Tài khoản đăng nhập bằng Google sử dụng ảnh đại diện đồng bộ từ Google, không thể thay đổi ảnh.");
        }

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
     * Đổi mật khẩu, thu hồi toàn bộ Refresh Token cũ (vô hiệu các phiên ở thiết bị khác)
     * và cấp cặp Access Token & Refresh Token mới cho phiên hiện tại (Seamless UX).
     * Chặn hoàn toàn nếu tài khoản là tài khoản Google (`googleId != null`).
     */
    @Override
    @Transactional
    public AuthTokens changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);

        // Chặn đổi mật khẩu đối với tài khoản Google
        if (StringUtils.hasText(user.getGoogleId())) {
            throw new IllegalArgumentException("Tài khoản đăng nhập bằng Google không sử dụng mật khẩu riêng nên không thể thay đổi mật khẩu.");
        }

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

        // 4. Vô hiệu hóa toàn bộ Refresh Token cũ của user này
        refreshTokenRepository.revokeAllUserTokens(user);
        log.info("Đã thu hồi tất cả Refresh Token cũ của user ID: {}", user.getId());

        // 5. Sinh cặp Token mới cho phiên làm việc hiện tại (Seamless UX)
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

        return AuthTokens.builder()
                .accessToken(newAccessToken)
                .rawRefreshToken(newRawRefreshToken)
                .build();
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản người dùng."));
    }

    private UserProfileResponse mapToResponse(User user) {
        boolean isGoogle = StringUtils.hasText(user.getGoogleId());
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().getName() : "CUSTOMER")
                .status(user.getStatus() != null ? user.getStatus().name() : "active")
                .googleId(user.getGoogleId())
                .googleAccount(isGoogle)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
