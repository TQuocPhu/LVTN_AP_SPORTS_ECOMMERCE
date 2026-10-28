package com.web.ap_sports.order;

import com.web.ap_sports.config.VNPayConfig;
import com.web.ap_sports.dto.request.customer.CreateOrderRequest;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.event.OrderPlacedEvent;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.GhnService;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.OrderInventoryService;
import com.web.ap_sports.service.common.VNPayService;
import com.web.ap_sports.service.common.geocoding.GeocodingCascadeService;
import com.web.ap_sports.service.common.impl.OrderInventoryServiceImpl;
import com.web.ap_sports.service.customer.ShippingAddressService;
import com.web.ap_sports.service.customer.impl.CustomerOrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Nhóm 3: Đặt hàng (Checkout), Tính phí GHN & Đồng bộ Tồn kho Đơn hàng
 * (TC-ORD-01 -> TC-ORD-10, gồm 10 Unit Tests).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Nhóm 3: Đặt hàng (Checkout), Tính phí GHN & Đồng bộ Tồn kho Unit Tests (10 Tests)")
class CustomerOrderCheckoutAndInventoryTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private OrderStatusHistoryRepository orderStatusHistoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ShippingAddressRepository shippingAddressRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private ProductImageRepository productImageRepository;
    @Mock
    private VNPayService vnPayService;
    @Mock
    private EmailService emailService;
    @Mock
    private ShippingAddressService shippingAddressService;
    @Mock
    private GeocodingCascadeService geocodingCascadeService;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @Mock
    private InventoryAlertService inventoryAlertService;
    @Mock
    private OrderInventoryService mockOrderInventoryService;
    @Mock
    private VNPayConfig vnPayConfig;
    @Mock
    private GhnService ghnService;

    private CustomerOrderServiceImpl customerOrderService;
    private OrderInventoryServiceImpl realOrderInventoryService;

    private User customerUser;
    private ShippingAddress validAddress;
    private Product sampleProduct;
    private ProductVariant sampleVariant;
    private CartItem sampleCartItem;

    @BeforeEach
    void setUp() {
        customerOrderService = new CustomerOrderServiceImpl(
                orderRepository,
                orderItemRepository,
                reviewRepository,
                paymentRepository,
                orderStatusHistoryRepository,
                userRepository,
                shippingAddressRepository,
                cartItemRepository,
                couponRepository,
                productRepository,
                productVariantRepository,
                productImageRepository,
                vnPayService,
                emailService,
                shippingAddressService,
                geocodingCascadeService,
                eventPublisher,
                inventoryAlertService,
                mockOrderInventoryService,
                vnPayConfig,
                ghnService
        );

        realOrderInventoryService = new OrderInventoryServiceImpl(
                orderRepository,
                orderItemRepository,
                productRepository,
                productVariantRepository,
                cartItemRepository,
                couponRepository,
                inventoryAlertService
        );

        customerUser = User.builder()
                .id(100L)
                .name("Nguyễn Văn A")
                .email("customer@apsports.com")
                .build();

        validAddress = ShippingAddress.builder()
                .id(10L)
                .user(customerUser)
                .fullName("Nguyễn Văn A")
                .phone("0912345678")
                .address("123 Đường 3/2")
                .city("Cần Thơ")
                .provinceId(92)
                .districtId(1442)
                .wardCode("21211")
                .latitude(10.0305)
                .longitude(105.7828)
                .isDefault(true)
                .build();

        sampleProduct = Product.builder()
                .id(50L)
                .name("Giày Đá Bóng Nike Mercurial")
                .slug("giay-da-bong-nike-mercurial")
                .price(new BigDecimal("1000000"))
                .stock(10)
                .status("in_stock")
                .weight(500)
                .build();

        sampleVariant = ProductVariant.builder()
                .id(10L)
                .product(sampleProduct)
                .sku("NIKE-MER-42")
                .size("42")
                .color("Đỏ")
                .price(new BigDecimal("1000000"))
                .costPrice(new BigDecimal("600000"))
                .stockQuantity(10)
                .build();

        sampleCartItem = CartItem.builder()
                .id(1L)
                .user(customerUser)
                .product(sampleProduct)
                .variant(sampleVariant)
                .quantity(2)
                .isSelected(true)
                .build();
    }

    @Test
    @DisplayName("TC-ORD-01: Đặt hàng thành công với phương thức COD -> Tính đúng tổng tiền + ship GHN, trừ kho, xóa giỏ hàng, gửi Email xác nhận & bắn OrderPlacedEvent")
    void createOrder_CodWithoutCoupon_Success() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .shippingAddressId(10L)
                .paymentMethod("COD")
                .note("Giao giờ hành chính")
                .build();

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(validAddress));
        when(ghnService.calculateShippingFee(eq(1442), eq("21211"), eq(1000), eq(new BigDecimal("2000000"))))
                .thenReturn(new BigDecimal("35000"));
        when(ghnService.fetchNearestGhnStation(1442, "21211"))
                .thenReturn(Map.of("locationId", 5500, "locationName", "Bưu cục Ninh Kiều", "address", "Cần Thơ"));

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(500L);
            return o;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> {
            OrderItem oi = inv.getArgument(0);
            oi.setId(1000L);
            return oi;
        });
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
        when(reviewRepository.findReviewedOrderItemIds(anyList())).thenReturn(Collections.emptyList());
        when(productImageRepository.findByProductId(50L)).thenReturn(Collections.emptyList());

        OrderResponse res = customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1");

        assertNotNull(res);
        assertTrue(res.getOrderCode().startsWith("AP"));
        assertEquals("GHN-" + res.getOrderCode(), res.getTrackingCode());
        assertEquals(new BigDecimal("2000000"), res.getTotalPrice());
        assertEquals(new BigDecimal("35000"), res.getShippingFee());
        assertEquals(BigDecimal.ZERO, res.getDiscountAmount());
        assertEquals(new BigDecimal("2035000"), res.getFinalAmount());
        assertEquals("CASH", res.getPaymentMethod());
        assertEquals("pending", res.getPaymentStatus());
        assertNull(res.getPaymentUrl(), "Đơn COD không sinh paymentUrl");

        // Kiểm tra tồn kho đã giảm 2 đơn vị (10 -> 8)
        assertEquals(8, sampleProduct.getStock());
        assertEquals(8, sampleVariant.getStockQuantity());

        verify(cartItemRepository, times(1)).deleteAll(List.of(sampleCartItem));
        verify(emailService, times(1)).sendOrderConfirmationEmail(
                eq("customer@apsports.com"), eq("Nguyễn Văn A"), anyString(), eq("2035000"), contains("COD")
        );
        verify(eventPublisher, times(1)).publishEvent(any(OrderPlacedEvent.class));
    }

    @Test
    @DisplayName("TC-ORD-02: Đặt hàng thành công với phương thức VNPAY kèm Mã giảm giá hợp lệ -> Khóa lượt Coupon, sinh paymentUrl & Chưa gửi email xác nhận")
    void createOrder_VnPayWithValidCoupon_LocksCouponAndGeneratesPaymentUrl() {
        Coupon coupon = Coupon.builder()
                .id(1L).code("GIAM100K").name("Giảm 100K")
                .type(Coupon.CouponType.FIXED)
                .value(new BigDecimal("100000"))
                .minOrderValue(new BigDecimal("500000"))
                .usageLimit(50)
                .usedCount(10)
                .isActive(true)
                .status("active")
                .build();

        CreateOrderRequest req = CreateOrderRequest.builder()
                .shippingAddressId(10L)
                .paymentMethod("VNPAY")
                .couponCode("giam100k")
                .build();

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(validAddress));
        when(ghnService.calculateShippingFee(anyInt(), anyString(), anyInt(), any())).thenReturn(new BigDecimal("30000"));
        when(couponRepository.findByCodeIgnoreCaseForUpdate("GIAM100K")).thenReturn(Optional.of(coupon));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(501L);
            return o;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));
        when(vnPayService.generatePaymentUrl(any(Order.class), eq("127.0.0.1")))
                .thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=AP501");

        OrderResponse res = customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1");

        // 2,000,000 + 30,000 - 100,000 = 1,930,000
        assertEquals(new BigDecimal("100000"), res.getDiscountAmount());
        assertEquals(new BigDecimal("1930000"), res.getFinalAmount());
        assertEquals("VNPAY", res.getPaymentMethod());
        assertEquals("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=AP501", res.getPaymentUrl());
        assertEquals(11, coupon.getUsedCount(), "Phải tăng usedCount của Coupon ngay khi tạo đơn để giữ chỗ");

        // Chưa thanh toán VNPay xong thì chưa gửi email xác nhận
        verify(emailService, never()).sendOrderConfirmationEmail(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("TC-ORD-03: Đặt hàng chỉ với danh sách cartItemIds được chọn (Partial Cart Checkout)")
    void createOrder_WithSpecificCartItemIds_OnlyProcessesRequestedItems() {
        CreateOrderRequest req = CreateOrderRequest.builder()
                .shippingAddressId(10L)
                .paymentMethod("COD")
                .cartItemIds(List.of(1L))
                .build();

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(cartItemRepository.findByUserIdAndIdIn(100L, List.of(1L))).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(validAddress));
        when(ghnService.calculateShippingFee(anyInt(), anyString(), anyInt(), any())).thenReturn(new BigDecimal("30000"));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(502L);
            return o;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));

        customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1");

        verify(cartItemRepository, times(1)).findByUserIdAndIdIn(100L, List.of(1L));
        verify(cartItemRepository, never()).findByUserIdAndIsSelectedTrue(anyLong());
        verify(cartItemRepository, times(1)).deleteAll(List.of(sampleCartItem));
    }

    @Test
    @DisplayName("TC-ORD-04: Chặn đặt hàng khi Giỏ hàng trống hoặc Địa chỉ giao hàng không thuộc về Khách hàng")
    void createOrder_EmptyCartOrInvalidAddress_ThrowsException() {
        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));

        // Nhánh A: Giỏ hàng trống
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(Collections.emptyList());
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(100L)).thenReturn(Collections.emptyList());

        CreateOrderRequest req = CreateOrderRequest.builder().shippingAddressId(10L).paymentMethod("COD").build();
        AppException exEmpty = assertThrows(AppException.class,
                () -> customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1"));
        assertEquals(HttpStatus.BAD_REQUEST, exEmpty.getStatus());
        assertEquals("Vui lòng chọn ít nhất 1 sản phẩm từ giỏ hàng để tạo đơn hàng.", exEmpty.getMessage());

        // Nhánh B: Địa chỉ không hợp lệ
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(999L, 100L)).thenReturn(Optional.empty());

        CreateOrderRequest reqBadAddr = CreateOrderRequest.builder().shippingAddressId(999L).paymentMethod("COD").build();
        AppException exAddr = assertThrows(AppException.class,
                () -> customerOrderService.createOrder("customer@apsports.com", reqBadAddr, "127.0.0.1"));
        assertEquals(HttpStatus.NOT_FOUND, exAddr.getStatus());
        assertEquals("Địa chỉ giao hàng không hợp lệ.", exAddr.getMessage());
    }

    @Test
    @DisplayName("TC-ORD-05: Chặn đặt hàng tại bước khóa bi quan (findByIdForUpdate) khi Biến thể không còn đủ số lượng tồn kho")
    void createOrder_InsufficientStockOnPessimisticLock_ThrowsBadRequest() {
        sampleVariant.setStockQuantity(1); // Khách đặt quantity = 2 nhưng kho chỉ còn 1

        CreateOrderRequest req = CreateOrderRequest.builder().shippingAddressId(10L).paymentMethod("COD").build();

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(validAddress));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));

        AppException ex = assertThrows(AppException.class,
                () -> customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Phân loại hàng đã chọn của sản phẩm không đủ số lượng trong kho.", ex.getMessage());
    }

    @Test
    @DisplayName("TC-ORD-06: Tự động chuyển trạng thái Sản phẩm sang out_of_stock & Kiểm tra cảnh báo tồn kho khi khách mua hết số lượng cuối cùng")
    void createOrder_DepletesLastStock_SetsProductOutOfStockAndTriggersAlertCheck() {
        sampleProduct.setStock(2);
        sampleVariant.setStockQuantity(2);

        CreateOrderRequest req = CreateOrderRequest.builder().shippingAddressId(10L).paymentMethod("COD").build();

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(validAddress));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(503L);
            return o;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));

        customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1");

        assertEquals(0, sampleProduct.getStock());
        assertEquals("out_of_stock", sampleProduct.getStatus(), "Khi stock về 0 phải chuyển sang out_of_stock");
        assertEquals(0, sampleVariant.getStockQuantity());
        verify(inventoryAlertService, times(1)).checkAndAlert(sampleVariant, 2, 0);
    }

    @Test
    @DisplayName("TC-ORD-07: Cơ chế Fallback Phí giao hàng GHN (30,000đ), Fallback Bưu cục GHN (10000 + districtId) & Self-healing GPS khi địa chỉ thiếu tọa độ")
    void createOrder_WhenGhnFailsAndAddressMissingGps_UsesFallbacksAndSelfHealsGps() {
        validAddress.setLatitude(0.0);
        validAddress.setLongitude(0.0);

        CreateOrderRequest req = CreateOrderRequest.builder()
                .shippingAddressId(10L)
                .paymentMethod("COD")
                .shippingFee(null)
                .build();

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(validAddress));
        // Giả lập GHN API trả về null cho cả phí ship và trạm bưu cục
        when(ghnService.calculateShippingFee(anyInt(), anyString(), anyInt(), any())).thenReturn(null);
        when(ghnService.fetchNearestGhnStation(anyInt(), anyString())).thenReturn(null);

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(504L);
            return o;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));

        OrderResponse res = customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1");

        assertEquals(new BigDecimal("30000"), res.getShippingFee(), "Phải fallback phí ship mặc định 30,000 VNĐ");
        assertEquals(10000 + 1442, res.getGhnStationId(), "Phải fallback mã bưu cục 10000 + districtId");
        verify(shippingAddressService, times(1)).ensureGeocodedIfMissing(validAddress);
    }

    @Test
    @DisplayName("TC-ORD-08: Chặn đặt hàng khi Mã giảm giá gửi kèm trong lúc Checkout vừa hết lượt sử dụng trong tích tắc (Race Condition)")
    void createOrder_CouponExhaustedDuringLock_ThrowsBadRequest() {
        Coupon exhaustedCoupon = Coupon.builder()
                .id(1L).code("FLASH99").isActive(true).status("active")
                .usageLimit(10).usedCount(10)
                .build();

        CreateOrderRequest req = CreateOrderRequest.builder()
                .shippingAddressId(10L)
                .paymentMethod("COD")
                .couponCode("FLASH99")
                .build();

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(cartItemRepository.findByUserIdAndIsSelectedTrue(100L)).thenReturn(List.of(sampleCartItem));
        when(shippingAddressRepository.findByIdAndUserId(10L, 100L)).thenReturn(Optional.of(validAddress));
        when(couponRepository.findByCodeIgnoreCaseForUpdate("FLASH99")).thenReturn(Optional.of(exhaustedCoupon));

        AppException ex = assertThrows(AppException.class,
                () -> customerOrderService.createOrder("customer@apsports.com", req, "127.0.0.1"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Rất tiếc, mã giảm giá [FLASH99] vừa hết lượt sử dụng trong tích tắc!", ex.getMessage());
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("TC-ORD-09: Giải phóng tài nguyên đơn hàng (releaseOrderResources) -> Hoàn kho, hoàn lượt Coupon, khôi phục Giỏ hàng & Chống hoàn lặp")
    void releaseOrderResources_RestoresStockCouponCartAndIsIdempotent() {
        Coupon coupon = Coupon.builder().id(1L).code("SALE50K").usedCount(5).build();
        Order order = Order.builder()
                .id(900L).orderCode("AP900").user(customerUser)
                .coupon(coupon).stockReleased(false).build();
        OrderItem item = OrderItem.builder()
                .id(1L).order(order).product(sampleProduct).variant(sampleVariant).quantity(2).build();

        sampleProduct.setStock(0);
        sampleProduct.setStatus("out_of_stock");
        sampleVariant.setStockQuantity(0);

        when(orderRepository.findByIdForUpdate(900L)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(900L)).thenReturn(List.of(item));
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));
        when(cartItemRepository.findByUserIdAndProductIdAndVariantId(100L, 50L, 10L)).thenReturn(Optional.empty());

        // Lần gọi 1: Hoàn trả thành công
        boolean firstCall = realOrderInventoryService.releaseOrderResources(order, true);
        assertTrue(firstCall);
        assertEquals(2, sampleProduct.getStock());
        assertEquals("in_stock", sampleProduct.getStatus());
        assertEquals(2, sampleVariant.getStockQuantity());
        assertEquals(4, coupon.getUsedCount());
        assertTrue(order.isStockReleased());
        verify(cartItemRepository, times(1)).save(any(CartItem.class));

        // Lần gọi 2: Idempotent -> Bỏ qua ngay
        boolean secondCall = realOrderInventoryService.releaseOrderResources(order, true);
        assertFalse(secondCall);
        assertEquals(2, sampleVariant.getStockQuantity());
    }

    @Test
    @DisplayName("TC-ORD-10: Khấu trừ lại tài nguyên khi Thanh toán lại (reDeductOrderStock) -> Trừ kho, trừ giỏ hàng, tăng lại lượt Coupon & Chặn nếu kho đã hết")
    void reDeductOrderStock_RedeductsStockCartCoupon_AndBlocksIfOutOfStock() {
        Coupon coupon = Coupon.builder().id(1L).code("SALE50K").usedCount(4).build();
        Order order = Order.builder()
                .id(901L).orderCode("AP901").user(customerUser)
                .coupon(coupon).stockReleased(true).build();
        OrderItem item = OrderItem.builder()
                .id(1L).order(order).product(sampleProduct).variant(sampleVariant).quantity(2).build();

        sampleProduct.setStock(2);
        sampleVariant.setStockQuantity(2);
        CartItem restoredCartItem = CartItem.builder()
                .id(10L).user(customerUser).product(sampleProduct).variant(sampleVariant).quantity(2).build();

        when(orderRepository.findByIdForUpdate(901L)).thenReturn(Optional.of(order));
        when(orderItemRepository.findByOrderId(901L)).thenReturn(List.of(item));
        when(productRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(sampleProduct));
        when(productVariantRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(sampleVariant));
        when(cartItemRepository.findByUserIdAndProductIdAndVariantId(100L, 50L, 10L))
                .thenReturn(Optional.of(restoredCartItem));

        // Nhánh A: Kho đủ hàng -> Trừ lại kho, xóa item khỏi giỏ, tăng usedCount lên 5
        realOrderInventoryService.reDeductOrderStock(order);

        assertEquals(0, sampleProduct.getStock());
        assertEquals("out_of_stock", sampleProduct.getStatus());
        assertEquals(0, sampleVariant.getStockQuantity());
        assertEquals(5, coupon.getUsedCount());
        assertFalse(order.isStockReleased());
        verify(cartItemRepository, times(1)).delete(restoredCartItem);

        // Nhánh B: Khi kho không còn đủ hàng để thanh toán lại
        order.setStockReleased(true);
        sampleProduct.setStock(1); // < 2
        AppException ex = assertThrows(AppException.class,
                () -> realOrderInventoryService.reDeductOrderStock(order));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertTrue(ex.getMessage().contains("hiện đã hết hàng hoặc không đủ số lượng để thanh toán lại"));
    }
}
