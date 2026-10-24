package com.web.ap_sports.service.customer.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.customer.ForgotPasswordRequest;
import com.web.ap_sports.dto.request.customer.GoogleLoginRequest;
import com.web.ap_sports.dto.request.customer.LoginCustomerRequest;
import com.web.ap_sports.dto.request.customer.RegisterCustomerRequest;
import com.web.ap_sports.dto.request.customer.ResetPasswordRequest;
import com.web.ap_sports.dto.response.customer.CustomerLoginResponse;
import com.web.ap_sports.dto.response.customer.TokenResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.customer.UserSessionResponse;
import com.web.ap_sports.entity.DeviceToken;
import com.web.ap_sports.entity.PasswordResetToken;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.repository.DeviceTokenRepository;
import com.web.ap_sports.repository.PasswordResetTokenRepository;
import com.web.ap_sports.repository.RefreshTokenRepository;
import com.web.ap_sports.repository.RoleRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.customer.CustomerAuthService;
import com.web.ap_sports.util.CookieUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Lớp triển khai (Implementation) của CustomerAuthService.
 * Quản lý toàn bộ logic Đăng ký, Kích hoạt, Đăng nhập truyền thống, Đăng nhập bằng Google OAuth2,
 * Cấp phát cặp Token (Access Token RS256 & Refresh Token HMAC-SHA256 xoay vòng),
 * Quản lý đa thiết bị (Max 3 thiết bị LRU Eviction), Đăng xuất, Quên & Đặt lại mật khẩu.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerAuthServiceImpl implements CustomerAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Value("${app.google.client-secret:}")
    private String googleClientSecret;

    @Override
    public String getGoogleClientId() {
        return googleClientId != null ? googleClientId.trim() : "";
    }

    @Override
    @Transactional
    public void register(RegisterCustomerRequest request) {
        // 1. Kiểm tra xác nhận mật khẩu khớp
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Xác nhận mật khẩu không khớp.");
        }

        // 2. Kiểm tra Email đã tồn tại
        userRepository.findByEmail(request.getEmail().trim().toLowerCase()).ifPresent(existingUser -> {
            if (StringUtils.hasText(existingUser.getGoogleId())) {
                throw new IllegalArgumentException(
                        "Email này đã được liên kết với tài khoản Google. Vui lòng sử dụng chức năng 'Đăng nhập bằng Google'.");
            }
            if (existingUser.getStatus() == UserStatus.pending) {
                throw new IllegalStateException(
                        "Email đang chờ xác nhận. Vui lòng kiểm tra email của bạn để xác nhận tài khoản.");
            }
            throw new IllegalArgumentException("Email đã được sử dụng bởi một tài khoản khác.");
        });

        // 3. Lấy Role CUSTOMER (Default ID = 3 hoặc tìm theo name)
        Role customerRole = getCustomerRole();

        // 4. Sinh Token kích hoạt 64 ký tự ngẫu nhiên
        String activationToken = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");

        // 5. Tạo đối tượng User mới trạng thái pending
        User newUser = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
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
    public CustomerLoginResponse login(LoginCustomerRequest request, String clientType, HttpServletResponse response) {
        return login(request, clientType, null, response);
    }

    @Override
    @Transactional
    public CustomerLoginResponse login(LoginCustomerRequest request, String clientType, HttpServletRequest httpRequest, HttpServletResponse response) {
        // 1. Tìm User theo email
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt."));

        // 2. Kiểm tra trạng thái tài khoản active
        if (user.getStatus() != UserStatus.active) {
            throw new IllegalStateException("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.");
        }

        // 3. Kiểm tra vai trò CUSTOMER
        if (!"CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            throw new SecurityException("Bạn không có quyền truy cập vào tài khoản này!");
        }

        // 4. Nếu tài khoản đã liên kết Google (google_id != null) -> Chặn đăng nhập bằng mật khẩu thường
        if (StringUtils.hasText(user.getGoogleId())) {
            throw new IllegalArgumentException(
                    "Tài khoản này được đăng nhập thông qua Google. Vui lòng chọn 'Đăng nhập bằng Google' bên dưới.");
        }

        // 5. Kiểm tra mật khẩu BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.");
        }

        // 6. Cấp phát cặp Access Token (RS256) và Refresh Token (HMAC-SHA256 xoay vòng)
        return issueAuthTokensAndSession(user, clientType, httpRequest, response, false);
    }

    /**
     * Đăng nhập hoặc Đăng ký tự động bằng Google OAuth2.
     * Hỗ trợ cả 2 luồng:
     * 1. Web Client (Google Identity Services - GIS): truyền trực tiếp `idToken`.
     * 2. Mobile Client (React Native / Expo): truyền `code` + `redirectUri`, Backend dùng `CUSTOMER_ID` và `CUSTOMER_SECRET_CODE`
     *    để đổi `code` lấy `idToken` trực tiếp từ máy chủ Google.
     *
     * Áp dụng Phương án 6A khi trùng Email với tài khoản thường:
     * - Kiểm tra chặn tuyệt đối nếu email thuộc tài khoản quản trị/nội bộ (ADMIN, STAFF, WAREHOUSE_MANAGER, GHN_*).
     * - Kiểm tra chặn tuyệt đối nếu tài khoản đang bị khóa (banned) hoặc đã xóa (deleted).
     * - Nếu tài khoản CUSTOMER chưa có `google_id`: tự động hợp nhất sang tài khoản Google, xóa ảnh Cloudinary cũ (nếu có),
     *   cập nhật ảnh đại diện + tên từ Google, đặt mật khẩu ngẫu nhiên 64 ký tự băm BCrypt, hủy token quên mật khẩu cũ,
     *   và thu hồi toàn bộ Refresh Token chưa revoked của các phiên mật khẩu trước đó.
     */
    @Override
    @Transactional
    public CustomerLoginResponse loginWithGoogle(GoogleLoginRequest request, String clientType, HttpServletRequest httpRequest, HttpServletResponse response) {
        if (!StringUtils.hasText(googleClientId)) {
            throw new IllegalStateException("Hệ thống chưa cấu hình Google Client ID (CUSTOMER_ID).");
        }

        // 1. Lấy idToken từ request (trực tiếp hoặc đổi từ Authorization Code của Mobile App)
        String idTokenString = resolveGoogleIdToken(request);

        // 2. Xác thực chữ ký số RSA-256 và tính hợp lệ của idToken với Google
        GoogleIdToken.Payload payload = verifyGoogleIdToken(idTokenString);

        String googleSub = payload.getSubject();
        String email = payload.getEmail() != null ? payload.getEmail().trim().toLowerCase() : null;
        boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());
        String googleName = (String) payload.get("name");
        String googlePicture = (String) payload.get("picture");

        if (!StringUtils.hasText(googleSub) || !StringUtils.hasText(email) || !emailVerified) {
            throw new SecurityException("Tài khoản Google không hợp lệ hoặc chưa xác thực địa chỉ email.");
        }

        // 3. Tìm kiếm User theo email (hoặc theo googleId)
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.findByGoogleId(googleSub).orElse(null));

        boolean revokeAllExistingSessions = false;

        if (user != null) {
            // TRƯỜNG HỢP A: Tài khoản đã tồn tại trong bảng users
            // A1. Kiểm tra vai trò: Tuyệt đối cấm tài khoản nội bộ (ADMIN, STAFF, WAREHOUSE_MANAGER, GHN_*) đăng nhập qua cổng khách hàng
            if (user.getRole() == null || !"CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
                log.warn("Chặn đăng nhập Google vào tài khoản nội bộ email: {}, role: {}",
                        email, user.getRole() != null ? user.getRole().getName() : "NULL");
                throw new SecurityException("Bạn không có quyền truy cập vào cổng khách hàng bằng tài khoản quản trị/nội bộ!");
            }

            // A2. Kiểm tra trạng thái khóa (banned) hoặc đã xóa (deleted)
            if (user.getStatus() == UserStatus.banned || user.getStatus() == UserStatus.deleted) {
                throw new IllegalStateException("Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ bộ phận hỗ trợ.");
            }

            // A3. Kiểm tra xung đột googleId (nếu tài khoản đã gắn googleId khác với googleSub hiện tại)
            if (StringUtils.hasText(user.getGoogleId()) && !user.getGoogleId().equals(googleSub)) {
                throw new SecurityException("Định danh tài khoản Google không khớp với dữ liệu hệ thống.");
            }

            // A4. Phương án 6A: Nếu tài khoản trước đó là tài khoản thường (googleId == null, đang pending hoặc active)
            boolean isConvertingFromLocalAccount = !StringUtils.hasText(user.getGoogleId());
            if (isConvertingFromLocalAccount) {
                log.info("Hợp nhất tài khoản thường (ID: {}, Email: {}) sang tài khoản Google (googleId: {})",
                        user.getId(), email, googleSub);

                user.setGoogleId(googleSub);
                user.setStatus(UserStatus.active);
                user.setActivationToken(null);
                if (user.getEmailVerifiedAt() == null) {
                    user.setEmailVerifiedAt(LocalDateTime.now());
                }

                // Đồng bộ tên hiển thị từ Google
                if (StringUtils.hasText(googleName)) {
                    user.setName(googleName.trim());
                }

                // Nếu trước đó tài khoản thường từng upload ảnh lên Cloudinary -> xóa ảnh cũ trên Cloudinary để tránh rò rỉ bộ nhớ
                String oldPublicId = user.getAvatarPublicId();
                if (StringUtils.hasText(oldPublicId)) {
                    cloudinaryService.deleteImage(oldPublicId);
                    user.setAvatarPublicId(null);
                }

                // Lưu trực tiếp đường dẫn ảnh đại diện từ Google CDN
                if (StringUtils.hasText(googlePicture)) {
                    user.setAvatar(googlePicture.trim());
                }

                // Vô hiệu hóa mật khẩu cũ bằng chuỗi ngẫu nhiên 64 ký tự băm BCrypt (thỏa mãn NOT NULL dưới DB)
                user.setPassword(generateRandomEncodedPassword());

                // Xóa mọi token đặt lại mật khẩu đang chờ (nếu có)
                passwordResetTokenRepository.deleteByEmail(email);

                // Đánh dấu bắt buộc thu hồi toàn bộ Refresh Token chưa revoked của các phiên đăng nhập mật khẩu cũ
                revokeAllExistingSessions = true;
            } else {
                // A5. Tài khoản đã là tài khoản Google từ trước -> Đồng bộ lại tên và ảnh mới nhất từ Google
                if (StringUtils.hasText(googleName)) {
                    user.setName(googleName.trim());
                }
                if (StringUtils.hasText(googlePicture)) {
                    user.setAvatar(googlePicture.trim());
                }
                if (user.getStatus() == UserStatus.pending) {
                    user.setStatus(UserStatus.active);
                    user.setActivationToken(null);
                }
                if (user.getEmailVerifiedAt() == null) {
                    user.setEmailVerifiedAt(LocalDateTime.now());
                }
            }

            user = userRepository.save(user);
        } else {
            // TRƯỜNG HỢP B: Khách hàng mới hoàn toàn lần đầu đăng nhập bằng Google
            Role customerRole = getCustomerRole();

            User newGoogleUser = User.builder()
                    .name(StringUtils.hasText(googleName) ? googleName.trim() : email.split("@")[0])
                    .email(email)
                    .password(generateRandomEncodedPassword())
                    .status(UserStatus.active)
                    .avatar(StringUtils.hasText(googlePicture) ? googlePicture.trim() : null)
                    .avatarPublicId(null)
                    .role(customerRole)
                    .googleId(googleSub)
                    .activationToken(null)
                    .emailVerifiedAt(LocalDateTime.now())
                    .build();

            user = userRepository.save(newGoogleUser);
            log.info("Tạo mới tài khoản Khách hàng từ Google OAuth2 thành công: ID={}, email={}", user.getId(), email);
        }

        // 4. Cấp phát cặp Access Token (RS256) và Refresh Token (HMAC-SHA256 xoay vòng)
        return issueAuthTokensAndSession(user, clientType, httpRequest, response, revokeAllExistingSessions);
    }

    /**
     * Hàm dùng chung để cấp phát cặp AccessToken (RS256) + RefreshToken (HMAC-SHA256 xoay vòng)
     * và quản lý phiên thiết bị cho cả đăng nhập thường lẫn đăng nhập bằng Google.
     *
     * @param user              Đối tượng User đã xác thực
     * @param clientType        Loại client ("mobile" hoặc "web")
     * @param httpRequest       HttpServletRequest để trích xuất Device ID, IP, User-Agent
     * @param response          HttpServletResponse để đính kèm HttpOnly Cookies
     * @param revokeAllSessions True nếu cần thu hồi toàn bộ phiên cũ trên mọi thiết bị (ví dụ khi vừa gộp tài khoản sang Google)
     */
    private CustomerLoginResponse issueAuthTokensAndSession(
            User user,
            String clientType,
            HttpServletRequest httpRequest,
            HttpServletResponse response,
            boolean revokeAllSessions) {

        // 1. Nếu có cờ thu hồi toàn bộ phiên cũ (do chuyển đổi sang tài khoản Google) -> Revoke toàn bộ RT của user trước
        if (revokeAllSessions) {
            refreshTokenRepository.revokeAllUserTokens(user);
            log.info("Đã thu hồi toàn bộ Refresh Token cũ trên mọi thiết bị của user ID: {} do chuyển đổi sang Google OAuth2.", user.getId());
        }

        // 2. Sinh AccessToken (RS256)
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().getName()
        );

        // 3. Định danh thiết bị (Device Token resolution & LRU Eviction check)
        DeviceToken deviceToken = resolveOrCreateDeviceToken(user, clientType, httpRequest, response);

        // 4. Thu hồi phiên cũ trên thiết bị hiện tại:
        // Nếu có thiết bị cụ thể -> Chỉ thu hồi phiên cũ của RIÊNG thiết bị này (giữ nguyên các thiết bị hợp lệ khác)
        // Nếu không có thiết bị (fallback) -> Thu hồi toàn bộ để an toàn
        if (!revokeAllSessions) {
            if (deviceToken != null) {
                refreshTokenRepository.revokeByUserAndDevice(user, deviceToken);
            } else {
                refreshTokenRepository.revokeAllUserTokens(user);
            }
        }

        // 5. Sinh RefreshToken gốc & băm HASH HMAC-SHA256 lưu CSDL
        String rawRefreshToken = jwtTokenProvider.generateRawRefreshToken();
        String hashedRefreshToken = jwtTokenProvider.hashRefreshToken(rawRefreshToken);

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .deviceToken(deviceToken)
                .token(hashedRefreshToken)
                .expiresAt(LocalDateTime.now().plusWeeks(1))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        boolean isMobile = "mobile".equalsIgnoreCase(clientType);

        if (isMobile) {
            // Đối với Mobile App: Trả về tokens trực tiếp trong JSON Payload (Không set Cookie)
            TokenResponse tokenResponse = TokenResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(rawRefreshToken)
                    .expiresIn((long) CookieUtils.ACCESS_TOKEN_MAX_AGE)
                    .build();

            return CustomerLoginResponse.builder()
                    .user(mapToUserResponse(user))
                    .tokens(tokenResponse)
                    .build();
        }

        // Đối với Web App: CHỈ thiết lập HttpOnly Cookies, JSON Payload không chứa tokens
        CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, accessToken,
                CookieUtils.ACCESS_TOKEN_MAX_AGE);
        CookieUtils.addTokenCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, rawRefreshToken,
                CookieUtils.REFRESH_TOKEN_MAX_AGE);

        return CustomerLoginResponse.builder()
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Trích xuất chuỗi idToken từ request (nhận trực tiếp từ Web GIS hoặc đổi từ Authorization Code của Mobile App).
     */
    private String resolveGoogleIdToken(GoogleLoginRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu xác thực Google không được để trống.");
        }

        // Luồng 1: Web GIS truyền trực tiếp idToken
        if (StringUtils.hasText(request.getIdToken())) {
            return request.getIdToken().trim();
        }

        // Luồng 2: Mobile App truyền Authorization Code -> Đổi lấy idToken bằng CUSTOMER_ID và CUSTOMER_SECRET_CODE
        if (StringUtils.hasText(request.getCode())) {
            if (!StringUtils.hasText(googleClientSecret)) {
                throw new IllegalStateException("Hệ thống chưa cấu hình Google Client Secret (CUSTOMER_SECRET_CODE) để đổi mã xác thực.");
            }
            String redirectUri = StringUtils.hasText(request.getRedirectUri())
                    ? request.getRedirectUri().trim()
                    : "http://localhost:3000";
            try {
                GoogleTokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                        new NetHttpTransport(),
                        GsonFactory.getDefaultInstance(),
                        "https://oauth2.googleapis.com/token",
                        googleClientId.trim(),
                        googleClientSecret.trim(),
                        request.getCode().trim(),
                        redirectUri
                ).execute();

                String exchangedIdToken = tokenResponse.getIdToken();
                if (!StringUtils.hasText(exchangedIdToken)) {
                    throw new SecurityException("Không nhận được ID Token hợp lệ từ Google OAuth2.");
                }
                return exchangedIdToken;
            } catch (Exception ex) {
                log.error("Lỗi khi đổi Google Authorization Code lấy ID Token: {}", ex.getMessage());
                throw new SecurityException("Mã xác thực Google không hợp lệ hoặc đã hết hạn.");
            }
        }

        throw new IllegalArgumentException("Vui lòng cung cấp Google ID Token hoặc mã xác thực hợp lệ.");
    }

    /**
     * Xác thực chữ ký số RSA-256, Audience (CUSTOMER_ID), Issuer và thời hạn của Google ID Token.
     */
    private GoogleIdToken.Payload verifyGoogleIdToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId.trim()))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idTokenString);
            if (googleIdToken == null || googleIdToken.getPayload() == null) {
                throw new SecurityException("Token xác thực Google không hợp lệ hoặc đã hết hạn.");
            }
            return googleIdToken.getPayload();
        } catch (SecurityException se) {
            throw se;
        } catch (Exception ex) {
            log.error("Lỗi xác thực chữ ký Google ID Token: {}", ex.getMessage());
            throw new SecurityException("Không thể xác thực thông tin đăng nhập với Google.");
        }
    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        String clientType = request.getHeader("X-Client-Type");
        boolean isMobile = "mobile".equalsIgnoreCase(clientType);

        // 1. Đọc RefreshToken gốc từ Cookies nếu có để thu hồi trong DB
        String rawToken = CookieUtils.extractCookieValue(request, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
        if (rawToken != null) {
            String hashedToken = jwtTokenProvider.hashRefreshToken(rawToken);
            refreshTokenRepository.findByToken(hashedToken).ifPresent(refreshToken -> {
                refreshToken.setRevoked(true);
                refreshTokenRepository.save(refreshToken);
            });
        }

        // 2. Nếu từ Mobile có header X-Device-Id -> Thu hồi theo deviceToken
        if (isMobile) {
            String deviceId = request.getHeader("X-Device-Id");
            if (StringUtils.hasText(deviceId)) {
                deviceTokenRepository.findByDeviceToken(deviceId).ifPresent(device -> {
                    refreshTokenRepository.revokeByDeviceToken(device);
                });
            }
        }

        // 3. Thu hồi Cookies trên Client
        CookieUtils.deleteCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME);
        CookieUtils.deleteCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME);
    }

    @Override
    public List<UserSessionResponse> getActiveSessions(HttpServletRequest request) {
        UserResponse currentUser = getCurrentUser(request);
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));

        String currentDeviceId = request.getHeader("X-Device-Id");
        if (!StringUtils.hasText(currentDeviceId)) {
            currentDeviceId = CookieUtils.extractCookieValue(request, CookieUtils.DEVICE_ID_COOKIE_NAME);
        }

        final String activeCurrentDeviceId = currentDeviceId;
        List<RefreshToken> activeSessions = refreshTokenRepository.findActiveSessionsByUser(user);

        return activeSessions.stream()
                .filter(s -> s.getDeviceToken() != null)
                .map(s -> {
                    DeviceToken d = s.getDeviceToken();
                    boolean isCurrent = activeCurrentDeviceId != null && activeCurrentDeviceId.equals(d.getDeviceToken());
                    return UserSessionResponse.builder()
                            .id(d.getId())
                            .deviceToken(d.getDeviceToken())
                            .deviceName(d.getDeviceName())
                            .osType(d.getOsType())
                            .lastIp(d.getLastIp())
                            .createdAt(d.getCreatedAt())
                            .lastActiveAt(d.getUpdatedAt())
                            .currentDevice(isCurrent)
                            .build();
                })
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(UserSessionResponse::getDeviceToken, r -> r, (existing, replacement) -> existing),
                        m -> m.values().stream().sorted((a, b) -> {
                            if (a.getLastActiveAt() == null) return 1;
                            if (b.getLastActiveAt() == null) return -1;
                            return b.getLastActiveAt().compareTo(a.getLastActiveAt());
                        }).collect(Collectors.toList())
                ));
    }

    @Override
    @Transactional
    public void revokeSession(String deviceToken, HttpServletRequest request) {
        UserResponse currentUser = getCurrentUser(request);
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại."));

        DeviceToken device = deviceTokenRepository.findByDeviceTokenAndUser(deviceToken, user)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thiết bị hoặc bạn không có quyền thu hồi phiên này."));

        refreshTokenRepository.revokeByUserAndDevice(user, device);
        log.info("Khách hàng ID: {} đã thu hồi phiên từ xa thiết bị: {}", user.getId(), device.getDeviceName());
    }

    /**
     * Giải quyết định danh thiết bị (DeviceToken) và vá lỗ hổng bảo mật khi chuyển đổi tài khoản trên cùng 1 thiết bị:
     * - Nếu thiết bị đã tồn tại trong DB nhưng thuộc về một User khác (ví dụ trước đó đăng nhập User A, nay đăng nhập User B):
     *   1. Thu hồi ngay lập tức toàn bộ Refresh Token chưa revoked đang gắn với thiết bị đó (`revokeByDeviceToken`).
     *   2. Kiểm tra giới hạn tối đa 3 thiết bị (`enforceMaxDevicesLimit`) cho User mới (User B).
     * - Nếu thiết bị đã thuộc về chính User này nhưng hiện không có phiên active nào, vẫn kiểm tra `enforceMaxDevicesLimit(user, 3)`.
     */
    private DeviceToken resolveOrCreateDeviceToken(User user, String clientType, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        if (httpRequest == null) {
            return null;
        }

        boolean isMobile = "mobile".equalsIgnoreCase(clientType);
        String deviceId = null;
        String osType = null;
        String deviceName = null;

        if (isMobile) {
            deviceId = httpRequest.getHeader("X-Device-Id");
            osType = httpRequest.getHeader("X-Device-OS");
            deviceName = httpRequest.getHeader("X-Device-Name");
            if (!StringUtils.hasText(osType)) {
                osType = "MOBILE";
            }
        } else {
            // Web Client: Lấy deviceId từ HttpOnly Cookie apsports_device_id
            deviceId = CookieUtils.extractCookieValue(httpRequest, CookieUtils.DEVICE_ID_COOKIE_NAME);
            if (!StringUtils.hasText(deviceId)) {
                deviceId = UUID.randomUUID().toString();
                if (httpResponse != null) {
                    CookieUtils.addTokenCookie(httpResponse, CookieUtils.DEVICE_ID_COOKIE_NAME, deviceId, CookieUtils.DEVICE_ID_MAX_AGE);
                }
            }
            osType = "WEB";
            String userAgent = httpRequest.getHeader("User-Agent");
            deviceName = parseDeviceNameFromUserAgent(userAgent);
        }

        if (!StringUtils.hasText(deviceId)) {
            return null;
        }

        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (!StringUtils.hasText(clientIp)) {
            clientIp = httpRequest.getRemoteAddr();
        } else if (clientIp.contains(",")) {
            clientIp = clientIp.split(",")[0].trim();
        }

        // Tìm thiết bị đã đăng ký trước đó
        DeviceToken existingDevice = deviceTokenRepository.findByDeviceToken(deviceId).orElse(null);
        if (existingDevice == null) {
            // Thiết bị mới hoàn toàn -> Kiểm tra giới hạn số lượng thiết bị tối đa (MAX = 3)
            enforceMaxDevicesLimit(user, 3);

            existingDevice = DeviceToken.builder()
                    .user(user)
                    .deviceToken(deviceId)
                    .osType(osType)
                    .deviceName(StringUtils.hasText(deviceName) ? deviceName : (isMobile ? "Mobile Device" : "Web Browser"))
                    .lastIp(clientIp)
                    .build();
        } else {
            // Vá lỗ hổng đổi chủ thiết bị: Kiểm tra nếu thiết bị trước đó gắn với một User khác
            boolean isDifferentOwner = existingDevice.getUser() != null
                    && !existingDevice.getUser().getId().equals(user.getId());

            if (isDifferentOwner) {
                // 1. Thu hồi ngay lập tức mọi Refresh Token chưa revoked của chủ cũ trên thiết bị này
                refreshTokenRepository.revokeByDeviceToken(existingDevice);
                log.info("Thiết bị {} chuyển từ user ID {} sang user ID {}: đã thu hồi phiên cũ trên thiết bị.",
                        deviceId, existingDevice.getUser().getId(), user.getId());

                // 2. Kiểm tra giới hạn 3 thiết bị cho chủ sở hữu mới
                enforceMaxDevicesLimit(user, 3);
            } else {
                // Cùng chủ sở hữu: nếu thiết bị này hiện chưa có trong danh sách phiên active, kiểm tra giới hạn 3 thiết bị
                final Long currentDeviceDbId = existingDevice.getId();
                List<RefreshToken> activeSessions = refreshTokenRepository.findActiveSessionsByUser(user);
                boolean isAlreadyActiveDevice = activeSessions != null && activeSessions.stream()
                        .anyMatch(rt -> rt.getDeviceToken() != null && rt.getDeviceToken().getId().equals(currentDeviceDbId));
                if (!isAlreadyActiveDevice) {
                    enforceMaxDevicesLimit(user, 3);
                }
            }

            existingDevice.setUser(user);
            if (StringUtils.hasText(deviceName)) {
                existingDevice.setDeviceName(deviceName);
            }
            if (StringUtils.hasText(osType)) {
                existingDevice.setOsType(osType);
            }
            existingDevice.setLastIp(clientIp);
            existingDevice.setUpdatedAt(LocalDateTime.now());
        }

        return deviceTokenRepository.save(existingDevice);
    }

    private void enforceMaxDevicesLimit(User user, int maxDevices) {
        List<RefreshToken> activeSessions = refreshTokenRepository.findActiveSessionsByUser(user);
        if (activeSessions != null && activeSessions.size() >= maxDevices) {
            // Phần tử cuối cùng là phiên có updatedAt cũ nhất (LRU Eviction)
            RefreshToken oldestSession = activeSessions.get(activeSessions.size() - 1);
            oldestSession.setRevoked(true);
            refreshTokenRepository.save(oldestSession);
            log.info("Thu hồi phiên thiết bị cũ nhất (LRU Eviction) user ID: {}, device ID: {}",
                    user.getId(), oldestSession.getDeviceToken() != null ? oldestSession.getDeviceToken().getId() : "null");
        }
    }

    private String parseDeviceNameFromUserAgent(String userAgent) {
        if (!StringUtils.hasText(userAgent)) {
            return "Trình duyệt Web";
        }
        String browser = "Trình duyệt";
        if (userAgent.contains("Edg/")) {
            browser = "Microsoft Edge";
        } else if (userAgent.contains("Chrome/")) {
            browser = "Google Chrome";
        } else if (userAgent.contains("Firefox/")) {
            browser = "Mozilla Firefox";
        } else if (userAgent.contains("Safari/")) {
            browser = "Apple Safari";
        }

        String os = "Hệ điều hành";
        if (userAgent.contains("Windows")) {
            os = "Windows";
        } else if (userAgent.contains("Macintosh") || userAgent.contains("Mac OS")) {
            os = "macOS";
        } else if (userAgent.contains("iPhone")) {
            os = "iPhone";
        } else if (userAgent.contains("iPad")) {
            os = "iPad";
        } else if (userAgent.contains("Android")) {
            os = "Android";
        } else if (userAgent.contains("Linux")) {
            os = "Linux";
        }

        return browser + " (" + os + ")";
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

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public TokenResponse refreshToken(String clientType, String rtFromCookie, String rtFromBody,
            HttpServletRequest request, HttpServletResponse response) {
        boolean isMobile = "mobile".equalsIgnoreCase(clientType);
        String rawRefreshToken;

        if (isMobile) {
            rawRefreshToken = rtFromBody;
            if (!StringUtils.hasText(rawRefreshToken)) {
                throw new IllegalArgumentException(
                        "Yêu cầu từ ứng dụng Mobile phải cung cấp refreshToken trong Request Body.");
            }
        } else {
            rawRefreshToken = rtFromCookie;
            if (!StringUtils.hasText(rawRefreshToken)) {
                throw new SecurityException("Refresh Token không tồn tại trong Cookie.");
            }
        }

        String hashedToken = jwtTokenProvider.hashRefreshToken(rawRefreshToken);

        // 1. Tìm theo Token chính hiện tại
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(hashedToken).orElse(null);
        boolean isWithinGracePeriod = false;

        if (refreshTokenEntity == null) {
            // 2. Dự phòng: Tìm theo Previous Token trong Cửa sổ Gia hạn 30 giây (Grace Window 30s)
            refreshTokenEntity = refreshTokenRepository.findByPreviousToken(hashedToken).orElse(null);
            if (refreshTokenEntity != null && refreshTokenEntity.getLastRotatedAt() != null) {
                if (refreshTokenEntity.getLastRotatedAt().isAfter(LocalDateTime.now().minusSeconds(30))) {
                    isWithinGracePeriod = true;
                    log.info("Xử lý request Refresh Token trong cửa sổ gia hạn (Grace Window 30s) cho user ID: {}",
                            refreshTokenEntity.getUser().getId());
                } else {
                    refreshTokenEntity.setRevoked(true);
                    refreshTokenRepository.save(refreshTokenEntity);
                    throw new SecurityException("Refresh Token cũ đã hết thời gian gia hạn.");
                }
            }
        }

        if (refreshTokenEntity == null) {
            throw new SecurityException("Refresh Token không hợp lệ hoặc đã bị thu hồi.");
        }

        if (refreshTokenEntity.isRevoked()) {
            throw new SecurityException("Refresh Token đã bị thu hồi.");
        }

        if (refreshTokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new SecurityException("Refresh Token đã hết hạn.");
        }

        LocalDateTime sessionStartedAt = refreshTokenEntity.getCreatedAt();
        if (sessionStartedAt != null
                && sessionStartedAt.plusDays(jwtTokenProvider.getRefreshTokenAbsoluteMaxDays()).isBefore(LocalDateTime.now())) {
            refreshTokenEntity.setRevoked(true);
            refreshTokenRepository.save(refreshTokenEntity);
            log.warn(
                    "Phiên đăng nhập user ID: {} đã vượt quá thời hạn tối đa {} ngày (bắt đầu lúc {}), buộc đăng nhập lại.",
                    refreshTokenEntity.getUser().getId(), jwtTokenProvider.getRefreshTokenAbsoluteMaxDays(), sessionStartedAt);
            throw new SecurityException("Phiên đăng nhập đã vượt quá thời hạn tối đa. Vui lòng đăng nhập lại.");
        }

        User user = refreshTokenEntity.getUser();
        if (user.getStatus() != UserStatus.active) {
            throw new SecurityException("Tài khoản người dùng không hoạt động.");
        }

        // 2.1. Kiểm tra chéo thiết bị (Device Binding & Token Hijacking Protection)
        if (refreshTokenEntity.getDeviceToken() != null && request != null) {
            String requestDeviceId = isMobile
                    ? request.getHeader("X-Device-Id")
                    : CookieUtils.extractCookieValue(request, CookieUtils.DEVICE_ID_COOKIE_NAME);

            String registeredDeviceId = refreshTokenEntity.getDeviceToken().getDeviceToken();

            if (StringUtils.hasText(requestDeviceId) && !requestDeviceId.equals(registeredDeviceId)) {
                log.error("🚨 [SECURITY BREACH] Phát hiện Token Hijacking! User ID: {}, Device gốc: {}, Device gửi request: {}",
                        user.getId(), registeredDeviceId, requestDeviceId);
                refreshTokenEntity.setRevoked(true);
                refreshTokenRepository.save(refreshTokenEntity);
                throw new SecurityException("Cảnh báo an ninh: Phiên đăng nhập không hợp lệ trên thiết bị này.");
            }

            // Cập nhật thời điểm hoạt động gần nhất của thiết bị
            DeviceToken device = refreshTokenEntity.getDeviceToken();
            device.setUpdatedAt(LocalDateTime.now());
            deviceTokenRepository.save(device);
        }

        // 3. Sinh AccessToken mới
        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(),
                user.getRole().getName());

        if (isWithinGracePeriod) {
            if (isMobile) {
                return TokenResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(rawRefreshToken)
                        .expiresIn((long) CookieUtils.ACCESS_TOKEN_MAX_AGE)
                        .build();
            }
            CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, newAccessToken,
                    CookieUtils.ACCESS_TOKEN_MAX_AGE);
            return null;
        }

        // 4. Rotate RefreshToken & lưu PreviousToken Hash + LastRotatedAt
        String newRawRefreshToken = jwtTokenProvider.generateRawRefreshToken();
        String newHashedRefreshToken = jwtTokenProvider.hashRefreshToken(newRawRefreshToken);

        refreshTokenEntity.setPreviousToken(hashedToken);
        refreshTokenEntity.setLastRotatedAt(LocalDateTime.now());
        refreshTokenEntity.setToken(newHashedRefreshToken);
        refreshTokenEntity.setExpiresAt(LocalDateTime.now().plusWeeks(1));
        refreshTokenRepository.save(refreshTokenEntity);

        if (isMobile) {
            return TokenResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRawRefreshToken)
                    .expiresIn((long) CookieUtils.ACCESS_TOKEN_MAX_AGE)
                    .build();
        }

        // 5. Đẩy cặp Cookies mới vào Response cho Web Client
        CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, newAccessToken,
                CookieUtils.ACCESS_TOKEN_MAX_AGE);
        CookieUtils.addTokenCookie(response, CookieUtils.REFRESH_TOKEN_COOKIE_NAME, newRawRefreshToken,
                CookieUtils.REFRESH_TOKEN_MAX_AGE);
        return null;
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Địa chỉ email không tồn tại trong hệ thống."));

        if (user.getStatus() != UserStatus.active) {
            throw new SecurityException("Tài khoản chưa được kích hoạt hoặc đã bị khóa.");
        }

        // Chặn quên mật khẩu đối với tài khoản Google
        if (StringUtils.hasText(user.getGoogleId())) {
            throw new IllegalArgumentException(
                    "Tài khoản này đăng nhập bằng Google OAuth2 nên không sử dụng mật khẩu riêng. Vui lòng chọn 'Đăng nhập bằng Google'.");
        }

        // Sinh token ngẫu nhiên 64 ký tự (UUID x2)
        String resetToken = (UUID.randomUUID().toString() + UUID.randomUUID().toString()).replace("-", "");

        // Xóa token cũ của email này nếu có và lưu token mới
        passwordResetTokenRepository.deleteByEmail(email);

        PasswordResetToken tokenEntity = PasswordResetToken.builder()
                .email(email)
                .token(resetToken)
                .build();
        passwordResetTokenRepository.save(tokenEntity);

        // Gửi email chứa link đặt lại mật khẩu
        emailService.sendPasswordResetEmail(email, user.getName() != null ? user.getName() : email, resetToken);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu mới và xác nhận mật khẩu không trùng khớp.");
        }

        String email = request.getEmail().trim().toLowerCase();
        String token = request.getToken().trim();

        PasswordResetToken tokenEntity = passwordResetTokenRepository.findByTokenAndEmail(token, email)
                .orElseThrow(
                        () -> new IllegalArgumentException("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã bị hủy."));

        // Kiểm tra thời gian hết hạn (15 phút TTL)
        if (tokenEntity.getCreatedAt() != null
                && tokenEntity.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(15))) {
            passwordResetTokenRepository.delete(tokenEntity);
            throw new SecurityException(
                    "Liên kết đặt lại mật khẩu đã hết hạn (quá 15 phút). Vui lòng gửi lại yêu cầu mới.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người dùng."));

        // Chặn đặt lại mật khẩu nếu tài khoản đã liên kết Google
        if (StringUtils.hasText(user.getGoogleId())) {
            passwordResetTokenRepository.delete(tokenEntity);
            throw new SecurityException("Tài khoản liên kết Google không hỗ trợ đặt lại mật khẩu.");
        }

        // Cập nhật mật khẩu mới mã hóa BCrypt
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Xóa token đã sử dụng
        passwordResetTokenRepository.delete(tokenEntity);

        // Thu hồi toàn bộ RefreshToken hiện có của người dùng này để đảm bảo an toàn
        refreshTokenRepository.revokeAllUserTokens(user);

        log.info("Đặt lại mật khẩu thành công cho tài khoản email: {}", email);
    }

    // --- Helper Methods ---

    private Role getCustomerRole() {
        return roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.findById(3L)
                        .orElseThrow(() -> new IllegalStateException("Không tìm thấy vai trò CUSTOMER hệ thống.")));
    }

    private String generateRandomEncodedPassword() {
        String rawRandom = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        return passwordEncoder.encode(rawRandom);
    }

    private UserResponse mapToUserResponse(User user) {
        boolean isGoogle = StringUtils.hasText(user.getGoogleId());
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .status(user.getStatus())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .address(user.getAddress())
                .roleName(user.getRole().getName())
                .googleId(user.getGoogleId())
                .googleAccount(isGoogle)
                .emailVerifiedAt(user.getEmailVerifiedAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
