package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.customer.ForgotPasswordRequest;
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
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.customer.CustomerAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.web.ap_sports.util.CookieUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Lớp triển khai (Implementation) của CustomerAuthService.
 * Quản lý toàn bộ logic Đăng ký, Kích hoạt, Đăng nhập (Cookies & HMAC-SHA256
 * Refresh Token), Đăng xuất, Quên & Đặt lại mật khẩu.
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
                throw new IllegalStateException(
                        "Email đang chờ xác nhận. Vui lòng kiểm tra email của bạn để xác nhận tài khoản.");
            }
            throw new IllegalArgumentException("Email đã được sử dụng bởi một tài khoản khác.");
        });

        // 3. Lấy Role CUSTOMER (Default ID = 3 hoặc tìm theo name)
        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.findById(3L)
                        .orElseThrow(() -> new IllegalStateException("Không tìm thấy vai trò CUSTOMER hệ thống.")));

        // 4. Sinh Token kích hoạt 64 ký tự ngẫu nhiên
        String activationToken = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");

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
    public CustomerLoginResponse login(LoginCustomerRequest request, String clientType, HttpServletResponse response) {
        return login(request, clientType, null, response);
    }

    @Override
    @Transactional
    public CustomerLoginResponse login(LoginCustomerRequest request, String clientType, HttpServletRequest httpRequest, HttpServletResponse response) {
        // 1. Tìm User theo email
        User user = userRepository.findByEmail(request.getEmail())
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

        // 4. Kiểm tra mật khẩu BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.");
        }

        // 5. Sinh AccessToken
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(),
                user.getRole().getName());

        // 6. Định danh thiết bị (Device Token resolution & LRU Eviction check)
        DeviceToken deviceToken = resolveOrCreateDeviceToken(user, clientType, httpRequest, response);

        // 7. Thu hồi phiên cũ:
        // Nếu có thiết bị cụ thể -> Chỉ thu hồi phiên cũ của RIÊNG thiết bị này (duy trì các thiết bị khác)
        // Nếu không có thiết bị (fallback cũ) -> Thu hồi toàn bộ để an toàn
        if (deviceToken != null) {
            refreshTokenRepository.revokeByUserAndDevice(user, deviceToken);
        } else {
            refreshTokenRepository.revokeAllUserTokens(user);
        }

        // 8. Sinh RefreshToken gốc & băm HASH HMAC-SHA256 lưu CSDL
        String rawRefreshToken = jwtTokenProvider.generateRawRefreshToken();
        String hashedRefreshToken = jwtTokenProvider.hashRefreshToken(rawRefreshToken);

        // Lưu RefreshToken băm mới vào DB kèm khóa ngoại deviceToken (nullable)
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
        DeviceToken deviceToken = deviceTokenRepository.findByDeviceToken(deviceId).orElse(null);
        if (deviceToken == null) {
            // Kiểm tra giới hạn số lượng thiết bị tối đa (MAX = 3)
            enforceMaxDevicesLimit(user, 3);

            deviceToken = DeviceToken.builder()
                    .user(user)
                    .deviceToken(deviceId)
                    .osType(osType)
                    .deviceName(StringUtils.hasText(deviceName) ? deviceName : (isMobile ? "Mobile Device" : "Web Browser"))
                    .lastIp(clientIp)
                    .build();
        } else {
            // Thiết bị đã có -> Cập nhật thông tin mới nhất và gắn với user hiện tại
            deviceToken.setUser(user);
            if (StringUtils.hasText(deviceName)) {
                deviceToken.setDeviceName(deviceName);
            }
            if (StringUtils.hasText(osType)) {
                deviceToken.setOsType(osType);
            }
            deviceToken.setLastIp(clientIp);
            deviceToken.setUpdatedAt(LocalDateTime.now());
        }

        return deviceTokenRepository.save(deviceToken);
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
        // Đọc email từ SecurityContext — đã được xác thực bởi JwtAuthenticationFilter
        // Nếu không có authentication (token null hoặc hết hạn), Spring Security đã trả
        // 401
        // trước khi vào đây (do SecurityConfig yêu cầu hasRole CUSTOMER cho /auth/me)
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
            // Quy tắc Strict Mobile Request Body: Mobile BẮT BUỘC lấy refreshToken từ JSON
            // Request Body
            // TUYỆT ĐỐI KHÔNG FALLBACK ĐỌC TỪ COOKIE (Ngăn chặn triệt để tấn công giả mạo
            // header XSS)
            rawRefreshToken = rtFromBody;
            if (!StringUtils.hasText(rawRefreshToken)) {
                throw new IllegalArgumentException(
                        "Yêu cầu từ ứng dụng Mobile phải cung cấp refreshToken trong Request Body.");
            }
        } else {
            // Web Client: CHỈ lấy refreshToken từ HttpOnly Cookie
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
            // 2. Dự phòng: Tìm theo Previous Token trong Cửa sổ Gia hạn 30 giây (Grace
            // Window 30s)
            refreshTokenEntity = refreshTokenRepository.findByPreviousToken(hashedToken).orElse(null);
            if (refreshTokenEntity != null && refreshTokenEntity.getLastRotatedAt() != null) {
                if (refreshTokenEntity.getLastRotatedAt().isAfter(LocalDateTime.now().minusSeconds(30))) {
                    isWithinGracePeriod = true;
                    log.info("Xử lý request Refresh Token trong cửa sổ gia hạn (Grace Window 30s) cho user ID: {}",
                            refreshTokenEntity.getUser().getId());
                } else {
                    // Phát hiện dùng lại Token quá thời gian gia hạn (Reuse Detection) -> Thu hồi
                    // toàn bộ session để bảo mật
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
            // Nếu nằm trong 30s Grace Period trên Web, chỉ trả về AccessToken mới và giữ
            // nguyên cặp cookie
            CookieUtils.addTokenCookie(response, CookieUtils.ACCESS_TOKEN_COOKIE_NAME, newAccessToken,
                    CookieUtils.ACCESS_TOKEN_MAX_AGE);
            return null;
        }

        // 4. Nếu là đợt Refresh mới hoàn toàn -> Rotate RefreshToken & lưu
        // PreviousToken Hash + LastRotatedAt
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
