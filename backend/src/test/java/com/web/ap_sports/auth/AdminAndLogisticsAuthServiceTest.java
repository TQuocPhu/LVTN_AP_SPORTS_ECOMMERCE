package com.web.ap_sports.auth;

import com.web.ap_sports.config.JwtTokenProvider;
import com.web.ap_sports.dto.request.admin.AdminLoginRequest;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.entity.Permission;
import com.web.ap_sports.entity.RefreshToken;
import com.web.ap_sports.entity.Role;
import com.web.ap_sports.entity.RolePermission;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.repository.RefreshTokenRepository;
import com.web.ap_sports.repository.RolePermissionRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.impl.AdminAuthServiceImpl;
import com.web.ap_sports.service.common.impl.DemoLogisticsAuthServiceImpl;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho AdminAuthServiceImpl & DemoLogisticsAuthServiceImpl (Bao phủ Nhóm 7: TC-AUTH-20 & TC-AUTH-21).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminAuthService & DemoLogisticsAuthService Unit Tests")
class AdminAndLogisticsAuthServiceTest {

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

    @InjectMocks
    private AdminAuthServiceImpl adminAuthService;

    @InjectMocks
    private DemoLogisticsAuthServiceImpl logisticsAuthService;

    private Role adminRole;
    private Role customerRole;
    private Role ghnShipperRole;
    private User activeAdmin;
    private User activeCustomer;
    private User activeGhnShipper;

    @BeforeEach
    void setUp() {
        adminRole = Role.builder().id(1L).name("ADMIN").build();
        customerRole = Role.builder().id(3L).name("CUSTOMER").build();
        ghnShipperRole = Role.builder().id(5L).name("GHN_SHIPPER").build();

        activeAdmin = User.builder()
                .id(1L)
                .name("Quản Trị Viên")
                .email("admin@apsports.com")
                .password("hashed_admin_pass")
                .status(UserStatus.active)
                .role(adminRole)
                .build();

        activeCustomer = User.builder()
                .id(100L)
                .name("Khách Hàng")
                .email("customer@example.com")
                .password("hashed_customer_pass")
                .status(UserStatus.active)
                .role(customerRole)
                .build();

        activeGhnShipper = User.builder()
                .id(200L)
                .name("Tài Xế GHN")
                .email("shipper@ghn.vn")
                .password("hashed_shipper_pass")
                .status(UserStatus.active)
                .role(ghnShipperRole)
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================================
    // TC-AUTH-20: CỔNG QUẢN TRỊ ADMIN PORTAL
    // =========================================================================
    @Nested
    @DisplayName("TC-AUTH-20: Cổng Quản trị Admin Portal (/api/v1/admin/auth/*)")
    class AdminPortalAuthTests {

        @Test
        @DisplayName("TC-AUTH-20A.1: Admin đăng nhập thành công, chuẩn hóa Email, thu hồi RT cũ & trả danh sách Permissions")
        void adminLogin_Success() {
            AdminLoginRequest req = new AdminLoginRequest();
            req.setEmail("  ADMIN@apsports.com  ");
            req.setPassword("AdminPass123");

            Permission p1 = Permission.builder().id(1L).name("MANAGE_PRODUCTS").build();
            Permission p2 = Permission.builder().id(2L).name("MANAGE_ORDERS").build();
            RolePermission rp1 = RolePermission.builder().role(adminRole).permission(p1).build();
            RolePermission rp2 = RolePermission.builder().role(adminRole).permission(p2).build();

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(activeAdmin));
            when(passwordEncoder.matches("AdminPass123", "hashed_admin_pass")).thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(1L, "admin@apsports.com", "ADMIN")).thenReturn("admin-jwt");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("admin-raw-rt");
            when(jwtTokenProvider.hashRefreshToken("admin-raw-rt")).thenReturn("admin-hashed-rt");
            when(rolePermissionRepository.findByRole(adminRole)).thenReturn(List.of(rp1, rp2));

            MockHttpServletResponse response = new MockHttpServletResponse();
            UserResponse res = adminAuthService.login(req, response);

            assertNotNull(res);
            assertEquals("ADMIN", res.getRoleName());
            assertEquals(List.of("MANAGE_PRODUCTS", "MANAGE_ORDERS"), res.getPermissions());
            verify(refreshTokenRepository, times(1)).revokeAllUserTokens(activeAdmin);
            verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
            assertEquals(2, response.getHeaders("Set-Cookie").size());
        }

        @Test
        @DisplayName("TC-AUTH-20B.1: Chặn tuyệt đối tài khoản CUSTOMER đăng nhập vào Admin Portal")
        void adminLogin_Fail_CustomerRoleRejected() {
            AdminLoginRequest req = new AdminLoginRequest();
            req.setEmail("customer@example.com");
            req.setPassword("CustomerPass123");

            when(userRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(activeCustomer));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> adminAuthService.login(req, new MockHttpServletResponse()));

