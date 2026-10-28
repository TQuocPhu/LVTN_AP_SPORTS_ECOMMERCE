package com.web.ap_sports.auth;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
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
import com.web.ap_sports.service.customer.impl.CustomerAuthServiceImpl;
import com.web.ap_sports.util.CookieUtils;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho CustomerAuthServiceImpl (Bao phủ đầy đủ Nhóm 1 -> Nhóm 6: TC-AUTH-01 đến TC-AUTH-18).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CustomerAuthServiceImpl Unit Tests")
class CustomerAuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private DeviceTokenRepository deviceTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private EmailService emailService;
    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CustomerAuthServiceImpl customerAuthService;

    private Role customerRole;
    private Role adminRole;
    private User activeCustomer;

    @BeforeEach
    void setUp() {
        customerRole = Role.builder().id(3L).name("CUSTOMER").build();
        adminRole = Role.builder().id(1L).name("ADMIN").build();

        activeCustomer = User.builder()
                .id(100L)
                .name("Nguyễn Văn A")
                .email("customer@example.com")
                .password("$2a$10$hashedPassword")
                .status(UserStatus.active)
                .role(customerRole)
                .build();

        ReflectionTestUtils.setField(customerAuthService, "googleClientId", "test-google-client-id.apps.googleusercontent.com");
        ReflectionTestUtils.setField(customerAuthService, "googleClientSecret", "test-google-client-secret");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================================
    // NHÓM 1: ĐĂNG KÝ & KÍCH HOẠT TÀI KHOẢN (10 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 1: Đăng ký & Kích hoạt tài khoản (TC-AUTH-01 -> TC-AUTH-04)")
    class RegisterAndActivateTests {

        @Test
        @DisplayName("TC-AUTH-01.1: Đăng ký thành công khi tìm thấy Role CUSTOMER theo tên")
        void register_Success_WithCustomerRoleByName() {
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("  Trần Quốc Phú  ");
            req.setEmail("  NewUser@Example.com  ");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Pass12345");

            when(userRepository.findByEmail("newuser@example.com")).thenReturn(Optional.empty());
            when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.of(customerRole));
            when(passwordEncoder.encode("Pass12345")).thenReturn("encoded_pass_123");

            customerAuthService.register(req);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository, times(1)).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();

            assertEquals("Trần Quốc Phú", savedUser.getName());
            assertEquals("newuser@example.com", savedUser.getEmail());
            assertEquals("encoded_pass_123", savedUser.getPassword());
            assertEquals(UserStatus.pending, savedUser.getStatus());
            assertEquals(customerRole, savedUser.getRole());
            assertNotNull(savedUser.getActivationToken());
            assertEquals(64, savedUser.getActivationToken().length());

            verify(emailService, times(1)).sendActivationEmail(
                    eq("newuser@example.com"),
                    eq("Trần Quốc Phú"),
                    eq(savedUser.getActivationToken())
            );
        }

        @Test
        @DisplayName("TC-AUTH-01.2: Đăng ký thành công với Fallback tìm Role CUSTOMER theo ID = 3")
        void register_Success_FallbackRoleById3() {
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("Khách Hàng B");
            req.setEmail("userb@example.com");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Pass12345");

            when(userRepository.findByEmail("userb@example.com")).thenReturn(Optional.empty());
            when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.empty());
            when(roleRepository.findById(3L)).thenReturn(Optional.of(customerRole));
            when(passwordEncoder.encode("Pass12345")).thenReturn("encoded_pass");

            customerAuthService.register(req);

            verify(userRepository, times(1)).save(any(User.class));
            verify(emailService, times(1)).sendActivationEmail(eq("userb@example.com"), eq("Khách Hàng B"), anyString());
        }

        @Test
        @DisplayName("TC-AUTH-01.3: Đăng ký thất bại khi DB chưa khởi tạo Role CUSTOMER")
        void register_Fail_CustomerRoleMissingInDb() {
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("Khách Hàng C");
            req.setEmail("userc@example.com");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Pass12345");

            when(userRepository.findByEmail("userc@example.com")).thenReturn(Optional.empty());
            when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.empty());
            when(roleRepository.findById(3L)).thenReturn(Optional.empty());

            IllegalStateException ex = assertThrows(IllegalStateException.class,
                    () -> customerAuthService.register(req));

            assertEquals("Không tìm thấy vai trò CUSTOMER hệ thống.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-02: Đăng ký thất bại khi mật khẩu xác nhận không khớp")
        void register_Fail_PasswordMismatch() {
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("Nguyễn Văn A");
            req.setEmail("test@example.com");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Different12345");

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.register(req));

            assertEquals("Xác nhận mật khẩu không khớp.", ex.getMessage());
            verify(userRepository, never()).save(any());
            verify(emailService, never()).sendActivationEmail(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("TC-AUTH-03A: Đăng ký thất bại khi Email đã liên kết tài khoản Google")
        void register_Fail_EmailLinkedToGoogle() {
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("User Google");
            req.setEmail("googleuser@gmail.com");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Pass12345");

            User existingGoogleUser = User.builder()
                    .email("googleuser@gmail.com")
                    .googleId("google-sub-999")
                    .status(UserStatus.active)
                    .build();

            when(userRepository.findByEmail("googleuser@gmail.com")).thenReturn(Optional.of(existingGoogleUser));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.register(req));

            assertTrue(ex.getMessage().contains("Email này đã được liên kết với tài khoản Google"));
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-AUTH-03B: Đăng ký thất bại khi Email đang ở trạng thái chờ kích hoạt (pending)")
        void register_Fail_EmailPendingActivation() {
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("User Pending");
            req.setEmail("pending@example.com");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Pass12345");

            User pendingUser = User.builder()
                    .email("pending@example.com")
                    .status(UserStatus.pending)
                    .build();

            when(userRepository.findByEmail("pending@example.com")).thenReturn(Optional.of(pendingUser));

            IllegalStateException ex = assertThrows(IllegalStateException.class,
                    () -> customerAuthService.register(req));

            assertTrue(ex.getMessage().contains("Email đang chờ xác nhận"));
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-AUTH-03C.1: Đăng ký thất bại khi Email đã thuộc về tài khoản active khác")
        void register_Fail_EmailAlreadyActive() {
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("User Active");
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Pass12345");

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.register(req));

            assertEquals("Email đã được sử dụng bởi một tài khoản khác.", ex.getMessage());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-AUTH-03C.2: Đăng ký thất bại khi Email đã thuộc về tài khoản bị khóa (banned)")
        void register_Fail_EmailBanned() {
            activeCustomer.setStatus(UserStatus.banned);
            RegisterCustomerRequest req = new RegisterCustomerRequest();
            req.setName("User Banned");
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");
            req.setConfirmPassword("Pass12345");

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.register(req));

            assertEquals("Email đã được sử dụng bởi một tài khoản khác.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-04A: Kích hoạt tài khoản thành công với Token hợp lệ")
        void activateAccount_Success() {
            User pendingUser = User.builder()
                    .id(101L)
                    .email("pending@example.com")
                    .status(UserStatus.pending)
                    .activationToken("valid-token-64-chars")
                    .build();

            when(userRepository.findByActivationToken("valid-token-64-chars")).thenReturn(Optional.of(pendingUser));

            customerAuthService.activateAccount("valid-token-64-chars");

            assertEquals(UserStatus.active, pendingUser.getStatus());
            assertNull(pendingUser.getActivationToken());
            assertNotNull(pendingUser.getEmailVerifiedAt());
            verify(userRepository, times(1)).save(pendingUser);
        }

        @Test
        @DisplayName("TC-AUTH-04B: Kích hoạt tài khoản thất bại khi Token không tồn tại hoặc đã dùng")
        void activateAccount_Fail_InvalidToken() {
            when(userRepository.findByActivationToken("invalid-token")).thenReturn(Optional.empty());

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.activateAccount("invalid-token"));

            assertEquals("Token kích hoạt không hợp lệ hoặc đã hết hạn.", ex.getMessage());
            verify(userRepository, never()).save(any());
        }
    }

    // =========================================================================
    // NHÓM 2: ĐĂNG NHẬP KHÁCH HÀNG TRUYỀN THỐNG (8 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 2: Đăng nhập Khách hàng truyền thống (TC-AUTH-05 -> TC-AUTH-07)")
    class TraditionalLoginTests {

        @Test
        @DisplayName("TC-AUTH-05.1: Đăng nhập thành công trên Web Client (Thiết lập HttpOnly Cookies, ẩn tokens trong JSON)")
        void login_Success_WebClient() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("  CUSTOMER@example.com ");
            req.setPassword("Pass12345");

            MockHttpServletRequest httpRequest = new MockHttpServletRequest();
            httpRequest.addHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0");
            MockHttpServletResponse httpResponse = new MockHttpServletResponse();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("Pass12345", activeCustomer.getPassword())).thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("jwt-access-token");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("raw-refresh-token");
            when(jwtTokenProvider.hashRefreshToken("raw-refresh-token")).thenReturn("hashed-refresh-token");
            when(deviceTokenRepository.findByDeviceToken(anyString())).thenReturn(Optional.empty());
            when(deviceTokenRepository.save(any(DeviceToken.class))).thenAnswer(inv -> inv.getArgument(0));

            CustomerLoginResponse res = customerAuthService.login(req, "web", httpRequest, httpResponse);

            assertNotNull(res);
            assertNotNull(res.getUser());
            assertEquals("customer@example.com", res.getUser().getEmail());
            assertNull(res.getTokens(), "Web Client không được nhận tokens trong JSON body");

            List<String> setCookieHeaders = httpResponse.getHeaders("Set-Cookie");
            assertTrue(setCookieHeaders.stream().anyMatch(h -> h.contains("accessToken=jwt-access-token") && h.contains("HttpOnly")));
            assertTrue(setCookieHeaders.stream().anyMatch(h -> h.contains("refreshToken=raw-refresh-token") && h.contains("HttpOnly")));
            assertTrue(setCookieHeaders.stream().anyMatch(h -> h.contains(CookieUtils.DEVICE_ID_COOKIE_NAME)));
        }

        @Test
        @DisplayName("TC-AUTH-05.2: Đăng nhập qua phương thức rút gọn 3 tham số (httpRequest = null) fallback thu hồi toàn bộ phiên cũ")
        void login_Success_WithoutHttpServletRequestFallback() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");
            MockHttpServletResponse httpResponse = new MockHttpServletResponse();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("Pass12345", activeCustomer.getPassword())).thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("jwt-at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("raw-rt");
            when(jwtTokenProvider.hashRefreshToken("raw-rt")).thenReturn("hashed-rt");

            CustomerLoginResponse res = customerAuthService.login(req, "web", httpResponse);

            assertNotNull(res);
            verify(refreshTokenRepository, times(1)).revokeAllUserTokens(activeCustomer);
        }

        @Test
        @DisplayName("TC-AUTH-06: Đăng nhập thành công trên Mobile App (Trả JSON Tokens, không set Cookie)")
        void login_Success_MobileClient() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");

            MockHttpServletRequest httpRequest = new MockHttpServletRequest();
            httpRequest.addHeader("X-Device-Id", "mobile-dev-123");
            httpRequest.addHeader("X-Device-OS", "ANDROID");
            httpRequest.addHeader("X-Device-Name", "Samsung S24");
            MockHttpServletResponse httpResponse = new MockHttpServletResponse();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("Pass12345", activeCustomer.getPassword())).thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("mobile-access-token");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("mobile-raw-rt");
            when(jwtTokenProvider.hashRefreshToken("mobile-raw-rt")).thenReturn("mobile-hashed-rt");
            when(deviceTokenRepository.findByDeviceToken("mobile-dev-123")).thenReturn(Optional.empty());
            when(deviceTokenRepository.save(any(DeviceToken.class))).thenAnswer(inv -> inv.getArgument(0));

            CustomerLoginResponse res = customerAuthService.login(req, "mobile", httpRequest, httpResponse);

            assertNotNull(res.getTokens());
            assertEquals("mobile-access-token", res.getTokens().getAccessToken());
            assertEquals("mobile-raw-rt", res.getTokens().getRefreshToken());
            assertEquals((long) CookieUtils.ACCESS_TOKEN_MAX_AGE, res.getTokens().getExpiresIn());
            assertTrue(httpResponse.getHeaders("Set-Cookie").isEmpty(), "Mobile App không được thiết lập Cookie");
        }

        @Test
        @DisplayName("TC-AUTH-07A: Đăng nhập thất bại khi Email không tồn tại")
        void login_Fail_EmailNotFound() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("notfound@example.com");
            req.setPassword("Pass12345");

            when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.login(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-07B: Đăng nhập thất bại khi sai mật khẩu")
        void login_Fail_WrongPassword() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("WrongPass123");

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("WrongPass123", activeCustomer.getPassword())).thenReturn(false);

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.login(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.", ex.getMessage());
            verify(jwtTokenProvider, never()).generateAccessToken(anyLong(), anyString(), anyString());
        }

        @Test
        @DisplayName("TC-AUTH-07C: Đăng nhập thất bại khi tài khoản đang ở trạng thái pending hoặc banned")
        void login_Fail_AccountNotActive() {
            activeCustomer.setStatus(UserStatus.banned);
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            IllegalStateException ex = assertThrows(IllegalStateException.class,
                    () -> customerAuthService.login(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Thông tin đăng nhập không hợp lệ hoặc tài khoản chưa được kích hoạt.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-07D: Chặn tài khoản ADMIN đăng nhập qua cổng Khách hàng")
        void login_Fail_NonCustomerRole() {
            User adminUser = User.builder()
                    .id(1L)
                    .email("admin@apsports.com")
                    .status(UserStatus.active)
                    .role(adminRole)
                    .build();

            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("admin@apsports.com");
            req.setPassword("AdminPass123");

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.login(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Bạn không có quyền truy cập vào tài khoản này!", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-07E: Chặn đăng nhập bằng mật khẩu nếu tài khoản đã liên kết Google")
        void login_Fail_GoogleLinkedAccount() {
            activeCustomer.setGoogleId("google-sub-123");
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.login(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertTrue(ex.getMessage().contains("Tài khoản này được đăng nhập thông qua Google"));
        }
    }

    // =========================================================================
    // NHÓM 3: ĐĂNG NHẬP & HỢP NHẤT TÀI KHOẢN GOOGLE OAUTH2 (11 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 3: Đăng nhập & Hợp nhất Google OAuth2 - Phương án 6A (TC-AUTH-08 -> TC-AUTH-10)")
    class GoogleOAuthTests {

        private GoogleIdToken createMockGoogleIdToken(String sub, String email, boolean verified, String name, String picture) {
            GoogleIdToken mockIdToken = mock(GoogleIdToken.class);
            GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
            payload.setSubject(sub);
            payload.setEmail(email);
            payload.setEmailVerified(verified);
            if (name != null) payload.set("name", name);
            if (picture != null) payload.set("picture", picture);
            when(mockIdToken.getPayload()).thenReturn(payload);
            return mockIdToken;
        }

        @Test
        @DisplayName("TC-AUTH-08.1: Lấy Google Client ID công khai thành công (cắt khoảng trắng thừa)")
        void getGoogleClientId_Success() {
            ReflectionTestUtils.setField(customerAuthService, "googleClientId", "  my-client-id.apps.googleusercontent.com  ");
            assertEquals("my-client-id.apps.googleusercontent.com", customerAuthService.getGoogleClientId());
        }

        @Test
        @DisplayName("TC-AUTH-08.2: Khách hàng mới hoàn toàn đăng nhập bằng Google lần đầu -> Tự động tạo User active")
        void loginWithGoogle_Success_NewGoogleUserCreated() {
            GoogleIdToken mockIdToken = createMockGoogleIdToken(
                    "google-sub-new", "newgoogle@gmail.com", true, "Google New User", "https://lh3.googleusercontent.com/pic.jpg"
            );

            try (MockedConstruction<GoogleIdTokenVerifier.Builder> mockedBuilder = mockConstruction(
                    GoogleIdTokenVerifier.Builder.class,
                    (mock, context) -> {
                        when(mock.setAudience(anyList())).thenReturn(mock);
                        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
                        when(verifier.verify("valid-google-id-token")).thenReturn(mockIdToken);
                        when(mock.build()).thenReturn(verifier);
                    })) {

                when(userRepository.findByEmail("newgoogle@gmail.com")).thenReturn(Optional.empty());
                when(userRepository.findByGoogleId("google-sub-new")).thenReturn(Optional.empty());
                when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.of(customerRole));
                when(passwordEncoder.encode(anyString())).thenReturn("random_encoded_64");
                when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                    User u = inv.getArgument(0);
                    u.setId(500L);
                    return u;
                });
                when(jwtTokenProvider.generateAccessToken(500L, "newgoogle@gmail.com", "CUSTOMER")).thenReturn("google-jwt");
                when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("google-rt");
                when(jwtTokenProvider.hashRefreshToken("google-rt")).thenReturn("google-rt-hash");

                GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("valid-google-id-token").build();
                CustomerLoginResponse res = customerAuthService.loginWithGoogle(req, "mobile", null, new MockHttpServletResponse());

                assertNotNull(res);
                assertEquals("newgoogle@gmail.com", res.getUser().getEmail());
                assertEquals("Google New User", res.getUser().getName());
                assertTrue(res.getUser().isGoogleAccount());
                assertEquals("google-jwt", res.getTokens().getAccessToken());
            }
        }

        @Test
        @DisplayName("TC-AUTH-09.1: Phương án 6A - Hợp nhất tài khoản thường sang Google (Xóa ảnh Cloudinary cũ, xóa token reset & thu hồi mọi phiên cũ)")
        void loginWithGoogle_Success_MergeLocalAccountToGoogle_6A() {
            activeCustomer.setGoogleId(null);
            activeCustomer.setStatus(UserStatus.pending);
            activeCustomer.setActivationToken("old-activation-token");
            activeCustomer.setAvatarPublicId("ap-sports-e-commerce/avatars/old_avatar_123");

            GoogleIdToken mockIdToken = createMockGoogleIdToken(
                    "google-sub-merged", "customer@example.com", true, "Tên Mới Từ Google", "https://lh3.googleusercontent.com/new.jpg"
            );

            try (MockedConstruction<GoogleIdTokenVerifier.Builder> mockedBuilder = mockConstruction(
                    GoogleIdTokenVerifier.Builder.class,
                    (mock, context) -> {
                        when(mock.setAudience(anyList())).thenReturn(mock);
                        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
                        when(verifier.verify("merge-id-token")).thenReturn(mockIdToken);
                        when(mock.build()).thenReturn(verifier);
                    })) {

                when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
                when(passwordEncoder.encode(anyString())).thenReturn("merged_random_bcrypt_pass");
                when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
                when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("merged-jwt");
                when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("merged-rt");
                when(jwtTokenProvider.hashRefreshToken("merged-rt")).thenReturn("merged-rt-hash");

                GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("merge-id-token").build();
                CustomerLoginResponse res = customerAuthService.loginWithGoogle(req, "web", null, new MockHttpServletResponse());

                assertNotNull(res);
                assertEquals("google-sub-merged", activeCustomer.getGoogleId());
                assertEquals(UserStatus.active, activeCustomer.getStatus());
                assertNull(activeCustomer.getActivationToken());
                assertNull(activeCustomer.getAvatarPublicId(), "avatarPublicId cũ phải được đặt về null");
                assertEquals("https://lh3.googleusercontent.com/new.jpg", activeCustomer.getAvatar());
                assertEquals("merged_random_bcrypt_pass", activeCustomer.getPassword());

                verify(cloudinaryService, times(1)).deleteImage("ap-sports-e-commerce/avatars/old_avatar_123");
                verify(passwordResetTokenRepository, times(1)).deleteByEmail("customer@example.com");
                verify(refreshTokenRepository, times(1)).revokeAllUserTokens(activeCustomer);
            }
        }

        @Test
        @DisplayName("TC-AUTH-09.2: Tài khoản đã là Google từ trước đăng nhập lại -> Chỉ đồng bộ tên/ảnh mới, không xóa phiên thiết bị khác")
        void loginWithGoogle_Success_ExistingGoogleAccountReLogin() {
            activeCustomer.setGoogleId("google-sub-existing");
            DeviceToken existingDevice = DeviceToken.builder().id(10L).deviceToken("dev-web-1").user(activeCustomer).build();

            GoogleIdToken mockIdToken = createMockGoogleIdToken(
                    "google-sub-existing", "customer@example.com", true, "Updated Name", "https://lh3.googleusercontent.com/updated.jpg"
            );

            try (MockedConstruction<GoogleIdTokenVerifier.Builder> mockedBuilder = mockConstruction(
                    GoogleIdTokenVerifier.Builder.class,
                    (mock, context) -> {
                        when(mock.setAudience(anyList())).thenReturn(mock);
                        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
                        when(verifier.verify("relogin-id-token")).thenReturn(mockIdToken);
                        when(mock.build()).thenReturn(verifier);
                    })) {

                MockHttpServletRequest httpRequest = new MockHttpServletRequest();
                httpRequest.setCookies(new Cookie(CookieUtils.DEVICE_ID_COOKIE_NAME, "dev-web-1"));

                when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
                when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
                when(deviceTokenRepository.findByDeviceToken("dev-web-1")).thenReturn(Optional.of(existingDevice));
                when(deviceTokenRepository.save(any(DeviceToken.class))).thenReturn(existingDevice);
                when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("jwt");
                when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("rt");
                when(jwtTokenProvider.hashRefreshToken("rt")).thenReturn("rt-hash");

                GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("relogin-id-token").build();
                customerAuthService.loginWithGoogle(req, "web", httpRequest, new MockHttpServletResponse());

                assertEquals("Updated Name", activeCustomer.getName());
                verify(refreshTokenRepository, never()).revokeAllUserTokens(activeCustomer);
                verify(refreshTokenRepository, times(1)).revokeByUserAndDevice(activeCustomer, existingDevice);
            }
        }

        @Test
        @DisplayName("TC-AUTH-10A: Chặn tài khoản nội bộ (ADMIN/STAFF) đăng nhập qua Google ở cổng Khách hàng")
        void loginWithGoogle_Fail_InternalRoleBlocked() {
            User adminUser = User.builder().id(1L).email("admin@apsports.com").role(adminRole).status(UserStatus.active).build();
            GoogleIdToken mockIdToken = createMockGoogleIdToken("google-sub-admin", "admin@apsports.com", true, "Admin", null);

            try (MockedConstruction<GoogleIdTokenVerifier.Builder> mockedBuilder = mockConstruction(
                    GoogleIdTokenVerifier.Builder.class,
                    (mock, context) -> {
                        when(mock.setAudience(anyList())).thenReturn(mock);
                        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
                        when(verifier.verify("admin-id-token")).thenReturn(mockIdToken);
                        when(mock.build()).thenReturn(verifier);
                    })) {

                when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));

                GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("admin-id-token").build();
                SecurityException ex = assertThrows(SecurityException.class,
                        () -> customerAuthService.loginWithGoogle(req, "web", null, new MockHttpServletResponse()));

                assertEquals("Bạn không có quyền truy cập vào cổng khách hàng bằng tài khoản quản trị/nội bộ!", ex.getMessage());
            }
        }

        @Test
        @DisplayName("TC-AUTH-10B: Chặn tài khoản đang bị khóa (banned) đăng nhập bằng Google")
        void loginWithGoogle_Fail_BannedUserBlocked() {
            activeCustomer.setStatus(UserStatus.banned);
            GoogleIdToken mockIdToken = createMockGoogleIdToken("google-sub-1", "customer@example.com", true, "Customer", null);

            try (MockedConstruction<GoogleIdTokenVerifier.Builder> mockedBuilder = mockConstruction(
                    GoogleIdTokenVerifier.Builder.class,
                    (mock, context) -> {
                        when(mock.setAudience(anyList())).thenReturn(mock);
                        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
                        when(verifier.verify("banned-id-token")).thenReturn(mockIdToken);
                        when(mock.build()).thenReturn(verifier);
                    })) {

                when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

                GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("banned-id-token").build();
                IllegalStateException ex = assertThrows(IllegalStateException.class,
                        () -> customerAuthService.loginWithGoogle(req, "web", null, new MockHttpServletResponse()));

                assertTrue(ex.getMessage().contains("Tài khoản của bạn đã bị khóa"));
            }
        }

        @Test
        @DisplayName("TC-AUTH-10C: Chặn đăng nhập Google khi googleId trong DB xung đột với googleSub trong Token")
        void loginWithGoogle_Fail_ConflictingGoogleSubject() {
            activeCustomer.setGoogleId("original-google-sub-111");
            GoogleIdToken mockIdToken = createMockGoogleIdToken("different-google-sub-222", "customer@example.com", true, "Customer", null);

            try (MockedConstruction<GoogleIdTokenVerifier.Builder> mockedBuilder = mockConstruction(
                    GoogleIdTokenVerifier.Builder.class,
                    (mock, context) -> {
                        when(mock.setAudience(anyList())).thenReturn(mock);
                        GoogleIdTokenVerifier verifier = mock(GoogleIdTokenVerifier.class);
                        when(verifier.verify("conflict-id-token")).thenReturn(mockIdToken);
                        when(mock.build()).thenReturn(verifier);
                    })) {

                when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

                GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("conflict-id-token").build();
                SecurityException ex = assertThrows(SecurityException.class,
                        () -> customerAuthService.loginWithGoogle(req, "web", null, new MockHttpServletResponse()));

                assertEquals("Định danh tài khoản Google không khớp với dữ liệu hệ thống.", ex.getMessage());
            }
        }

        @Test
        @DisplayName("TC-AUTH-10.1: Chặn đăng nhập Google khi hệ thống chưa cấu hình CUSTOMER_ID")
        void loginWithGoogle_Fail_MissingClientIdConfig() {
            ReflectionTestUtils.setField(customerAuthService, "googleClientId", "");
            GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("dummy-token").build();

            IllegalStateException ex = assertThrows(IllegalStateException.class,
                    () -> customerAuthService.loginWithGoogle(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertTrue(ex.getMessage().contains("Hệ thống chưa cấu hình Google Client ID"));
        }

        @Test
        @DisplayName("TC-AUTH-10.2: Chặn đăng nhập Google khi request rỗng (không có cả idToken lẫn code)")
        void loginWithGoogle_Fail_EmptyPayload() {
            GoogleLoginRequest req = new GoogleLoginRequest();

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.loginWithGoogle(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Vui lòng cung cấp Google ID Token hoặc mã xác thực hợp lệ.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-10.3: Chặn đổi Authorization Code khi thiếu cấu hình CUSTOMER_SECRET_CODE")
        void loginWithGoogle_Fail_MissingClientSecretForMobileCode() {
            ReflectionTestUtils.setField(customerAuthService, "googleClientSecret", "");
            GoogleLoginRequest req = GoogleLoginRequest.builder().code("mobile-auth-code").build();

            IllegalStateException ex = assertThrows(IllegalStateException.class,
                    () -> customerAuthService.loginWithGoogle(req, "mobile", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertTrue(ex.getMessage().contains("Hệ thống chưa cấu hình Google Client Secret"));
        }

        @Test
        @DisplayName("TC-AUTH-10.4: Chặn đăng nhập Google khi chuỗi idToken không đúng định dạng chữ ký RSA")
        void loginWithGoogle_Fail_MalformedIdToken() {
            GoogleLoginRequest req = GoogleLoginRequest.builder().idToken("invalid.jwt.token").build();

            assertThrows(SecurityException.class,
                    () -> customerAuthService.loginWithGoogle(req, "web", new MockHttpServletRequest(), new MockHttpServletResponse()));
        }
    }

    // =========================================================================
    // NHÓM 4: QUẢN LÝ ĐA THIẾT BỊ (MAX 3 LRU), PHIÊN & ĐĂNG XUẤT (10 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 4: Quản lý Đa thiết bị (Max 3 LRU Eviction), Phiên & Đăng xuất (TC-AUTH-11 -> TC-AUTH-13)")
    class MultiDeviceAndSessionTests {

        @Test
        @DisplayName("TC-AUTH-11.1: Giới hạn tối đa 3 thiết bị - Tự động thu hồi thiết bị cũ nhất (LRU Eviction) khi đăng nhập thiết bị thứ 4")
        void login_EnforceMax3Devices_LruEviction() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");

            DeviceToken dev1Oldest = DeviceToken.builder().id(1L).deviceToken("dev-1").updatedAt(LocalDateTime.now().minusDays(3)).build();
            DeviceToken dev2 = DeviceToken.builder().id(2L).deviceToken("dev-2").updatedAt(LocalDateTime.now().minusDays(2)).build();
            DeviceToken dev3Newest = DeviceToken.builder().id(3L).deviceToken("dev-3").updatedAt(LocalDateTime.now().minusDays(1)).build();

            RefreshToken rt3 = RefreshToken.builder().id(30L).user(activeCustomer).deviceToken(dev3Newest).revoked(false).build();
            RefreshToken rt2 = RefreshToken.builder().id(20L).user(activeCustomer).deviceToken(dev2).revoked(false).build();
            RefreshToken rt1Oldest = RefreshToken.builder().id(10L).user(activeCustomer).deviceToken(dev1Oldest).revoked(false).build();

            MockHttpServletRequest httpRequest = new MockHttpServletRequest();
            httpRequest.addHeader("X-Device-Id", "dev-4-new");
            MockHttpServletResponse httpResponse = new MockHttpServletResponse();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("Pass12345", activeCustomer.getPassword())).thenReturn(true);
            when(deviceTokenRepository.findByDeviceToken("dev-4-new")).thenReturn(Optional.empty());
            when(refreshTokenRepository.findActiveSessionsByUser(activeCustomer))
                    .thenReturn(List.of(rt3, rt2, rt1Oldest));
            when(deviceTokenRepository.save(any(DeviceToken.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("rt");
            when(jwtTokenProvider.hashRefreshToken("rt")).thenReturn("hashed-rt");

            customerAuthService.login(req, "mobile", httpRequest, httpResponse);

            assertTrue(rt1Oldest.isRevoked(), "Thiết bị cũ nhất (dev-1) phải bị đánh dấu revoked = true");
            assertFalse(rt2.isRevoked(), "Thiết bị thứ 2 vẫn được giữ active");
            assertFalse(rt3.isRevoked(), "Thiết bị thứ 3 vẫn được giữ active");
            verify(refreshTokenRepository, times(1)).save(rt1Oldest);
        }

        @Test
        @DisplayName("TC-AUTH-11.2: Đăng nhập lại trên thiết bị đã nằm trong 3 thiết bị active -> Không thu hồi các thiết bị khác")
        void login_ExistingActiveDevice_DoesNotEvictOthers() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");

            DeviceToken dev1 = DeviceToken.builder().id(1L).deviceToken("dev-1").user(activeCustomer).build();
            DeviceToken dev2 = DeviceToken.builder().id(2L).deviceToken("dev-2").user(activeCustomer).build();
            DeviceToken dev3 = DeviceToken.builder().id(3L).deviceToken("dev-3").user(activeCustomer).build();

            RefreshToken rt1 = RefreshToken.builder().id(10L).user(activeCustomer).deviceToken(dev1).revoked(false).build();
            RefreshToken rt2 = RefreshToken.builder().id(20L).user(activeCustomer).deviceToken(dev2).revoked(false).build();
            RefreshToken rt3 = RefreshToken.builder().id(30L).user(activeCustomer).deviceToken(dev3).revoked(false).build();

            MockHttpServletRequest httpRequest = new MockHttpServletRequest();
            httpRequest.addHeader("X-Device-Id", "dev-2"); // Đăng nhập lại trên chính dev-2

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("Pass12345", activeCustomer.getPassword())).thenReturn(true);
            when(deviceTokenRepository.findByDeviceToken("dev-2")).thenReturn(Optional.of(dev2));
            when(refreshTokenRepository.findActiveSessionsByUser(activeCustomer)).thenReturn(List.of(rt1, rt2, rt3));
            when(deviceTokenRepository.save(any(DeviceToken.class))).thenReturn(dev2);
            when(jwtTokenProvider.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("rt");
            when(jwtTokenProvider.hashRefreshToken("rt")).thenReturn("hashed-rt");

            customerAuthService.login(req, "mobile", httpRequest, new MockHttpServletResponse());

            assertFalse(rt1.isRevoked());
            assertFalse(rt3.isRevoked());
            verify(refreshTokenRepository, times(1)).revokeByUserAndDevice(activeCustomer, dev2);
        }

        @Test
        @DisplayName("TC-AUTH-12: Đổi chủ thiết bị (User B đăng nhập trên thiết bị cũ của User A) -> Thu hồi toàn bộ token của User A trên thiết bị đó")
        void login_DifferentDeviceOwner_RevokesPreviousOwnerTokens() {
            User userA = User.builder().id(1L).email("usera@example.com").build();
            DeviceToken sharedDevice = DeviceToken.builder()
                    .id(50L)
                    .deviceToken("shared-device-uuid")
                    .user(userA)
                    .build();

            LoginCustomerRequest reqB = new LoginCustomerRequest();
            reqB.setEmail("customer@example.com");
            reqB.setPassword("Pass12345");

            MockHttpServletRequest httpRequest = new MockHttpServletRequest();
            httpRequest.addHeader("X-Device-Id", "shared-device-uuid");
            MockHttpServletResponse httpResponse = new MockHttpServletResponse();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("Pass12345", activeCustomer.getPassword())).thenReturn(true);
            when(deviceTokenRepository.findByDeviceToken("shared-device-uuid")).thenReturn(Optional.of(sharedDevice));
            when(refreshTokenRepository.findActiveSessionsByUser(activeCustomer)).thenReturn(Collections.emptyList());
            when(deviceTokenRepository.save(any(DeviceToken.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("rt");
            when(jwtTokenProvider.hashRefreshToken("rt")).thenReturn("hashed-rt");

            customerAuthService.login(reqB, "mobile", httpRequest, httpResponse);

            verify(refreshTokenRepository, times(1)).revokeByDeviceToken(sharedDevice);
            assertEquals(activeCustomer, sharedDevice.getUser(), "Chủ sở hữu thiết bị phải được chuyển sang User B");
        }

        @Test
        @DisplayName("TC-AUTH-13A: Lấy danh sách phiên active (GET /sessions) đánh dấu đúng currentDevice")
        void getActiveSessions_Success() {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("customer@example.com", null, Collections.emptyList())
            );

            DeviceToken d1 = DeviceToken.builder().id(1L).deviceToken("dev-current").deviceName("Chrome").updatedAt(LocalDateTime.now()).build();
            DeviceToken d2 = DeviceToken.builder().id(2L).deviceToken("dev-other").deviceName("iPhone").updatedAt(LocalDateTime.now().minusHours(2)).build();

            RefreshToken s1 = RefreshToken.builder().user(activeCustomer).deviceToken(d1).revoked(false).build();
            RefreshToken s2 = RefreshToken.builder().user(activeCustomer).deviceToken(d2).revoked(false).build();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(userRepository.findById(100L)).thenReturn(Optional.of(activeCustomer));
            when(refreshTokenRepository.findActiveSessionsByUser(activeCustomer)).thenReturn(List.of(s1, s2));

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader("X-Device-Id", "dev-current");

            List<UserSessionResponse> sessions = customerAuthService.getActiveSessions(request);

            assertEquals(2, sessions.size());
            assertTrue(sessions.get(0).isCurrentDevice());
            assertEquals("dev-current", sessions.get(0).getDeviceToken());
            assertFalse(sessions.get(1).isCurrentDevice());
        }

        @Test
        @DisplayName("TC-AUTH-13B.1: Thu hồi phiên thiết bị từ xa thành công (DELETE /sessions/{deviceToken})")
        void revokeSession_Success() {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("customer@example.com", null, Collections.emptyList())
            );
            DeviceToken targetDevice = DeviceToken.builder().id(2L).deviceToken("dev-remote").user(activeCustomer).build();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(userRepository.findById(100L)).thenReturn(Optional.of(activeCustomer));
            when(deviceTokenRepository.findByDeviceTokenAndUser("dev-remote", activeCustomer)).thenReturn(Optional.of(targetDevice));

            customerAuthService.revokeSession("dev-remote", new MockHttpServletRequest());

            verify(refreshTokenRepository, times(1)).revokeByUserAndDevice(activeCustomer, targetDevice);
        }

        @Test
        @DisplayName("TC-AUTH-13B.2: Chặn thu hồi phiên khi deviceToken thuộc về người dùng khác")
        void revokeSession_Fail_NotOwnedByUser() {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("customer@example.com", null, Collections.emptyList())
            );

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(userRepository.findById(100L)).thenReturn(Optional.of(activeCustomer));
            when(deviceTokenRepository.findByDeviceTokenAndUser("other-user-dev", activeCustomer)).thenReturn(Optional.empty());

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.revokeSession("other-user-dev", new MockHttpServletRequest()));

            assertEquals("Không tìm thấy thiết bị hoặc bạn không có quyền thu hồi phiên này.", ex.getMessage());
            verify(refreshTokenRepository, never()).revokeByUserAndDevice(any(), any());
        }

        @Test
        @DisplayName("TC-AUTH-13C: Đăng xuất trên Web & Mobile thu hồi RefreshToken và xóa Cookies")
        void logout_WebAndMobile_Success() {
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setCookies(new Cookie("refreshToken", "raw-web-rt"));
            request.addHeader("X-Client-Type", "mobile");
            request.addHeader("X-Device-Id", "mobile-dev-01");
            MockHttpServletResponse response = new MockHttpServletResponse();

            RefreshToken storedRt = RefreshToken.builder().token("hashed-web-rt").revoked(false).build();
            DeviceToken mobileDevice = DeviceToken.builder().deviceToken("mobile-dev-01").build();

            when(jwtTokenProvider.hashRefreshToken("raw-web-rt")).thenReturn("hashed-web-rt");
            when(refreshTokenRepository.findByToken("hashed-web-rt")).thenReturn(Optional.of(storedRt));
            when(deviceTokenRepository.findByDeviceToken("mobile-dev-01")).thenReturn(Optional.of(mobileDevice));

            customerAuthService.logout(request, response);

            assertTrue(storedRt.isRevoked());
            verify(refreshTokenRepository, times(1)).save(storedRt);
            verify(refreshTokenRepository, times(1)).revokeByDeviceToken(mobileDevice);
            assertTrue(response.getHeaders("Set-Cookie").stream().anyMatch(c -> c.contains("Max-Age=0")));
        }

        @Test
        @DisplayName("TC-AUTH-13D.1: Lấy thông tin người dùng hiện tại (GET /me) thành công")
        void getCurrentUser_Success() {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("customer@example.com", null, Collections.emptyList())
            );
            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            UserResponse res = customerAuthService.getCurrentUser(new MockHttpServletRequest());

            assertEquals(100L, res.getId());
            assertEquals("customer@example.com", res.getEmail());
        }

        @Test
        @DisplayName("TC-AUTH-13D.2: Chặn GET /me khi chưa đăng nhập hoặc principal là anonymousUser")
        void getCurrentUser_Fail_Unauthenticated() {
            SecurityContextHolder.clearContext();

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.getCurrentUser(new MockHttpServletRequest()));

            assertEquals("Chưa đăng nhập hoặc phiên làm việc đã hết hạn.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-13E: Phân tích đúng tên Trình duyệt & Hệ điều hành từ User-Agent & X-Forwarded-For")
        void parseDeviceNameFromUserAgent_AndProxyIp_Success() {
            LoginCustomerRequest req = new LoginCustomerRequest();
            req.setEmail("customer@example.com");
            req.setPassword("Pass12345");

            MockHttpServletRequest httpRequest = new MockHttpServletRequest();
            httpRequest.addHeader("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Version/17.0 Safari/605.1.15");
            httpRequest.addHeader("X-Forwarded-For", "203.113.1.5, 10.0.0.1");

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.matches("Pass12345", activeCustomer.getPassword())).thenReturn(true);
            when(deviceTokenRepository.findByDeviceToken(anyString())).thenReturn(Optional.empty());
            ArgumentCaptor<DeviceToken> deviceCaptor = ArgumentCaptor.forClass(DeviceToken.class);
            when(deviceTokenRepository.save(deviceCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));
            when(jwtTokenProvider.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("rt");
            when(jwtTokenProvider.hashRefreshToken("rt")).thenReturn("hashed-rt");

            customerAuthService.login(req, "web", httpRequest, new MockHttpServletResponse());

            DeviceToken savedDevice = deviceCaptor.getValue();
            assertEquals("Apple Safari (macOS)", savedDevice.getDeviceName());
            assertEquals("203.113.1.5", savedDevice.getLastIp());
        }
    }

    // =========================================================================
    // NHÓM 5: LÀM MỚI TOKEN - ROTATION, GRACE WINDOW 30S & ANTI-HIJACKING (10 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 5: Refresh Token Rotation, Grace Window 30s & Anti-Hijacking (TC-AUTH-14 -> TC-AUTH-16)")
    class RefreshTokenTests {

        @Test
        @DisplayName("TC-AUTH-14.1: Xoay vòng Refresh Token chuẩn trên Mobile (Lưu previousToken & cấp cặp token mới)")
        void refreshToken_Success_StandardRotationMobile() {
            DeviceToken device = DeviceToken.builder().deviceToken("dev-mobile-1").build();
            RefreshToken entity = RefreshToken.builder()
                    .user(activeCustomer)
                    .deviceToken(device)
                    .token("old-hashed-rt")
                    .expiresAt(LocalDateTime.now().plusDays(5))
                    .createdAt(LocalDateTime.now().minusDays(2))
                    .revoked(false)
                    .build();

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.addHeader("X-Device-Id", "dev-mobile-1");
            MockHttpServletResponse response = new MockHttpServletResponse();

            when(jwtTokenProvider.hashRefreshToken("old-raw-rt")).thenReturn("old-hashed-rt");
            when(refreshTokenRepository.findByToken("old-hashed-rt")).thenReturn(Optional.of(entity));
            when(jwtTokenProvider.getRefreshTokenAbsoluteMaxDays()).thenReturn(30L);
            when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("new-access-token");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("new-raw-rt");
            when(jwtTokenProvider.hashRefreshToken("new-raw-rt")).thenReturn("new-hashed-rt");

            TokenResponse res = customerAuthService.refreshToken("mobile", null, "old-raw-rt", request, response);

            assertNotNull(res);
            assertEquals("new-access-token", res.getAccessToken());
            assertEquals("new-raw-rt", res.getRefreshToken());
            assertEquals("old-hashed-rt", entity.getPreviousToken());
            assertEquals("new-hashed-rt", entity.getToken());
            assertNotNull(entity.getLastRotatedAt());
            verify(refreshTokenRepository, times(1)).save(entity);
        }

        @Test
        @DisplayName("TC-AUTH-14.2: Xoay vòng Refresh Token chuẩn trên Web (Cập nhật HttpOnly Cookies & trả null body)")
        void refreshToken_Success_StandardRotationWeb() {
            RefreshToken entity = RefreshToken.builder()
                    .user(activeCustomer)
                    .token("web-old-hash")
                    .expiresAt(LocalDateTime.now().plusDays(5))
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .revoked(false)
                    .build();

            MockHttpServletResponse response = new MockHttpServletResponse();

            when(jwtTokenProvider.hashRefreshToken("web-old-raw")).thenReturn("web-old-hash");
            when(refreshTokenRepository.findByToken("web-old-hash")).thenReturn(Optional.of(entity));
            when(jwtTokenProvider.getRefreshTokenAbsoluteMaxDays()).thenReturn(30L);
            when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("web-new-at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("web-new-rt");
            when(jwtTokenProvider.hashRefreshToken("web-new-rt")).thenReturn("web-new-hash");

            TokenResponse res = customerAuthService.refreshToken("web", "web-old-raw", null, new MockHttpServletRequest(), response);

            assertNull(res, "Web Client chỉ nhận Cookie, không nhận TokenResponse JSON");
            assertEquals(2, response.getHeaders("Set-Cookie").size());
        }

        @Test
        @DisplayName("TC-AUTH-14.3: Chặn Mobile Refresh nếu không gửi refreshToken trong Request Body")
        void refreshToken_Fail_MobileMissingBodyToken() {
            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.refreshToken("mobile", "cookie-rt", "", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Yêu cầu từ ứng dụng Mobile phải cung cấp refreshToken trong Request Body.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-14.4: Chặn Web Refresh nếu không tồn tại Cookie refreshToken")
        void refreshToken_Fail_WebMissingCookieToken() {
            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.refreshToken("web", null, "body-rt", new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Refresh Token không tồn tại trong Cookie.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-15A: Xử lý Race-Condition trong Grace Window 30 giây (Cấp AccessToken mới, không xoay vòng lại RefreshToken)")
        void refreshToken_Success_Within30sGraceWindow() {
            RefreshToken entity = RefreshToken.builder()
                    .user(activeCustomer)
                    .token("already-rotated-new-hash")
                    .previousToken("just-used-old-hash")
                    .lastRotatedAt(LocalDateTime.now().minusSeconds(10))
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .revoked(false)
                    .build();

            when(jwtTokenProvider.hashRefreshToken("just-used-old-raw")).thenReturn("just-used-old-hash");
            when(refreshTokenRepository.findByToken("just-used-old-hash")).thenReturn(Optional.empty());
            when(refreshTokenRepository.findByPreviousToken("just-used-old-hash")).thenReturn(Optional.of(entity));
            when(jwtTokenProvider.getRefreshTokenAbsoluteMaxDays()).thenReturn(30L);
            when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("grace-access-token");

            TokenResponse res = customerAuthService.refreshToken("mobile", null, "just-used-old-raw", new MockHttpServletRequest(), new MockHttpServletResponse());

            assertNotNull(res);
            assertEquals("grace-access-token", res.getAccessToken());
            assertEquals("already-rotated-new-hash", entity.getToken(), "Token chính trong DB không được xoay vòng lại lần 2");
            verify(refreshTokenRepository, never()).save(entity);
        }

        @Test
        @DisplayName("TC-AUTH-15B: Dùng lại Previous Token khi đã quá Grace Window 30 giây -> Khóa phiên ngay lập tức")
        void refreshToken_Fail_ExpiredGraceWindow_RevokesToken() {
            RefreshToken entity = RefreshToken.builder()
                    .user(activeCustomer)
                    .token("current-hash")
                    .previousToken("old-hash")
                    .lastRotatedAt(LocalDateTime.now().minusSeconds(45))
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .revoked(false)
                    .build();

            when(jwtTokenProvider.hashRefreshToken("old-raw")).thenReturn("old-hash");
            when(refreshTokenRepository.findByToken("old-hash")).thenReturn(Optional.empty());
            when(refreshTokenRepository.findByPreviousToken("old-hash")).thenReturn(Optional.of(entity));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.refreshToken("web", "old-raw", null, new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Refresh Token cũ đã hết thời gian gia hạn.", ex.getMessage());
            assertTrue(entity.isRevoked());
            verify(refreshTokenRepository, times(1)).save(entity);
        }

        @Test
        @DisplayName("TC-AUTH-16A: Phát hiện Token Hijacking (Sai lệch Device ID) -> Thu hồi RefreshToken ngay lập tức")
        void refreshToken_Fail_DeviceMismatch_TokenHijacking() {
            DeviceToken originalDevice = DeviceToken.builder().deviceToken("original-device-id").build();
            RefreshToken entity = RefreshToken.builder()
                    .user(activeCustomer)
                    .deviceToken(originalDevice)
                    .token("valid-hash")
                    .expiresAt(LocalDateTime.now().plusDays(5))
                    .createdAt(LocalDateTime.now().minusDays(1))
                    .revoked(false)
                    .build();

            MockHttpServletRequest hackerRequest = new MockHttpServletRequest();
            hackerRequest.addHeader("X-Device-Id", "hacker-stolen-device-id");

            when(jwtTokenProvider.hashRefreshToken("valid-raw")).thenReturn("valid-hash");
            when(refreshTokenRepository.findByToken("valid-hash")).thenReturn(Optional.of(entity));
            when(jwtTokenProvider.getRefreshTokenAbsoluteMaxDays()).thenReturn(30L);

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.refreshToken("mobile", null, "valid-raw", hackerRequest, new MockHttpServletResponse()));

            assertEquals("Cảnh báo an ninh: Phiên đăng nhập không hợp lệ trên thiết bị này.", ex.getMessage());
            assertTrue(entity.isRevoked());
            verify(refreshTokenRepository, times(1)).save(entity);
        }

        @Test
        @DisplayName("TC-AUTH-16B: Phiên đăng nhập vượt quá thời hạn tối đa 30 ngày (Absolute Max Lifetime) -> Buộc đăng nhập lại")
        void refreshToken_Fail_ExceededAbsoluteMax30Days() {
            RefreshToken entity = RefreshToken.builder()
                    .user(activeCustomer)
                    .token("valid-hash")
                    .expiresAt(LocalDateTime.now().plusDays(3))
                    .createdAt(LocalDateTime.now().minusDays(31))
                    .revoked(false)
                    .build();

            when(jwtTokenProvider.hashRefreshToken("valid-raw")).thenReturn("valid-hash");
            when(refreshTokenRepository.findByToken("valid-hash")).thenReturn(Optional.of(entity));
            when(jwtTokenProvider.getRefreshTokenAbsoluteMaxDays()).thenReturn(30L);

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.refreshToken("web", "valid-raw", null, new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Phiên đăng nhập đã vượt quá thời hạn tối đa. Vui lòng đăng nhập lại.", ex.getMessage());
            assertTrue(entity.isRevoked());
            verify(refreshTokenRepository, times(1)).save(entity);
        }

        @Test
        @DisplayName("TC-AUTH-16C.1: Chặn làm mới khi Refresh Token đã bị đánh dấu revoked = true")
        void refreshToken_Fail_AlreadyRevoked() {
            RefreshToken revokedEntity = RefreshToken.builder()
                    .user(activeCustomer)
                    .token("revoked-hash")
                    .expiresAt(LocalDateTime.now().plusDays(2))
                    .revoked(true)
                    .build();

            when(jwtTokenProvider.hashRefreshToken("revoked-raw")).thenReturn("revoked-hash");
            when(refreshTokenRepository.findByToken("revoked-hash")).thenReturn(Optional.of(revokedEntity));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.refreshToken("web", "revoked-raw", null, new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Refresh Token đã bị thu hồi.", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-16C.2: Chặn làm mới khi Refresh Token đã hết hạn 7 ngày (expiresAt < now)")
        void refreshToken_Fail_Expired7Days() {
            RefreshToken expiredEntity = RefreshToken.builder()
                    .user(activeCustomer)
                    .token("expired-hash")
                    .expiresAt(LocalDateTime.now().minusHours(1))
                    .revoked(false)
                    .build();

            when(jwtTokenProvider.hashRefreshToken("expired-raw")).thenReturn("expired-hash");
            when(refreshTokenRepository.findByToken("expired-hash")).thenReturn(Optional.of(expiredEntity));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.refreshToken("web", "expired-raw", null, new MockHttpServletRequest(), new MockHttpServletResponse()));

            assertEquals("Refresh Token đã hết hạn.", ex.getMessage());
        }
    }

    // =========================================================================
    // NHÓM 6: QUÊN MẬT KHẨU & ĐẶT LẠI MẬT KHẨU (6 TESTS)
    // =========================================================================
    @Nested
    @DisplayName("Nhóm 6: Quên mật khẩu & Đặt lại mật khẩu (TC-AUTH-17 -> TC-AUTH-18)")
    class ForgotAndResetPasswordTests {

        @Test
        @DisplayName("TC-AUTH-17A: Yêu cầu Quên mật khẩu thành công (Xóa token cũ, lưu token mới & gửi Email)")
        void forgotPassword_Success() {
            ForgotPasswordRequest req = ForgotPasswordRequest.builder().email("  customer@example.com ").build();
            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            customerAuthService.forgotPassword(req);

            verify(passwordResetTokenRepository, times(1)).deleteByEmail("customer@example.com");
            ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
            verify(passwordResetTokenRepository, times(1)).save(tokenCaptor.capture());

            String generatedToken = tokenCaptor.getValue().getToken();
            assertNotNull(generatedToken);
            assertEquals(64, generatedToken.length());
            verify(emailService, times(1)).sendPasswordResetEmail("customer@example.com", "Nguyễn Văn A", generatedToken);
        }

        @Test
        @DisplayName("TC-AUTH-17B & 17C: Chặn Quên mật khẩu khi Email không tồn tại hoặc tài khoản bị khóa")
        void forgotPassword_Fail_EmailNotFoundOrBanned() {
            ForgotPasswordRequest reqNotFound = ForgotPasswordRequest.builder().email("missing@example.com").build();
            when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

            assertThrows(IllegalArgumentException.class, () -> customerAuthService.forgotPassword(reqNotFound));

            activeCustomer.setStatus(UserStatus.banned);
            ForgotPasswordRequest reqBanned = ForgotPasswordRequest.builder().email("customer@example.com").build();
            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            assertThrows(SecurityException.class, () -> customerAuthService.forgotPassword(reqBanned));
        }

        @Test
        @DisplayName("TC-AUTH-17D: Chặn Quên mật khẩu đối với tài khoản đăng nhập bằng Google OAuth2")
        void forgotPassword_Fail_GoogleAccount() {
            activeCustomer.setGoogleId("google-sub-123");
            ForgotPasswordRequest req = ForgotPasswordRequest.builder().email("customer@example.com").build();
            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerAuthService.forgotPassword(req));

            assertTrue(ex.getMessage().contains("Tài khoản này đăng nhập bằng Google OAuth2"));
            verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("TC-AUTH-18A: Đặt lại mật khẩu thành công (Trong hạn 15 phút) -> Xóa token reset & Thu hồi toàn bộ RefreshToken")
        void resetPassword_Success() {
            ResetPasswordRequest req = ResetPasswordRequest.builder()
                    .email("customer@example.com")
                    .token("valid-reset-token")
                    .newPassword("NewPass123")
                    .confirmPassword("NewPass123")
                    .build();

            PasswordResetToken tokenEntity = PasswordResetToken.builder()
                    .email("customer@example.com")
                    .token("valid-reset-token")
                    .createdAt(LocalDateTime.now().minusMinutes(5))
                    .build();

            when(passwordResetTokenRepository.findByTokenAndEmail("valid-reset-token", "customer@example.com"))
                    .thenReturn(Optional.of(tokenEntity));
            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));
            when(passwordEncoder.encode("NewPass123")).thenReturn("new_bcrypt_hash");

            customerAuthService.resetPassword(req);

            assertEquals("new_bcrypt_hash", activeCustomer.getPassword());
            verify(userRepository, times(1)).save(activeCustomer);
            verify(passwordResetTokenRepository, times(1)).delete(tokenEntity);
            verify(refreshTokenRepository, times(1)).revokeAllUserTokens(activeCustomer);
        }

        @Test
        @DisplayName("TC-AUTH-18B: Đặt lại mật khẩu thất bại khi Token đã quá hạn 15 phút TTL -> Xóa token và ném SecurityException")
        void resetPassword_Fail_ExpiredToken15Minutes() {
            ResetPasswordRequest req = ResetPasswordRequest.builder()
                    .email("customer@example.com")
                    .token("expired-token")
                    .newPassword("NewPass123")
                    .confirmPassword("NewPass123")
                    .build();

            PasswordResetToken expiredEntity = PasswordResetToken.builder()
                    .email("customer@example.com")
                    .token("expired-token")
                    .createdAt(LocalDateTime.now().minusMinutes(16))
                    .build();

            when(passwordResetTokenRepository.findByTokenAndEmail("expired-token", "customer@example.com"))
                    .thenReturn(Optional.of(expiredEntity));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> customerAuthService.resetPassword(req));

            assertTrue(ex.getMessage().contains("quá 15 phút"));
            verify(passwordResetTokenRepository, times(1)).delete(expiredEntity);
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("TC-AUTH-18C: Đặt lại mật khẩu thất bại khi mật khẩu xác nhận lệch hoặc tài khoản đã gộp Google")
        void resetPassword_Fail_MismatchOrGoogleAccount() {
            ResetPasswordRequest mismatchReq = ResetPasswordRequest.builder()
                    .email("customer@example.com")
                    .token("token-1")
                    .newPassword("NewPass123")
                    .confirmPassword("Different123")
                    .build();

            assertThrows(IllegalArgumentException.class, () -> customerAuthService.resetPassword(mismatchReq));

            // Trường hợp tài khoản đã gộp sang Google sau khi lấy link reset
            activeCustomer.setGoogleId("google-sub-999");
            ResetPasswordRequest googleReq = ResetPasswordRequest.builder()
                    .email("customer@example.com")
                    .token("token-2")
                    .newPassword("NewPass123")
                    .confirmPassword("NewPass123")
                    .build();
            PasswordResetToken tokenEntity = PasswordResetToken.builder()
                    .email("customer@example.com")
                    .token("token-2")
                    .createdAt(LocalDateTime.now().minusMinutes(2))
                    .build();

            when(passwordResetTokenRepository.findByTokenAndEmail("token-2", "customer@example.com"))
                    .thenReturn(Optional.of(tokenEntity));
            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            assertThrows(SecurityException.class, () -> customerAuthService.resetPassword(googleReq));
            verify(passwordResetTokenRepository, times(1)).delete(tokenEntity);
        }
    }
}
