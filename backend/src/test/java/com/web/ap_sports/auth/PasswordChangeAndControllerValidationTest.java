package com.web.ap_sports.auth;

import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.admin.ChangeAdminPasswordRequest;
import com.web.ap_sports.dto.request.customer.ChangePasswordRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.AuthTokens;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.exception.GlobalExceptionHandler;
import com.web.ap_sports.exception.RateLimitExceededException;
import com.web.ap_sports.repository.RefreshTokenRepository;
import com.web.ap_sports.repository.RolePermissionRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.impl.AdminProfileServiceImpl;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.customer.impl.CustomerProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho chức năng Đổi mật khẩu Hồ sơ (TC-AUTH-19) & GlobalExceptionHandler.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Profile ChangePassword & GlobalExceptionHandler Unit Tests")
class PasswordChangeAndControllerValidationTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private RolePermissionRepository rolePermissionRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CustomerProfileServiceImpl customerProfileService;

    @InjectMocks
    private AdminProfileServiceImpl adminProfileService;

    private User customerUser;
    private User adminUser;

    @BeforeEach
    void setUp() {
        Role customerRole = Role.builder().id(3L).name("CUSTOMER").build();
        Role adminRole = Role.builder().id(1L).name("ADMIN").build();

        customerUser = User.builder()
                .id(100L)
                .email("customer@example.com")
                .password("old_hashed_pass")
                .status(UserStatus.active)
                .role(customerRole)
                .build();

        adminUser = User.builder()
                .id(1L)
                .email("admin@apsports.com")
                .password("old_admin_hashed")
                .status(UserStatus.active)
                .role(adminRole)
                .build();
    }

    @Nested
    @DisplayName("TC-AUTH-19: Đổi mật khẩu trong Hồ sơ Khách hàng & Quản trị viên (Seamless UX)")
    class ChangePasswordTests {

        @Test
        @DisplayName("TC-AUTH-19A.1: Khách hàng đổi mật khẩu thành công -> Thu hồi toàn bộ RT cũ TRƯỚC khi lưu RT mới")
        void customerChangePassword_Success_SeamlessUx() {
            ChangePasswordRequest req = ChangePasswordRequest.builder()
                    .oldPassword("OldPass123")
                    .newPassword("NewPass456")
                    .confirmPassword("NewPass456")
                    .build();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customerUser));
            when(passwordEncoder.matches("OldPass123", "old_hashed_pass")).thenReturn(true);
            when(passwordEncoder.encode("NewPass456")).thenReturn("new_hashed_pass");
            when(jwtTokenProvider.generateAccessToken(100L, "customer@example.com", "CUSTOMER")).thenReturn("new-at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("new-raw-rt");
            when(jwtTokenProvider.hashRefreshToken("new-raw-rt")).thenReturn("new-hashed-rt");

            AuthTokens tokens = customerProfileService.changePassword("customer@example.com", req);

            assertNotNull(tokens);
            assertEquals("new-at", tokens.getAccessToken());
            assertEquals("new-raw-rt", tokens.getRawRefreshToken());
            assertEquals("new_hashed_pass", customerUser.getPassword());

            InOrder inOrder = inOrder(refreshTokenRepository);
            inOrder.verify(refreshTokenRepository).revokeAllUserTokens(customerUser);
            inOrder.verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("TC-AUTH-19B: Đổi mật khẩu thất bại khi nhập sai mật khẩu cũ")
        void customerChangePassword_Fail_WrongOldPassword() {
            ChangePasswordRequest req = ChangePasswordRequest.builder()
                    .oldPassword("WrongOldPass1")
                    .newPassword("NewPass456")
                    .confirmPassword("NewPass456")
                    .build();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customerUser));
            when(passwordEncoder.matches("WrongOldPass1", "old_hashed_pass")).thenReturn(false);

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerProfileService.changePassword("customer@example.com", req));

            assertEquals("Mật khẩu cũ không chính xác.", ex.getMessage());
            verify(refreshTokenRepository, never()).revokeAllUserTokens(any());
        }

        @Test
        @DisplayName("TC-AUTH-19C: Chặn đổi mật khẩu đối với tài khoản Khách hàng đăng nhập bằng Google")
        void customerChangePassword_Fail_GoogleAccountBlocked() {
            customerUser.setGoogleId("google-sub-999");
            ChangePasswordRequest req = ChangePasswordRequest.builder()
                    .oldPassword("AnyPass123")
                    .newPassword("NewPass456")
                    .confirmPassword("NewPass456")
                    .build();

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(customerUser));

            IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                    () -> customerProfileService.changePassword("customer@example.com", req));

            assertTrue(ex.getMessage().contains("Tài khoản đăng nhập bằng Google không sử dụng mật khẩu riêng"));
        }

        @Test
        @DisplayName("TC-AUTH-19A.2: Admin đổi mật khẩu thành công -> Thu hồi RT cũ & cấp cặp Token mới")
        void adminChangePassword_Success() {
            ChangeAdminPasswordRequest req = ChangeAdminPasswordRequest.builder()
                    .oldPassword("AdminOld123")
                    .newPassword("AdminNew456")
                    .confirmPassword("AdminNew456")
                    .build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
            when(passwordEncoder.matches("AdminOld123", "old_admin_hashed")).thenReturn(true);
            when(passwordEncoder.encode("AdminNew456")).thenReturn("new_admin_hashed");
            when(jwtTokenProvider.generateAccessToken(1L, "admin@apsports.com", "ADMIN")).thenReturn("admin-new-at");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("admin-new-rt");
            when(jwtTokenProvider.hashRefreshToken("admin-new-rt")).thenReturn("admin-new-rt-hash");

            AuthTokens tokens = adminProfileService.changePassword("admin@apsports.com", req);

            assertNotNull(tokens);
            assertEquals("admin-new-at", tokens.getAccessToken());
            verify(refreshTokenRepository, times(1)).revokeAllUserTokens(adminUser);
            verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
        }
    }

    @Nested
    @DisplayName("Kiểm thử GlobalExceptionHandler cho các mã lỗi Auth (400, 401, 429)")
    class GlobalExceptionHandlerAuthTests {

        private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

        @Test
        @DisplayName("Bắt IllegalStateException (tài khoản pending/banned) trả về đúng HTTP 400 thay vì HTTP 500")
        void handleIllegalStateException_Returns400() {
            IllegalStateException ex = new IllegalStateException("Email đang chờ xác nhận. Vui lòng kiểm tra email.");
            ResponseEntity<ApiResponse<Void>> response = handler.handleIllegalArgument(ex);

            assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(400, response.getBody().getStatus());
            assertEquals("Email đang chờ xác nhận. Vui lòng kiểm tra email.", response.getBody().getMessage());
        }

        @Test
        @DisplayName("Bắt SecurityException trả về đúng HTTP 401 Unauthorized")
        void handleSecurityException_Returns401() {
            SecurityException ex = new SecurityException("Refresh Token đã hết hạn.");
            ResponseEntity<ApiResponse<Void>> response = handler.handleSecurityException(ex);

            assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
            assertEquals(401, response.getBody().getStatus());
        }

        @Test
        @DisplayName("Bắt RateLimitExceededException trả về đúng HTTP 429 kèm Header Retry-After")
        void handleRateLimitExceededException_Returns429() {
            RateLimitExceededException ex = new RateLimitExceededException("Thao tác quá nhiều lần", 60);
            ResponseEntity<ApiResponse<Void>> response = handler.handleRateLimitExceeded(ex);

            assertEquals(HttpStatus.TOO_MANY_REQUESTS, response.getStatusCode());
            assertEquals("60", response.getHeaders().getFirst("Retry-After"));
            assertEquals(429, response.getBody().getStatus());
        }
    }
}