            assertEquals("Bạn không có quyền truy cập vào hệ thống quản trị!", ex.getMessage());
            verify(jwtTokenProvider, never()).generateAccessToken(anyLong(), anyString(), anyString());
        }

        @Test
        @DisplayName("TC-AUTH-20A.2: Xoay vòng Refresh Token (Rotation) cho Admin thành công")
        void adminRefreshToken_Success() {
            RefreshToken oldToken = RefreshToken.builder()
                    .user(activeAdmin)
                    .token("old-admin-hash")
                    .expiresAt(LocalDateTime.now().plusDays(5))
                    .revoked(false)
                    .build();

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setCookies(new Cookie("refreshToken", "old-admin-raw"));
            MockHttpServletResponse response = new MockHttpServletResponse();

            when(jwtTokenProvider.hashRefreshToken("old-admin-raw")).thenReturn("old-admin-hash");
            when(refreshTokenRepository.findByToken("old-admin-hash")).thenReturn(Optional.of(oldToken));
            when(jwtTokenProvider.generateAccessToken(1L, "admin@apsports.com", "ADMIN")).thenReturn("new-admin-jwt");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("new-admin-raw");
            when(jwtTokenProvider.hashRefreshToken("new-admin-raw")).thenReturn("new-admin-hash");

            adminAuthService.refreshToken(request, response);

            assertTrue(oldToken.isRevoked(), "Token cũ của Admin phải bị đánh dấu revoked = true");
            verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
            assertEquals(2, response.getHeaders("Set-Cookie").size());
        }

        @Test
        @DisplayName("TC-AUTH-20B.2: Chặn tài khoản CUSTOMER gọi API /admin/auth/refresh bằng Cookie của Customer")
        void adminRefreshToken_Fail_CustomerRoleRejected() {
            RefreshToken customerToken = RefreshToken.builder()
                    .user(activeCustomer)
                    .token("cust-hash")
                    .expiresAt(LocalDateTime.now().plusDays(5))
                    .revoked(false)
                    .build();

            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setCookies(new Cookie("refreshToken", "cust-raw"));

            when(jwtTokenProvider.hashRefreshToken("cust-raw")).thenReturn("cust-hash");
            when(refreshTokenRepository.findByToken("cust-hash")).thenReturn(Optional.of(customerToken));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> adminAuthService.refreshToken(request, new MockHttpServletResponse()));

            assertEquals("Bạn không có quyền truy cập vào hệ thống quản trị!", ex.getMessage());
        }

        @Test
        @DisplayName("TC-AUTH-20C: Lấy thông tin Admin hiện tại (/me) & Đăng xuất Admin (/logout)")
        void adminGetCurrentAndLogout_Success() {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("admin@apsports.com", null, Collections.emptyList())
            );
            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(activeAdmin));
            when(rolePermissionRepository.findByRole(adminRole)).thenReturn(List.of());

            UserResponse me = adminAuthService.getCurrentAdmin(new MockHttpServletRequest());
            assertEquals("ADMIN", me.getRoleName());

            RefreshToken adminRt = RefreshToken.builder().token("admin-rt-hash").revoked(false).build();
            MockHttpServletRequest logoutReq = new MockHttpServletRequest();
            logoutReq.setCookies(new Cookie("refreshToken", "admin-rt-raw"));
            MockHttpServletResponse logoutRes = new MockHttpServletResponse();

            when(jwtTokenProvider.hashRefreshToken("admin-rt-raw")).thenReturn("admin-rt-hash");
            when(refreshTokenRepository.findByToken("admin-rt-hash")).thenReturn(Optional.of(adminRt));

            adminAuthService.logout(logoutReq, logoutRes);
            assertTrue(adminRt.isRevoked());
            assertEquals(2, logoutRes.getHeaders("Set-Cookie").size());
        }
    }

    // =========================================================================
    // TC-AUTH-21: CỔNG DEMO LOGISTICS (GHN_STATION & GHN_SHIPPER)
    // =========================================================================
    @Nested
    @DisplayName("TC-AUTH-21: Cổng Demo Logistics GHN (/api/v1/demo/logistics/auth/*)")
    class DemoLogisticsAuthTests {

        @Test
        @DisplayName("TC-AUTH-21A: Nhân viên GHN_SHIPPER đăng nhập thành công vào cổng Logistics")
        void logisticsLogin_Success_GhnShipper() {
            AdminLoginRequest req = new AdminLoginRequest();
            req.setEmail("  SHIPPER@ghn.vn ");
            req.setPassword("ShipperPass123");

            when(userRepository.findByEmail("shipper@ghn.vn")).thenReturn(Optional.of(activeGhnShipper));
            when(passwordEncoder.matches("ShipperPass123", "hashed_shipper_pass")).thenReturn(true);
            when(jwtTokenProvider.generateAccessToken(200L, "shipper@ghn.vn", "GHN_SHIPPER")).thenReturn("ghn-jwt");
            when(jwtTokenProvider.generateRawRefreshToken()).thenReturn("ghn-raw-rt");
            when(jwtTokenProvider.hashRefreshToken("ghn-raw-rt")).thenReturn("ghn-hashed-rt");
            when(rolePermissionRepository.findByRole(ghnShipperRole)).thenReturn(List.of());

            MockHttpServletResponse response = new MockHttpServletResponse();
            UserResponse res = logisticsAuthService.login(req, response);

            assertNotNull(res);
            assertEquals("GHN_SHIPPER", res.getRoleName());
            assertEquals(2, response.getHeaders("Set-Cookie").size());
        }

        @Test
        @DisplayName("TC-AUTH-21B: Chặn cả ADMIN và CUSTOMER đăng nhập vào cổng riêng của GHN Logistics")
        void logisticsLogin_Fail_NonGhnRoleRejected() {
            AdminLoginRequest req = new AdminLoginRequest();
            req.setEmail("admin@apsports.com");
            req.setPassword("AdminPass123");

            when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(activeAdmin));

            SecurityException ex = assertThrows(SecurityException.class,
                    () -> logisticsAuthService.login(req, new MockHttpServletResponse()));

            assertEquals("Bạn không có quyền truy cập vào cổng Logistics! Chỉ dành riêng cho nhân viên GHN.", ex.getMessage());
        }
    }
}
