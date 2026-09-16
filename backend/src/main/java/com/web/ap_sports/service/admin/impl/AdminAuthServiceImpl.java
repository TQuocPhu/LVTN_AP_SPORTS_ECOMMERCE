package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.admin.AdminLoginRequest;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.RolePermission;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.repository.RefreshTokenRepository;
import com.web.ap_sports.repository.RolePermissionRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminAuthService;
import com.web.ap_sports.util.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Lớp triển khai AdminAuthService cho Admin Portal.
 * Xử lý xác thực riêng cho các vai trò quản trị (ADMIN, STAFF, WAREHOUSE_MANAGER).
 * Từ chối hoàn toàn người dùng thuộc vai trò CUSTOMER.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminAuthServiceImpl implements AdminAuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserResponse login(AdminLoginRequest request, HttpServletResponse response) {
        // 1. Tìm User theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản không tồn tại."));

        // 2. Kiểm tra trạng thái tài khoản active
        if (user.getStatus() != UserStatus.active) {
            throw new IllegalStateException("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
        }

        // 3. Kiểm tra vai trò Quản trị (Từ chối CUSTOMER)
        if ("CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            throw new SecurityException("Bạn không có quyền truy cập vào hệ thống quản trị!");
        }

        // 4. Kiểm tra mật khẩu BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ.");
        }

        // 5. Sinh AccessToken
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().getName());

        // 6. Sinh RefreshToken gốc & băm HASH HMAC-SHA256 lưu CSDL
        String rawRefreshToken = jwtTokenProvider.generateRawRefreshToken();
        String hashedRefreshToken = jwtTokenProvider.hashRefreshToken(rawRefreshToken);

        // Thu hồi toàn bộ refresh tokens cũ của user này
        refreshTokenRepository.revokeAllUserTokens(user);

        // Lưu RefreshToken băm mới vào DB
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(hashedRefreshToken)
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // 7. Thiết lập Cookies an toàn gửi về Client
        CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, accessToken, CookieUtils.ACCESS_TOKEN_MAX_AGE);
        CookieUtils.addTokenCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, rawRefreshToken, CookieUtils.REFRESH_TOKEN_MAX_AGE);

        log.info("Admin đăng nhập thành công: email={}, role={}", user.getEmail(), user.getRole().getName());
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getCurrentAdmin(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("Chưa đăng nhập hoặc phiên làm việc admin đã hết hạn.");
        }

        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người dùng."));

        if ("CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            throw new SecurityException("Bạn không có quyền truy cập vào hệ thống quản trị!");
        }

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = CookieUtils.extractCookieValue(request, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
        if (rawToken != null) {
            String hashedToken = jwtTokenProvider.hashRefreshToken(rawToken);
            refreshTokenRepository.findByToken(hashedToken).ifPresent(refreshToken -> {
                refreshToken.setRevoked(true);
                refreshTokenRepository.save(refreshToken);
            });
        }

        CookieUtils.deleteCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME);
        CookieUtils.deleteCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
        log.info("Admin đăng xuất thành công.");
    }

    // --- Helper Methods ---

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
