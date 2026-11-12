package com.web.ap_sports.admin;

import com.web.ap_sports.dto.request.admin.CreateStaffRequest;
import com.web.ap_sports.dto.request.admin.UpdateUserStatusRequest;
import com.web.ap_sports.dto.response.admin.UserAdminResponse;
import com.web.ap_sports.dto.response.admin.UserDetailAdminResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.dto.response.report.StaffPerformanceReportResponse;
import com.web.ap_sports.dto.response.report.WarehouseReportResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.enums.UserStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.admin.AdminOrderService;
import com.web.ap_sports.service.admin.AdminReportService;
import com.web.ap_sports.service.admin.impl.AdminReportServiceImpl;
import com.web.ap_sports.service.admin.impl.AdminUserServiceImpl;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.staff.impl.StaffReportServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Kiểm thử Tích hợp Quản trị Người dùng & Báo cáo Thống kê Doanh thu (Chapter 3 & 4 - Nhóm 1 & 6)")
public class AdminUserManagementAndReportServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private ShippingAddressRepository shippingAddressRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private InventoryAlertService inventoryAlertService;
    @Mock
    private ProductImageRepository productImageRepository;
    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;
    @Mock
    private AdminOrderService adminOrderService;

    private AdminUserServiceImpl adminUserService;
    private AdminReportServiceImpl adminReportService;
    private StaffReportServiceImpl staffReportService;

    private Role adminRole;
    private Role staffRole;
    private Role customerRole;

    private User supremeAdmin;
    private User regularCustomer;
    private User staffMember;

    @BeforeEach
    void setUp() {
        adminRole = Role.builder().id(1L).name("ADMIN").build();
        staffRole = Role.builder().id(2L).name("STAFF").build();
        customerRole = Role.builder().id(3L).name("CUSTOMER").build();

        supremeAdmin = User.builder()
                .id(1L)
                .email("admin@apsports.vn")
                .name("Quản Trị Viên Tối Cao")
                .role(adminRole)
                .status(UserStatus.active)
                .build();

        regularCustomer = User.builder()
                .id(50L)
                .email("customer@apsports.vn")
                .name("Lê Khách Hàng")
                .role(customerRole)
                .status(UserStatus.pending)
                .activationToken("token-activate-12345")
                .build();

        staffMember = User.builder()
                .id(20L)
                .email("staff@apsports.vn")
                .name("Nguyễn Văn Nhân Viên")
                .role(staffRole)
                .employeeCode("NV-001")
                .status(UserStatus.active)
                .build();

        adminUserService = new AdminUserServiceImpl(
                userRepository,
                roleRepository,
                shippingAddressRepository,
                passwordEncoder,
                orderRepository,
                orderItemRepository,
                productRepository,
                productVariantRepository,
                couponRepository,
                paymentRepository,
                orderStatusHistoryRepository,
                refreshTokenRepository,
                inventoryAlertService
        );

        adminReportService = new AdminReportServiceImpl(
                orderRepository,
                orderItemRepository,
                productVariantRepository,
                productImageRepository,
                inventoryTransactionRepository,
                userRepository,
                paymentRepository
        );

        staffReportService = new StaffReportServiceImpl(
                adminReportService,
                adminOrderService,
                userRepository
        );
    }

    // =========================================================================
    // 1. KIỂM THỬ QUẢN TRỊ TÀI KHOẢN NGƯỜI DÙNG (AdminUserService)
    // =========================================================================
    @Nested
    @DisplayName("1. Kiểm thử Quản lý tài khoản người dùng & Phân quyền (AdminUserService)")
    class UserManagementTests {

        @Test
        @DisplayName("TC-USER-01: Lấy danh sách tài khoản - Tài khoản ADMIN tối cao luôn được ghim đầu tiên (#1)")
        void testGetUsers_AdminPinnedToTop() {
            Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
            List<User> rawList = List.of(regularCustomer, supremeAdmin); // CSDL trả về customer trước
            Page<User> mockPage = new PageImpl<>(rawList, pageable, 2);

            when(userRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(mockPage);

            Page<UserAdminResponse> result = adminUserService.getUsers(null, "ALL", "ALL", "createdAt", "DESC", 0, 10);

            assertNotNull(result);
            assertEquals(2, result.getContent().size());
            // Quy tắc đặc biệt: Tài khoản ADMIN phải luôn đứng ở vị trí index 0
            assertEquals("ADMIN", result.getContent().get(0).getRole());
            assertEquals("CUSTOMER", result.getContent().get(1).getRole());
        }

        @Test
        @DisplayName("TC-USER-02: Xem chi tiết tài khoản kèm danh sách sổ địa chỉ nhận hàng")
        void testGetUserDetail_Success() {
            ShippingAddress address = ShippingAddress.builder()
                    .id(101L)
                    .fullName("Lê Khách Hàng")
                    .phone("0908888888")
                    .address("123 Đường 3/2, Ninh Kiều, Cần Thơ")
                    .city("Cần Thơ")
                    .isDefault(true)
                    .build();

            when(userRepository.findById(50L)).thenReturn(Optional.of(regularCustomer));
            when(shippingAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(50L))
                    .thenReturn(List.of(address));

            UserDetailAdminResponse response = adminUserService.getUserDetail(50L);

            assertNotNull(response);
            assertEquals(50L, response.getId());
            assertEquals("customer@apsports.vn", response.getEmail());
            assertEquals(1, response.getAddresses().size());
            assertEquals("123 Đường 3/2, Ninh Kiều, Cần Thơ", response.getAddresses().get(0).getAddress());
        }

        @Test
        @DisplayName("TC-USER-03: Kích hoạt tài khoản pending -> active (Xóa activationToken, cập nhật emailVerifiedAt)")
        void testUpdateUserStatus_ActivatePendingUser() {
            UpdateUserStatusRequest request = new UpdateUserStatusRequest();
            request.setStatus("active");

            when(userRepository.findById(50L)).thenReturn(Optional.of(regularCustomer));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            UserAdminResponse response = adminUserService.updateUserStatus(50L, request);

            assertNotNull(response);
            assertEquals("active", response.getStatus());
            assertNull(regularCustomer.getActivationToken()); // Phải xóa token kích hoạt
            assertNotNull(regularCustomer.getEmailVerifiedAt()); // Cập nhật thời điểm xác minh email
            verify(userRepository).save(regularCustomer);
        }

        @Test
        @DisplayName("TC-USER-04: Cố tình thay đổi trạng thái của ADMIN tối cao -> Bị chặn với FORBIDDEN")
        void testUpdateUserStatus_SupremeAdminProtection_ShouldThrowForbidden() {
            UpdateUserStatusRequest request = new UpdateUserStatusRequest();
            request.setStatus("banned");

            when(userRepository.findById(1L)).thenReturn(Optional.of(supremeAdmin));

            AppException ex = assertThrows(AppException.class, () -> adminUserService.updateUserStatus(1L, request));
            assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
            assertTrue(ex.getMessage().contains("Quản trị viên tối cao"));
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("TC-USER-05: Cố tình chuyển trạng thái về pending thủ công -> Bị chặn với BAD_REQUEST")
        void testUpdateUserStatus_ManualPending_ShouldThrowBadRequest() {
            regularCustomer.setStatus(UserStatus.active);
            UpdateUserStatusRequest request = new UpdateUserStatusRequest();
            request.setStatus("pending");

            when(userRepository.findById(50L)).thenReturn(Optional.of(regularCustomer));

            AppException ex = assertThrows(AppException.class, () -> adminUserService.updateUserStatus(50L, request));
            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertTrue(ex.getMessage().contains("pending"));
        }

        @Test
        @DisplayName("TC-USER-06: Tạo mới tài khoản Nhân viên (Staff) với mật khẩu mặc định an toàn")
        void testCreateStaff_Success() {
            CreateStaffRequest request = new CreateStaffRequest();
            request.setName("Phạm Văn Nhân Viên Mới");
            request.setEmail("newstaff@apsports.vn");
            request.setPhoneNumber("0912345678");
            request.setRole("STAFF");

            when(userRepository.existsByEmail("newstaff@apsports.vn")).thenReturn(false);
            when(roleRepository.findByName("STAFF")).thenReturn(Optional.of(staffRole));
            when(passwordEncoder.encode(anyString())).thenReturn("hashed_default_pwd");

            User savedStaff = User.builder()
                    .id(70L)
                    .name(request.getName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .role(staffRole)
                    .status(UserStatus.active)
                    .employeeCode("NV-70")
                    .build();

            when(userRepository.save(any(User.class))).thenReturn(savedStaff);

            UserAdminResponse response = adminUserService.createStaffAccount(request);

            assertNotNull(response);
            assertEquals("newstaff@apsports.vn", response.getEmail());
            assertEquals("STAFF", response.getRole());
            assertEquals("active", response.getStatus());
            verify(passwordEncoder).encode(eq(AdminUserServiceImpl.DEFAULT_STAFF_PASSWORD));
        }

        @Test
        @DisplayName("TC-USER-07: Tạo nhân viên với email đã tồn tại -> Báo lỗi CONFLICT")
        void testCreateStaff_DuplicateEmail_ShouldThrow() {
            CreateStaffRequest request = new CreateStaffRequest();
            request.setName("Trùng Email");
            request.setEmail("staff@apsports.vn");
            request.setRole("STAFF");

            when(userRepository.existsByEmail("staff@apsports.vn")).thenReturn(true);

            AppException ex = assertThrows(AppException.class, () -> adminUserService.createStaffAccount(request));
            assertEquals(HttpStatus.CONFLICT, ex.getStatus());
            assertTrue(ex.getMessage().contains("đã tồn tại"));
        }
    }

    // =========================================================================
    // 2. KIỂM THỬ BÁO CÁO THỐNG KÊ DOANH THU & HIỆU SUẤT (Report Services)
    // =========================================================================
    @Nested
    @DisplayName("2. Kiểm thử Báo cáo Thống kê Doanh thu & Hiệu suất Nhân viên (AdminReportService)")
    class ReportServiceTests {

        @Test
        @DisplayName("TC-REP-01: Báo cáo Doanh thu tổng quan theo khoảng thời gian")
        void testGetRevenueOverview_Success() {
            LocalDateTime fromDate = LocalDateTime.now().minusDays(30);
            LocalDateTime toDate = LocalDateTime.now();

            Order deliveredOrder = Order.builder()
                    .id(1L)
                    .status(OrderStatus.delivered)
                    .totalPrice(new BigDecimal("2000000"))
                    .discountAmount(new BigDecimal("100000"))
                    .shippingFee(new BigDecimal("30000"))
                    .finalAmount(new BigDecimal("1930000"))
                    .createdAt(LocalDateTime.now().minusDays(5))
                    .build();

            Order cancelledOrder = Order.builder()
                    .id(2L)
                    .status(OrderStatus.cancelled)
                    .totalPrice(new BigDecimal("1000000"))
                    .discountAmount(BigDecimal.ZERO)
                    .shippingFee(new BigDecimal("30000"))
                    .finalAmount(new BigDecimal("1030000"))
                    .createdAt(LocalDateTime.now().minusDays(3))
                    .build();

            when(orderRepository.findOrdersForReport(fromDate, toDate, null))
                    .thenReturn(List.of(deliveredOrder, cancelledOrder));

            RevenueOverviewReportResponse response = adminReportService.getRevenueOverview(fromDate, toDate, null);

            assertNotNull(response);
            assertEquals(new BigDecimal("1930000"), response.getTotalDeliveredRevenue());
            assertEquals(new BigDecimal("100000"), response.getTotalDiscountAmount());
            assertEquals(2, response.getTotalOrders());
            assertEquals(1, response.getCompletedOrders());
            assertEquals(1, response.getCancelledOrders());
        }

        @Test
        @DisplayName("TC-REP-02: Báo cáo Tồn kho Kho bãi - Thống kê biến thể cạn kho & hết hàng")
        void testGetWarehouseReport_Success() {
            LocalDateTime fromDate = LocalDateTime.now().minusDays(30);
            LocalDateTime toDate = LocalDateTime.now();

            when(inventoryTransactionRepository.sumTotalInventoryValue()).thenReturn(new BigDecimal("100000000"));
            when(productVariantRepository.sumTotalStockQuantity()).thenReturn(100L);
            when(productVariantRepository.countLowStockVariants(5)).thenReturn(15L);
            when(productVariantRepository.countOutOfStockVariants()).thenReturn(5L);
            when(productVariantRepository.findLowStockVariants(eq(5), any(Pageable.class))).thenReturn(Collections.emptyList());

            WarehouseReportResponse response = adminReportService.getWarehouseReport(fromDate, toDate);

            assertNotNull(response);
            assertEquals(new BigDecimal("100000000"), response.getTotalInventoryValue());
            assertEquals(100L, response.getTotalStockQuantity());
            assertEquals(15L, response.getLowStockVariantCount());
            assertEquals(5L, response.getOutOfStockVariantCount());
        }

        @Test
        @DisplayName("TC-REP-03: Nhân viên tra cứu hiệu suất cá nhân (Staff Report)")
        void testGetMyPerformance_Success() {
            LocalDateTime fromDate = LocalDateTime.now().minusDays(30);
            LocalDateTime toDate = LocalDateTime.now();

            when(userRepository.findByEmail(staffMember.getEmail())).thenReturn(Optional.of(staffMember));
            when(userRepository.findActiveUsersByRoles(List.of("STAFF", "ADMIN"))).thenReturn(List.of(staffMember));

            Order order1 = Order.builder()
                    .id(1L)
                    .status(OrderStatus.delivered)
                    .processedByStaff(staffMember)
                    .finalAmount(new BigDecimal("20000000"))
                    .createdAt(LocalDateTime.now())
                    .build();
            Order order2 = Order.builder()
                    .id(2L)
                    .status(OrderStatus.delivered)
                    .processedByStaff(staffMember)
                    .finalAmount(new BigDecimal("15000000"))
                    .createdAt(LocalDateTime.now())
                    .build();
            Order order3 = Order.builder()
                    .id(3L)
                    .status(OrderStatus.delivered)
                    .processedByStaff(staffMember)
                    .finalAmount(new BigDecimal("15000000"))
                    .createdAt(LocalDateTime.now())
                    .build();

            when(orderRepository.findOrdersForReport(fromDate, toDate, staffMember.getId()))
                    .thenReturn(List.of(order1, order2, order3));

            StaffPerformanceReportResponse response = staffReportService.getMyPerformance(staffMember.getEmail(), fromDate, toDate);

            assertNotNull(response);
            assertEquals(20L, response.getStaffId());
            assertEquals("Nguyễn Văn Nhân Viên", response.getStaffName());
            assertEquals(3, response.getTotalHandledOrders());
            assertEquals(3, response.getCompletedOrders());
            assertEquals(100.0, response.getSuccessRate());
            assertEquals("XUẤT SẮC", response.getPerformanceBadge());
            assertEquals(new BigDecimal("50000000"), response.getDeliveredRevenue());
        }
    }
}
