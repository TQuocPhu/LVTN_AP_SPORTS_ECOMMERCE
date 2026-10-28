package com.web.ap_sports.service.common.impl;

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
import com.web.ap_sports.service.common.DemoLogisticsAuthService;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class DemoLogisticsAuthServiceImpl implements DemoLogisticsAuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public UserResponse login(AdminLoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Thông tin đăng nhập không hợp lệ."));

        if (user.getStatus() != UserStatus.active) {
            throw new IllegalStateException("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
        }

        String role = user.getRole().getName();
        if (!"GHN_STATION".equalsIgnoreCase(role) && !"GHN_SHIPPER".equalsIgnoreCase(role)) {
            throw new SecurityException("Bạn không có quyền truy cập vào cổng Logistics! Chỉ dành riêng cho nhân viên GHN.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), role);
        String rawRefreshToken = jwtTokenProvider.generateRawRefreshToken();
        String hashedRefreshToken = jwtTokenProvider.hashRefreshToken(rawRefreshToken);

        refreshTokenRepository.revokeAllUserTokens(user);

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(hashedRefreshToken)
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, accessToken, CookieUtils.ACCESS_TOKEN_MAX_AGE);
        CookieUtils.addTokenCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, rawRefreshToken, CookieUtils.REFRESH_TOKEN_MAX_AGE);

        log.info("GHN Logistics đăng nhập thành công: email={}, role={}", user.getEmail(), role);
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse getCurrentUser(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
            throw new SecurityException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
        }

        String email = (String) authentication.getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người dùng."));

        String role = user.getRole().getName();
        if (!"GHN_STATION".equalsIgnoreCase(role) && !"GHN_SHIPPER".equalsIgnoreCase(role)) {
            throw new SecurityException("Bạn không có quyền truy cập vào cổng Logistics!");
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
        log.info("GHN Logistics đăng xuất thành công.");
    }

    @Override
    @Transactional
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = CookieUtils.extractCookieValue(request, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
        if (rawToken == null || rawToken.isBlank()) {
            throw new SecurityException("Refresh Token không tồn tại trong Cookie.");
        }

        String hashedToken = jwtTokenProvider.hashRefreshToken(rawToken);
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new SecurityException("Refresh Token không hợp lệ hoặc đã bị thu hồi."));

        if (refreshTokenEntity.isRevoked() || refreshTokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new SecurityException("Refresh Token đã hết hạn hoặc bị thu hồi.");
        }

        User user = refreshTokenEntity.getUser();
        if (user.getStatus() != UserStatus.active) {
            throw new SecurityException("Tài khoản nhân sự GHN không hoạt động.");
        }

        String role = user.getRole().getName();
        if (!"GHN_STATION".equalsIgnoreCase(role) && !"GHN_SHIPPER".equalsIgnoreCase(role)) {
            throw new SecurityException("Bạn không có quyền truy cập vào cổng Logistics!");
        }

        // 1. Thu hồi token cũ (Refresh Token Rotation)
        refreshTokenEntity.setRevoked(true);
        refreshTokenRepository.save(refreshTokenEntity);

        // 2. Sinh cặp token mới
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), role);
        String newRawRefreshToken = jwtTokenProvider.generateRawRefreshToken();
        String newHashedRefreshToken = jwtTokenProvider.hashRefreshToken(newRawRefreshToken);

        RefreshToken newEntity = RefreshToken.builder()
                .user(user)
                .token(newHashedRefreshToken)
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newEntity);

        // 3. Cập nhật HttpOnly cookies
        CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, newAccessToken, CookieUtils.ACCESS_TOKEN_MAX_AGE);
        CookieUtils.addTokenCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, newRawRefreshToken, CookieUtils.REFRESH_TOKEN_MAX_AGE);
        log.info("Xoay vòng Refresh Token (Rotation) thành công cho nhân sự GHN: {}", user.getEmail());
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
