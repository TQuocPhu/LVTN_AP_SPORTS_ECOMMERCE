package com.web.ap_sports.order;

import com.web.ap_sports.dto.request.admin.VoucherFilterRequest;
import com.web.ap_sports.dto.request.admin.VoucherRequest;
import com.web.ap_sports.dto.request.customer.ApplyVoucherRequest;
import com.web.ap_sports.dto.response.common.VoucherResponse;
import com.web.ap_sports.dto.response.customer.VoucherApplyResponse;
import com.web.ap_sports.entity.Coupon;
import com.web.ap_sports.entity.Coupon.CouponType;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.CouponRepository;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.impl.AdminVoucherServiceImpl;
import com.web.ap_sports.service.customer.impl.CustomerVoucherServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Nhóm 2: Mã Khuyến Mãi / Kho Voucher (Customer & Admin)
 * (TC-VOU-01 -> TC-VOU-12, gồm 12 Unit Tests).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Nhóm 2: Mã Khuyến Mãi & Quản lý Kho Voucher Unit Tests (12 Tests)")
class VoucherManagementAndApplicationTest {

    @Mock
    private CouponRepository couponRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;

    private CustomerVoucherServiceImpl customerVoucherService;
    private AdminVoucherServiceImpl adminVoucherService;

    private User customerUser;

