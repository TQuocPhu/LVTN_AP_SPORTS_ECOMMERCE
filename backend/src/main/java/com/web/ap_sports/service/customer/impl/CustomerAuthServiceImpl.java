package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.customer.LoginCustomerRequest;
import com.web.ap_sports.dto.request.customer.RegisterCustomerRequest;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.repository.RefreshTokenRepository;
import com.web.ap_sports.repository.RoleRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.customer.CustomerAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lớp triển khai (Implementation) của CustomerAuthService.
 * Quản lý toàn bộ logic Đăng ký, Kích hoạt, Đăng nhập (Cookies & HMAC-SHA256 Refresh Token) và Đăng xuất.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerAuthServiceImpl implements CustomerAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    @Override
    @Transactional
    public void register(RegisterCustomerRequest request) {
        // 1. Kiểm tra xác nhận mật khẩu khớp
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu không khớp.");
        }

        // 2. Kiểm tra Email đã tồn tại
        userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
            if (existingUser.getStatus() == UserStatus.pending) {
                throw new IllegalStateException("Email đang chờ xác nhận. Vui lòng kiểm tra email của bạn để xác nhận tài khoản.");
            }
            throw new IllegalArgumentException("Email đã được sử dụng bởi một tài khoản khác.");
        });

        // 3. Lấy Role CUSTOMER (Default ID = 3 hoặc tìm theo name)
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.findById(3L)
                        .orElseThrow(() -> new IllegalStateException("Không tìm thấy vai trò CUSTOMER hệ thống.")));

        // 4. Sinh Token kích hoạt 64 ký tự ngẫu nhiên
        String activationToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");

        // 5. Tạo đối tượng User mới trạng thái pending
        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(UserStatus.pending)
                .role(customerRole)
                .activationToken(activationToken)
                .build();

        userRepository.save(newUser);

        // 6. Gửi Email kích hoạt qua Spring Mail
        emailService.sendActivationEmail(newUser.getEmail(), newUser.getName(), activationToken);
    }

    @Override
    @Transactional
    public void activateAccount(String token) {
        User user = userRepository.findByActivationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token kích hoạt không hợp lệ hoặc đã hết hạn."));

        user.setStatus(UserStatus.active);
        user.setActivationToken(null);
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Kích hoạt tài khoản thành công cho user email: {}", user.getEmail());
    }

    @Override
    @Transactional
    public UserResponse login(LoginCustomerRequest request, HttpServletResponse response) {
        // 1. Tìm User theo email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt."));

        // 2. Kiểm tra trạng thái tài khoản active
        if (user.getStatus() != UserStatus.active) {
            throw new IllegalStateException("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.");
        }

        // 3. Kiểm tra vai trò CUSTOMER
        if (!"CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            throw new SecurityException("Bạn không có quyền truy cập vào tài khoản này!");
        }

        // 4. Kiểm tra mật khẩu BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.");
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

        // 7. Thiết lập Cookies an toàn gửi về Client (credentials: 'include')
        addTokenCookie(response, "accessToken", accessToken, 1800); // 30 phút
        addTokenCookie(response, "refreshToken", rawRefreshToken, 604800); // 7 ngày

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        // 1. Đọc RefreshToken gốc từ Cookies nếu có để thu hồi trong DB
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    String rawToken = cookie.getValue();
                    String hashedToken = jwtTokenProvider.hashRefreshToken(rawToken);
                    refreshTokenRepository.findByToken(hashedToken).ifPresent(refreshToken -> {
                        refreshToken.setRevoked(true);
                        refreshTokenRepository.save(refreshToken);
                    });
                }
            }
        }

        // 2. Thu hồi Cookies trên Client
        deleteCookie(response, "accessToken");
        deleteCookie(response, "refreshToken");
    }

    @Override
    public UserResponse getCurrentUser(HttpServletRequest request) {
        String accessToken = extractCookieValue(request, "accessToken");
        if (accessToken == null || !jwtTokenProvider.validateToken(accessToken)) {
            throw new SecurityException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn.");
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(accessToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người dùng."));

        return mapToUserResponse(user);
    }

    // --- Helper Methods ---

    private void addTokenCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Đặt true khi chạy HTTPS Production
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }

    private void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .roleName(user.getRole().getName())
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