    @BeforeEach
    void setUp() {
        customerVoucherService = new CustomerVoucherServiceImpl(
                couponRepository,
                orderRepository,
                userRepository
        );
        adminVoucherService = new AdminVoucherServiceImpl(couponRepository);

        customerUser = User.builder()
                .id(100L)
                .name("Khách Hàng Săn Sale")
                .email("customer@apsports.com")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // =========================================================================
    // PHẦN 2.1: KHO VOUCHER & ÁP DỤNG MÃ GIẢM GIÁ PHÍA KHÁCH HÀNG (TC-VOU-01 -> TC-VOU-09)
    // =========================================================================
    @Nested
    @DisplayName("Phần 2.1: Khách hàng lấy Kho Voucher & Tính toán Giảm giá (TC-VOU-01 -> TC-VOU-09)")
    class CustomerVoucherTests {

        @Test
        @DisplayName("TC-VOU-01: Lấy danh sách kho Voucher công khai (getPublicVouchers) -> Lọc bỏ voucher hết hạn & Lọc đúng theo categoryScope")
        void getPublicVouchers_FiltersOutExpiredAndMatchesScope() {
            LocalDateTime now = LocalDateTime.now();
            Coupon validAll = Coupon.builder()
                    .id(1L).code("ALL50K").name("Giảm 50K").type(CouponType.FIXED)
                    .value(new BigDecimal("50000")).categoryScope("ALL")
                    .isActive(true).expiresAt(now.plusDays(5)).build();
            Coupon validFreeship = Coupon.builder()
                    .id(2L).code("FREE30K").name("Freeship 30K").type(CouponType.FREESHIP)
                    .value(new BigDecimal("30000")).categoryScope("FREESHIP")
                    .isActive(true).expiresAt(now.plusDays(2)).build();
            Coupon expiredCoupon = Coupon.builder()
                    .id(3L).code("OLD100K").name("Mã Cũ").type(CouponType.FIXED)
                    .value(new BigDecimal("100000")).categoryScope("ALL")
                    .isActive(true).expiresAt(now.minusDays(1)).build();

            when(couponRepository.findByIsActiveTrue()).thenReturn(List.of(validAll, validFreeship, expiredCoupon));
            when(couponRepository.findByIsActiveTrueAndCategoryScope("FREESHIP")).thenReturn(List.of(validFreeship));

            List<VoucherResponse> allList = customerVoucherService.getPublicVouchers("ALL");
            assertEquals(2, allList.size(), "Phải loại bỏ voucher đã hết hạn (OLD100K)");
            assertTrue(allList.stream().noneMatch(v -> "OLD100K".equals(v.getCode())));

            List<VoucherResponse> freeshipList = customerVoucherService.getPublicVouchers("freeship");
            assertEquals(1, freeshipList.size());
            assertEquals("FREE30K", freeshipList.get(0).getCode());
        }

        @Test
        @DisplayName("TC-VOU-02: Áp dụng Voucher loại PERCENT có giới hạn giảm tối đa (maxDiscountAmount)")
        void calculateVoucherDiscount_PercentType_RespectsMaxDiscountCap() {
            Coupon sale20 = Coupon.builder()
                    .id(1L).code("SALE20").name("Giảm 20% tối đa 50K")
                    .type(CouponType.PERCENT)
                    .value(new BigDecimal("20"))
                    .maxDiscountAmount(new BigDecimal("50000"))
                    .minOrderValue(new BigDecimal("200000"))
                    .isActive(true)
                    .startsAt(LocalDateTime.now().minusDays(1))
                    .expiresAt(LocalDateTime.now().plusDays(5))
                    .build();

            when(couponRepository.findByCodeIgnoreCase("SALE20")).thenReturn(Optional.of(sale20));

            // Nhánh A: Đơn 200,000, ship 30,000 -> 20% là 40,000 (< 50,000) -> Giảm 40,000, final = 190,000
            ApplyVoucherRequest reqUnderCap = ApplyVoucherRequest.builder()
                    .code("  sale20 ")
                    .orderAmount(new BigDecimal("200000"))
                    .shippingFee(new BigDecimal("30000"))
                    .build();
            VoucherApplyResponse resA = customerVoucherService.calculateVoucherDiscount(reqUnderCap);
            assertTrue(resA.isValid());
            assertEquals(new BigDecimal("40000.00"), resA.getDiscountAmount());
            assertEquals(new BigDecimal("190000.00"), resA.getFinalAmount());

            // Nhánh B: Đơn 500,000, ship 30,000 -> 20% là 100,000 (> 50,000) -> Chặn trần ở 50,000, final = 480,000
            ApplyVoucherRequest reqOverCap = ApplyVoucherRequest.builder()
                    .code("SALE20")
                    .orderAmount(new BigDecimal("500000"))
                    .shippingFee(new BigDecimal("30000"))
                    .build();
            VoucherApplyResponse resB = customerVoucherService.calculateVoucherDiscount(reqOverCap);
            assertTrue(resB.isValid());
            assertEquals(new BigDecimal("50000"), resB.getDiscountAmount());
            assertEquals(new BigDecimal("480000"), resB.getFinalAmount());
        }

        @Test
        @DisplayName("TC-VOU-03: Áp dụng Voucher loại FIXED -> Giảm cố định vào tiền hàng & Không giảm vượt quá orderAmount")
        void calculateVoucherDiscount_FixedType_CapsAtOrderAmount() {
            Coupon fixed100k = Coupon.builder()
                    .id(2L).code("GIAM100K").name("Giảm 100K")
                    .type(CouponType.FIXED)
                    .value(new BigDecimal("100000"))
                    .isActive(true)
                    .build();

            when(couponRepository.findByCodeIgnoreCase("GIAM100K")).thenReturn(Optional.of(fixed100k));

            // Nhánh A: Đơn 300,000 + ship 30,000 -> Giảm 100,000 -> final = 230,000
            VoucherApplyResponse resNormal = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("GIAM100K", new BigDecimal("300000"), new BigDecimal("30000"))
            );
            assertTrue(resNormal.isValid());
            assertEquals(new BigDecimal("100000"), resNormal.getDiscountAmount());
            assertEquals(new BigDecimal("230000"), resNormal.getFinalAmount());

            // Nhánh B: Đơn chỉ có 80,000 + ship 30,000 -> Chỉ được giảm tối đa 80,000 (bằng tiền hàng), còn lại 30,000 tiền ship
            VoucherApplyResponse resSmallOrder = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("GIAM100K", new BigDecimal("80000"), new BigDecimal("30000"))
            );
            assertTrue(resSmallOrder.isValid());
            assertEquals(new BigDecimal("80000"), resSmallOrder.getDiscountAmount());
            assertEquals(new BigDecimal("30000"), resSmallOrder.getFinalAmount());
        }

        @Test
        @DisplayName("TC-VOU-04: Áp dụng Voucher loại FREESHIP -> Chỉ trừ tối đa bằng phí vận chuyển thực tế (shippingFee)")
        void calculateVoucherDiscount_FreeshipType_CapsAtActualShippingFee() {
            Coupon freeship50k = Coupon.builder()
                    .id(3L).code("FREESHIP50K").name("Miễn phí vận chuyển")
                    .type(CouponType.FREESHIP)
                    .value(new BigDecimal("50000"))
                    .maxDiscountAmount(new BigDecimal("40000"))
                    .isActive(true)
                    .build();

            when(couponRepository.findByCodeIgnoreCase("FREESHIP50K")).thenReturn(Optional.of(freeship50k));

            // Đơn 300,000, phí ship thực tế 30,000 -> min(50k, 40k, 30k) = 30,000
            VoucherApplyResponse res = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("FREESHIP50K", new BigDecimal("300000"), new BigDecimal("30000"))
            );

            assertTrue(res.isValid());
            assertEquals(new BigDecimal("30000"), res.getDiscountAmount());
            assertEquals(new BigDecimal("300000"), res.getFinalAmount());
        }

        @Test
        @DisplayName("TC-VOU-05: Từ chối Voucher khi Mã rỗng hoặc Mã không tồn tại trên hệ thống")
        void calculateVoucherDiscount_BlankOrNonExistentCode_ReturnsInvalidResponse() {
            // Nhánh A: Mã rỗng
            VoucherApplyResponse resBlank = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("   ", new BigDecimal("200000"), BigDecimal.ZERO)
            );
            assertFalse(resBlank.isValid());
            assertEquals("Mã giảm giá không được để trống!", resBlank.getMessage());
            assertEquals(BigDecimal.ZERO, resBlank.getDiscountAmount());

            // Nhánh B: Mã không tồn tại
            when(couponRepository.findByCodeIgnoreCase("MA_AO_999")).thenReturn(Optional.empty());
            VoucherApplyResponse resNotFound = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("MA_AO_999", new BigDecimal("200000"), BigDecimal.ZERO)
            );
            assertFalse(resNotFound.isValid());
            assertEquals("Mã giảm giá [MA_AO_999] không tồn tại trên hệ thống.", resNotFound.getMessage());
        }

        @Test
        @DisplayName("TC-VOU-06: Từ chối Voucher khi Bị tạm dừng (!isActive), Chưa tới ngày mở (startsAt > now), hoặc Đã hết hạn (expiresAt < now)")
        void calculateVoucherDiscount_InactiveOrScheduledOrExpired_ReturnsInvalidResponse() {
            LocalDateTime now = LocalDateTime.now();

            // Nhánh A: isActive = false
            Coupon inactive = Coupon.builder().code("OFF").isActive(false).build();
            when(couponRepository.findByCodeIgnoreCase("OFF")).thenReturn(Optional.of(inactive));
            VoucherApplyResponse resInactive = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("OFF", new BigDecimal("200000"), BigDecimal.ZERO)
            );
            assertFalse(resInactive.isValid());
            assertTrue(resInactive.getMessage().contains("bị tạm dừng hoặc không còn hoạt động"));

            // Nhánh B: Chưa tới thời gian sử dụng
            Coupon scheduled = Coupon.builder().code("SOON").isActive(true).startsAt(now.plusDays(2)).build();
            when(couponRepository.findByCodeIgnoreCase("SOON")).thenReturn(Optional.of(scheduled));
            VoucherApplyResponse resScheduled = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("SOON", new BigDecimal("200000"), BigDecimal.ZERO)
            );
            assertFalse(resScheduled.isValid());
            assertTrue(resScheduled.getMessage().contains("chưa đến thời gian sử dụng"));

            // Nhánh C: Đã hết hạn
            Coupon expired = Coupon.builder().code("EXP").isActive(true).expiresAt(now.minusHours(1)).build();
            when(couponRepository.findByCodeIgnoreCase("EXP")).thenReturn(Optional.of(expired));
            VoucherApplyResponse resExpired = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("EXP", new BigDecimal("200000"), BigDecimal.ZERO)
            );
            assertFalse(resExpired.isValid());
            assertEquals("Mã giảm giá này đã hết hạn sử dụng.", resExpired.getMessage());
        }

        @Test
        @DisplayName("TC-VOU-07: Từ chối Voucher khi Đã hết tổng lượt sử dụng toàn hệ thống (usedCount >= usageLimit)")
        void calculateVoucherDiscount_UsageLimitReached_ReturnsInvalidResponse() {
            Coupon exhausted = Coupon.builder()
                    .code("FULL100")
                    .isActive(true)
                    .usageLimit(100)
                    .usedCount(100)
                    .build();

            when(couponRepository.findByCodeIgnoreCase("FULL100")).thenReturn(Optional.of(exhausted));

            VoucherApplyResponse res = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("FULL100", new BigDecimal("500000"), BigDecimal.ZERO)
            );

            assertFalse(res.isValid());
            assertEquals("Mã giảm giá này đã hết lượt sử dụng.", res.getMessage());
        }

        @Test
        @DisplayName("TC-VOU-08: Từ chối Voucher khi Giá trị tiền hàng (orderAmount) chưa đạt mức tối thiểu (minOrderValue)")
        void calculateVoucherDiscount_BelowMinOrderValue_ReturnsInvalidResponse() {
            Coupon min500k = Coupon.builder()
                    .code("VIP500K")
                    .isActive(true)
                    .minOrderValue(new BigDecimal("500000"))
                    .build();

            when(couponRepository.findByCodeIgnoreCase("VIP500K")).thenReturn(Optional.of(min500k));

            // Tiền hàng 490,000 + ship 30,000 = 520,000, nhưng xét trên orderAmount (490k < 500k) phải bị từ chối
            VoucherApplyResponse res = customerVoucherService.calculateVoucherDiscount(
                    new ApplyVoucherRequest("VIP500K", new BigDecimal("490000"), new BigDecimal("30000"))
            );

            assertFalse(res.isValid());
            assertTrue(res.getMessage().contains("Đơn hàng tối thiểu phải từ"));
        }

        @Test
        @DisplayName("TC-VOU-09: Từ chối Voucher khi Tài khoản khách hàng đã dùng hết số lượt cá nhân cho phép (userUsageLimit)")
        void calculateVoucherDiscount_UserUsageLimitExceeded_ThrowsAppException() {
            Coupon oncePerUser = Coupon.builder()
                    .id(99L)
                    .code("ONCEONLY")
                    .isActive(true)
                    .userUsageLimit(1)
                    .build();

            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken("customer@apsports.com", null, Collections.emptyList())
            );

            when(couponRepository.findByCodeIgnoreCase("ONCEONLY")).thenReturn(Optional.of(oncePerUser));
            when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
            when(orderRepository.countByUserIdAndCouponIdAndStatusNotIn(eq(100L), eq(99L), anyList())).thenReturn(1L);

            AppException ex = assertThrows(AppException.class, () ->
                    customerVoucherService.calculateVoucherDiscount(
                            new ApplyVoucherRequest("ONCEONLY", new BigDecimal("300000"), BigDecimal.ZERO)
                    )
            );

            assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
            assertEquals("Tài khoản của bạn đã sử dụng hết lượt (1 lần) của mã giảm giá này.", ex.getMessage());
        }
    }

    // =========================================================================
    // PHẦN 2.2: QUẢN TRỊ KHO VOUCHER PHÍA ADMIN (TC-VOU-10 -> TC-VOU-12)
    // =========================================================================
    @Nested
    @DisplayName("Phần 2.2: Admin Quản lý CRUD & Trạng thái Voucher (TC-VOU-10 -> TC-VOU-12)")
    class AdminVoucherTests {

        @Test
        @DisplayName("TC-VOU-10: Admin tạo mới Voucher thành công (createVoucher) -> Tự động chuẩn hóa mã in hoa, khởi tạo usedCount = 0")
        void createVoucher_Success_NormalizesCodeToUpperCase() {
            LocalDateTime start = LocalDateTime.now().minusHours(1);
            LocalDateTime end = LocalDateTime.now().plusDays(10);

            VoucherRequest req = VoucherRequest.builder()
                    .code("  tet2027  ")
                    .name(" Khuyến mãi Tết 2027 ")
                    .type("percent")
                    .value(new BigDecimal("15"))
                    .maxDiscountAmount(new BigDecimal("100000"))
                    .minOrderValue(new BigDecimal("300000"))
                    .usageLimit(50)
                    .userUsageLimit(2)
                    .startsAt(start)
                    .expiresAt(end)
                    .isActive(true)
                    .build();

            when(couponRepository.existsByCode("TET2027")).thenReturn(false);
            when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> {
                Coupon c = inv.getArgument(0);
                c.setId(10L);
                return c;
            });

            VoucherResponse res = adminVoucherService.createVoucher(req);

            assertNotNull(res);
            assertEquals("TET2027", res.getCode());
            assertEquals("Khuyến mãi Tết 2027", res.getName());
            assertEquals("PERCENT", res.getType());
            assertEquals(0, res.getUsedCount());
            assertEquals("ALL", res.getCategoryScope());
            assertTrue(res.isUsable());
        }

        @Test
        @DisplayName("TC-VOU-11: Admin tạo/cập nhật Voucher thất bại khi: Trùng mã, Giảm PERCENT > 100%, hoặc startsAt >= expiresAt")
        void createOrUpdateVoucher_InvalidBusinessRules_ThrowsBadRequest() {
            // Nhánh A: Mã voucher đã tồn tại
            when(couponRepository.existsByCode("DUPCODE")).thenReturn(true);
            VoucherRequest dupReq = VoucherRequest.builder().code("dupcode").name("Dup").type("FIXED").value(BigDecimal.TEN).build();
            AppException exDup = assertThrows(AppException.class, () -> adminVoucherService.createVoucher(dupReq));
            assertEquals(HttpStatus.BAD_REQUEST, exDup.getStatus());
            assertTrue(exDup.getMessage().contains("đã tồn tại trên hệ thống"));

            // Nhánh B: Loại PERCENT nhưng value > 100%
            when(couponRepository.existsByCode("OVER100")).thenReturn(false);
            VoucherRequest overPercentReq = VoucherRequest.builder()
                    .code("OVER100").name("Giảm 120%").type("PERCENT").value(new BigDecimal("120")).build();
            AppException exPercent = assertThrows(AppException.class, () -> adminVoucherService.createVoucher(overPercentReq));
            assertEquals(HttpStatus.BAD_REQUEST, exPercent.getStatus());
            assertEquals("Giá trị giảm theo phần trăm không được vượt quá 100%.", exPercent.getMessage());

            // Nhánh C: Thời gian bắt đầu xảy ra sau thời gian hết hạn
            LocalDateTime now = LocalDateTime.now();
            VoucherRequest badDateReq = VoucherRequest.builder()
                    .code("BADDATE").name("Sai ngày").type("FIXED").value(new BigDecimal("50000"))
                    .startsAt(now.plusDays(5))
                    .expiresAt(now.plusDays(1))
                    .build();
            AppException exDate = assertThrows(AppException.class, () -> adminVoucherService.createVoucher(badDateReq));
            assertEquals(HttpStatus.BAD_REQUEST, exDate.getStatus());
            assertEquals("Thời gian bắt đầu hiệu lực phải xảy ra trước thời gian hết hạn.", exDate.getMessage());
        }

        @Test
        @DisplayName("TC-VOU-12: Admin đảo trạng thái Voucher (toggleVoucherStatus), Lọc danh sách & Tính đúng usagePercentage / displayStatus")
        void toggleVoucherStatus_AndGetVouchers_MapsStatusAndPercentageCorrectly() {
            Coupon coupon = Coupon.builder()
                    .id(5L)
                    .code("SUMMER50")
                    .name("Hè Rực Rỡ")
                    .type(CouponType.FIXED)
                    .value(new BigDecimal("50000"))
                    .usageLimit(10)
                    .usedCount(5)
                    .isActive(true)
                    .build();

            when(couponRepository.findById(5L)).thenReturn(Optional.of(coupon));
            when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> inv.getArgument(0));

            // Đảo từ active (true) -> disabled (false)
            VoucherResponse toggled = adminVoucherService.toggleVoucherStatus(5L);
            assertFalse(toggled.isActive());
            assertEquals("disabled", toggled.getStatus());
            assertEquals("Tạm dừng", toggled.getDisplayStatus());
            assertEquals(50.0, toggled.getUsagePercentage(), "5/10 lượt = 50.0%");
            assertFalse(toggled.isUsable());

            // Kiểm thử phân trang getVouchers
            when(couponRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(coupon)));
            Page<VoucherResponse> page = adminVoucherService.getVouchers(
                    VoucherFilterRequest.builder().keyword("SUMMER").status("disabled").page(0).size(10).build()
            );
            assertEquals(1, page.getTotalElements());
        }
    }
}
