package com.web.ap_sports.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.config.VNPayConfig;
import com.web.ap_sports.controller.common.DemoLogisticsController;
import com.web.ap_sports.dto.request.admin.CancelOrderRequest;
import com.web.ap_sports.dto.request.admin.UpdateOrderStatusRequest;
import com.web.ap_sports.dto.request.warehouse.VerifyOrderPackRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.event.OrderCancelledByCustomerEvent;
import com.web.ap_sports.event.OrderStatusChangedEvent;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.admin.impl.AdminOrderServiceImpl;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.GhnService;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.NotificationService;
import com.web.ap_sports.service.common.OrderInventoryService;
import com.web.ap_sports.service.common.VNPayService;
import com.web.ap_sports.service.common.geocoding.GeocodingCascadeService;
import com.web.ap_sports.service.customer.ShippingAddressService;
import com.web.ap_sports.service.customer.impl.CustomerOrderServiceImpl;
import com.web.ap_sports.service.warehouse.impl.WarehouseFulfillmentServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Nhóm 5: Xem Đơn hàng, Hủy/Trả hàng, Xử lý Đơn hàng (Admin/Staff),
 * Kiểm đếm Barcode Xuất kho (WMS) & Portal Vận chuyển GHN (Logistics)
 * (TC-MGT-01 -> TC-MGT-11, gồm 11 Unit Tests).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Nhóm 5: Vòng đời Đơn hàng, WMS Barcode Fulfillment & Logistics Unit Tests (11 Tests)")
class OrderLifecycleFulfillmentAndLogisticsTest {

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
    private InventoryTransactionRepository inventoryTransactionRepository;
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
    private OrderInventoryService orderInventoryService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private VNPayConfig vnPayConfig;
    @Mock
    private GhnService ghnService;

    private CustomerOrderServiceImpl customerOrderService;
    private AdminOrderServiceImpl adminOrderService;
    private WarehouseFulfillmentServiceImpl warehouseFulfillmentService;
    private DemoLogisticsController demoLogisticsController;

    private User customerUser;
    private User staffUser;
    private User adminUser;
    private User warehouseUser;
    private User shipperUser;
    private Order sampleOrder;
    private OrderItem sampleOrderItem;

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
                orderInventoryService,
                vnPayConfig,
                ghnService
        );

        adminOrderService = new AdminOrderServiceImpl(
                orderRepository,
                orderItemRepository,
                orderStatusHistoryRepository,
                paymentRepository,
                productRepository,
                productVariantRepository,
                productImageRepository,
                userRepository,
                couponRepository,
                emailService,
                vnPayService,
                eventPublisher,
                inventoryAlertService,
                orderInventoryService
        );

        warehouseFulfillmentService = new WarehouseFulfillmentServiceImpl(
                orderRepository,
                orderItemRepository,
                orderStatusHistoryRepository,
                userRepository,
                adminOrderService,
                notificationService,
                new ObjectMapper(),
                inventoryTransactionRepository
        );

        demoLogisticsController = new DemoLogisticsController(adminOrderService);

        customerUser = User.builder()
                .id(100L).name("Khách Hàng A").email("customer@gmail.com").phoneNumber("0988776655")
                .role(Role.builder().id(4L).name("CUSTOMER").build()).build();
        staffUser = User.builder()
                .id(20L).name("Nhân Viên Bán Hàng").email("staff@apsports.com")
                .role(Role.builder().id(2L).name("STAFF").build()).build();
        adminUser = User.builder()
                .id(1L).name("Quản Trị Viên").email("admin@apsports.com")
                .role(Role.builder().id(1L).name("ADMIN").build()).build();
        warehouseUser = User.builder()
                .id(30L).name("Thủ Kho Trưởng").email("warehouse@apsports.com")
                .role(Role.builder().id(3L).name("WAREHOUSE_MANAGER").build()).build();
        shipperUser = User.builder()
                .id(40L).name("Tài Xế GHN").email("shipper@ghn.vn").phoneNumber("0911223344")
                .role(Role.builder().id(5L).name("GHN_SHIPPER").build()).build();

        ShippingAddress addr = ShippingAddress.builder()
                .id(10L).user(customerUser).fullName("Khách Hàng A").phone("0988776655")
                .address("123 Đường 3/2").city("Cần Thơ").build();

        Product prod = Product.builder().id(50L).name("Giày Nike").slug("giay-nike").price(new BigDecimal("1000000")).build();
        ProductVariant variant = ProductVariant.builder()
                .id(10L).product(prod).sku("NIKE-42").barcode("8930001").size("42").color("Đỏ")
                .price(new BigDecimal("1000000")).costPrice(new BigDecimal("600000")).build();

        sampleOrder = Order.builder()
                .id(500L)
                .orderCode("AP2026001")
                .user(customerUser)
                .shippingAddress(addr)
                .totalPrice(new BigDecimal("2000000"))
                .shippingFee(new BigDecimal("30000"))
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("2030000"))
                .status(OrderStatus.pending)
                .packVerified(false)
                .build();

        sampleOrderItem = OrderItem.builder()
                .id(1000L)
                .order(sampleOrder)
                .product(prod)
                .variant(variant)
                .quantity(2)
                .price(new BigDecimal("1000000"))
                .costPrice(new BigDecimal("600000"))
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("TC-MGT-01: Khách hàng xem danh sách đơn hàng (getMyOrders) kèm cờ isReviewed & Chặn xem chi tiết đơn của người khác (getOrderByCode)")
    void getMyOrders_AndGetOrderByCode_MapsReviewedFlagAndBlocksOtherUserOrders() {
        when(userRepository.findByEmail("customer@gmail.com")).thenReturn(Optional.of(customerUser));
        when(orderRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleOrder)));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(List.of(sampleOrderItem));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.empty());
        when(reviewRepository.findReviewedOrderItemIds(List.of(1000L))).thenReturn(List.of(1000L));
        when(productImageRepository.findByProductId(50L)).thenReturn(Collections.emptyList());

        Page<OrderResponse> page = customerOrderService.getMyOrders(
                "customer@gmail.com", "pending", "AP2026", "createdAt", "DESC",
                LocalDate.now().minusDays(7), LocalDate.now(), PageRequest.of(0, 10)
        );

        assertEquals(1, page.getTotalElements());
        assertTrue(page.getContent().get(0).getItems().get(0).isReviewed(), "Mặt hàng đã đánh giá phải có isReviewed = true");

        // Chặn xem đơn hàng không thuộc về mình
        when(orderRepository.findByOrderCodeAndUserId("AP_OTHER_USER", 100L)).thenReturn(Optional.empty());
        AppException ex = assertThrows(AppException.class,
                () -> customerOrderService.getOrderByCode("customer@gmail.com", "AP_OTHER_USER"));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    @DisplayName("TC-MGT-02: Khách hàng chủ động Hủy đơn hàng (cancelMyOrder) -> Hoàn kho (restoreCart = false), tự động hoàn tiền VNPay nếu đã thanh toán & bắn Event")
    void cancelMyOrder_WhenConfirmedAndPaidViaVnPay_ReleasesStockAndRefundsVnPay() {
        sampleOrder.setStatus(OrderStatus.confirmed);
        Payment paidVnPay = Payment.builder()
                .id(1L).order(sampleOrder).paymentMethod(Payment.PaymentMethod.vnpay)
                .status(Payment.PaymentStatus.completed).amount(new BigDecimal("2030000")).build();

        when(userRepository.findByEmail("customer@gmail.com")).thenReturn(Optional.of(customerUser));
        when(orderRepository.findByOrderCodeAndUserIdForUpdate("AP2026001", 100L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(paidVnPay));
        when(vnPayService.refundPayment(eq(paidVnPay), eq(sampleOrder), anyString(), eq("customer@gmail.com")))
                .thenReturn(true);
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());

        OrderResponse res = customerOrderService.cancelMyOrder("customer@gmail.com", "AP2026001", "Đổi ý chọn size khác");

        assertEquals("cancelled", res.getStatus());
        assertEquals("refunded", res.getPaymentStatus());
        verify(orderInventoryService, times(1)).releaseOrderResources(sampleOrder, false);
        verify(eventPublisher, times(1)).publishEvent(any(OrderCancelledByCustomerEvent.class));
    }

    @Test
    @DisplayName("TC-MGT-03: Chặn Khách hàng (và Admin) Hủy đơn hàng khi đơn Đã bàn giao bưu cục GHN hoặc Đang vận chuyển (shipped, shipping, delivered)")
    void cancelOrder_WhenAlreadyHandedOverToGhn_ThrowsBadRequest() {
        sampleOrder.setStatus(OrderStatus.shipping);

        when(userRepository.findByEmail("customer@gmail.com")).thenReturn(Optional.of(customerUser));
        when(orderRepository.findByOrderCodeAndUserIdForUpdate("AP2026001", 100L)).thenReturn(Optional.of(sampleOrder));

        AppException exCust = assertThrows(AppException.class,
                () -> customerOrderService.cancelMyOrder("customer@gmail.com", "AP2026001", "Hủy"));
        assertEquals(HttpStatus.BAD_REQUEST, exCust.getStatus());
        assertEquals("Đơn hàng đã bàn giao bưu cục GHN / đang vận chuyển, không thể hủy bỏ!", exCust.getMessage());

        when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findByIdForUpdate(500L)).thenReturn(Optional.of(sampleOrder));

        AppException exAdmin = assertThrows(AppException.class,
                () -> adminOrderService.cancelOrder(500L, new CancelOrderRequest("Khách báo hủy"), "admin@apsports.com"));
        assertEquals(HttpStatus.BAD_REQUEST, exAdmin.getStatus());
    }

    @Test
    @DisplayName("TC-MGT-04: Khách hàng gửi yêu cầu Trả hàng (returnMyOrder) & Xác nhận Đã nhận hàng (completeMyOrder) -> Chỉ cho phép khi đang ở trạng thái delivered")
    void returnAndCompleteMyOrder_AllowedOnlyWhenDelivered() {
        when(userRepository.findByEmail("customer@gmail.com")).thenReturn(Optional.of(customerUser));
        when(orderRepository.findByOrderCodeAndUserId("AP2026001", 100L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.findByOrderCodeAndUserIdForUpdate("AP2026001", 100L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());

        // Nhánh A: Đơn mới đang shipping -> Chặn cả 2 thao tác
        sampleOrder.setStatus(OrderStatus.shipping);
        assertThrows(AppException.class, () -> customerOrderService.returnMyOrder("customer@gmail.com", "AP2026001", "Lỗi chỉ"));
        assertThrows(AppException.class, () -> customerOrderService.completeMyOrder("customer@gmail.com", "AP2026001"));

        // Nhánh B: Đơn đã delivered -> Cho phép xác nhận hoàn tất (completed) hoặc trả hàng (returned)
        sampleOrder.setStatus(OrderStatus.delivered);
        OrderResponse completedRes = customerOrderService.completeMyOrder("customer@gmail.com", "AP2026001");
        assertEquals("completed", completedRes.getStatus());

        sampleOrder.setStatus(OrderStatus.delivered);
        OrderResponse returnedRes = customerOrderService.returnMyOrder("customer@gmail.com", "AP2026001", "Size hơi chật");
        assertEquals("returned", returnedRes.getStatus());
    }

    @Test
    @DisplayName("TC-MGT-05: Nhân viên xác nhận duyệt đơn hàng (confirmOrder) -> Chuyển sang confirmed & Gán processedByStaff phục vụ tính KPI doanh số")
    void confirmOrder_FromPending_SetsConfirmedAndAssignsStaff() {
        when(userRepository.findByEmail("staff@apsports.com")).thenReturn(Optional.of(staffUser));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());
        when(orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(500L)).thenReturn(Collections.emptyList());

        AdminOrderDetailResponse res = adminOrderService.confirmOrder(500L, "staff@apsports.com");

        assertEquals("confirmed", res.getStatus());
        assertNotNull(res.getProcessedByStaff());
        assertEquals("staff@apsports.com", res.getProcessedByStaff().getEmail());

        // Gọi confirmOrder lần nữa khi đã ở trạng thái confirmed -> Phải bị chặn 400
        AppException ex = assertThrows(AppException.class,
                () -> adminOrderService.confirmOrder(500L, "staff@apsports.com"));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    @DisplayName("TC-MGT-06: Thủ kho kiểm đếm Barcode 100% & Đóng gói xuất kho (verifyOrderPack) -> Bật packVerified = true, tự động sinh phiếu xuất kho PXK-DH-... & bắn thông báo")
    void verifyOrderPack_WhenScannedMatches100Percent_CreatesExportTransactionAndSealsOrder() {
        sampleOrder.setStatus(OrderStatus.confirmed);
        VerifyOrderPackRequest req = VerifyOrderPackRequest.builder()
                .scannedItems(List.of(
                        VerifyOrderPackRequest.ScannedItem.builder().variantId(10L).barcode("8930001").scannedQuantity(2).build()
                ))
                .note("Đã bọc chống sốc 2 lớp")
                .build();

        when(userRepository.findByEmail("warehouse@apsports.com")).thenReturn(Optional.of(warehouseUser));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(sampleOrder));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(List.of(sampleOrderItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productImageRepository.findByProductId(50L)).thenReturn(Collections.emptyList());
        when(orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(500L)).thenReturn(Collections.emptyList());

        AdminOrderDetailResponse res = warehouseFulfillmentService.verifyOrderPack(500L, req, "warehouse@apsports.com");

        assertTrue(res.getPackVerified());
        assertEquals("Thủ Kho Trưởng", res.getPackedByName());

        ArgumentCaptor<InventoryTransaction> txCaptor = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(inventoryTransactionRepository, times(1)).save(txCaptor.capture());
        InventoryTransaction savedTx = txCaptor.getValue();
        assertEquals("PXK-DH-AP2026001", savedTx.getCode());
        assertEquals(InventoryTransaction.TransactionType.EXPORT, savedTx.getType());
        assertEquals(2, savedTx.getQuantity());
    }

    @Test
    @DisplayName("TC-MGT-07: Chặn kiểm đếm đóng gói (verifyOrderPack) khi: Role là STAFF bán hàng (403), Quét thiếu số lượng Barcode, hoặc Đơn đã đóng gói rồi")
    void verifyOrderPack_UnauthorizedRoleOrMismatchOrAlreadyPacked_ThrowsException() {
        sampleOrder.setStatus(OrderStatus.confirmed);
        VerifyOrderPackRequest reqMismatch = VerifyOrderPackRequest.builder()
                .scannedItems(List.of(
                        VerifyOrderPackRequest.ScannedItem.builder().variantId(10L).scannedQuantity(1).build() // Yêu cầu 2 nhưng mới quét 1
                ))
                .build();

        // Nhánh A: Nhân viên bán hàng (STAFF) cố tình gọi API đóng gói kho -> 403 FORBIDDEN
        when(userRepository.findByEmail("staff@apsports.com")).thenReturn(Optional.of(staffUser));
        AppException exRole = assertThrows(AppException.class,
                () -> warehouseFulfillmentService.verifyOrderPack(500L, reqMismatch, "staff@apsports.com"));
        assertEquals(HttpStatus.FORBIDDEN, exRole.getStatus());

        // Nhánh B: Thủ kho quét thiếu số lượng (1/2) -> 400 BAD_REQUEST
        when(userRepository.findByEmail("warehouse@apsports.com")).thenReturn(Optional.of(warehouseUser));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(sampleOrder));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(List.of(sampleOrderItem));

        AppException exMismatch = assertThrows(AppException.class,
                () -> warehouseFulfillmentService.verifyOrderPack(500L, reqMismatch, "warehouse@apsports.com"));
        assertEquals(HttpStatus.BAD_REQUEST, exMismatch.getStatus());
        assertTrue(exMismatch.getMessage().contains("Kiểm đếm Barcode chưa đủ 100%"));

        // Nhánh C: Đơn hàng đã được đóng gói trước đó (packVerified = true) -> Chặn đóng gói lặp
        sampleOrder.setPackVerified(true);
        AppException exAlready = assertThrows(AppException.class,
                () -> warehouseFulfillmentService.verifyOrderPack(500L, reqMismatch, "warehouse@apsports.com"));
        assertEquals(HttpStatus.BAD_REQUEST, exAlready.getStatus());
        assertTrue(exAlready.getMessage().contains("đã được kiểm đếm barcode và xuất kho niêm phong trước đó"));
    }

    @Test
    @DisplayName("TC-MGT-08: Ràng buộc Máy trạng thái nghiêm ngặt (Strict State Machine) -> Chặn xuất kho processing nếu chưa quét Barcode & Chặn nhảy cóc trạng thái")
    void updateOrderStatus_StrictStateMachineAndBarcodeGate_EnforcedCorrectly() {
        sampleOrder.setStatus(OrderStatus.confirmed);
        sampleOrder.setPackVerified(false);

        when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(sampleOrder));

        // 1. Chuyển confirmed -> processing nhưng chưa quét Barcode (packVerified = false) -> Chặn
        AppException exUnpacked = assertThrows(AppException.class,
                () -> adminOrderService.updateOrderStatus(500L, new UpdateOrderStatusRequest("processing", null), "admin@apsports.com"));
        assertEquals(HttpStatus.BAD_REQUEST, exUnpacked.getStatus());
        assertTrue(exUnpacked.getMessage().contains("chưa được bộ phận kho kiểm đếm Barcode 100%"));

        // 2. Sau khi đã quét Barcode (packVerified = true) -> Cho phép chuyển sang processing
        sampleOrder.setPackVerified(true);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());
        when(orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(500L)).thenReturn(Collections.emptyList());

        AdminOrderDetailResponse resProc = adminOrderService.updateOrderStatus(
                500L, new UpdateOrderStatusRequest("processing", "Xuất kho"), "admin@apsports.com"
        );
        assertEquals("processing", resProc.getStatus());

        // 3. Nhảy cóc từ processing -> delivered (bỏ qua shipped và shipping) -> Chặn
        AppException exSkip = assertThrows(AppException.class,
                () -> adminOrderService.updateOrderStatus(500L, new UpdateOrderStatusRequest("delivered", null), "admin@apsports.com"));
        assertEquals(HttpStatus.BAD_REQUEST, exSkip.getStatus());
        assertEquals("Đơn hàng phải ở trạng thái [Đang Giao - shipping] mới có thể xác nhận đã giao thành công!", exSkip.getMessage());
    }

    @Test
    @DisplayName("TC-MGT-09: Tự động đánh dấu Đã thu tiền (Payment.completed) khi đơn hàng COD chuyển sang trạng thái Đã giao thành công (delivered)")
    void updateOrderStatus_ToDeliveredOnCodOrder_AutomaticallyMarksPaymentCompleted() {
        sampleOrder.setStatus(OrderStatus.shipping);
        Payment codPayment = Payment.builder()
                .id(1L).order(sampleOrder).paymentMethod(Payment.PaymentMethod.cash)
                .status(Payment.PaymentStatus.pending).amount(new BigDecimal("2030000")).build();

        when(userRepository.findByEmail("shipper@ghn.vn")).thenReturn(Optional.of(shipperUser));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(codPayment));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());
        when(orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(500L)).thenReturn(Collections.emptyList());

        AdminOrderDetailResponse res = adminOrderService.updateOrderStatus(
                500L, new UpdateOrderStatusRequest("delivered", "Khách đã nhận hàng và trả tiền mặt"), "shipper@ghn.vn"
        );

        assertEquals("delivered", res.getStatus());
        assertEquals("completed", res.getPaymentStatus());
        assertNotNull(codPayment.getPaidAt());
        assertEquals(shipperUser, sampleOrder.getAssignedShipper(), "Phải tự động gán tài xế GHN vào assignedShipper");
        verify(eventPublisher, times(1)).publishEvent(any(OrderStatusChangedEvent.class));
    }

    @Test
    @DisplayName("TC-MGT-10: Bảo toàn Nhân viên phụ trách (processedByStaff) khi Quản trị viên khác bấm Hủy đơn & Gửi hóa đơn điện tử E-Invoice (sendEInvoice)")
    void cancelOrder_PreservesOriginalStaff_AndSendEInvoiceWorks() {
        sampleOrder.setStatus(OrderStatus.confirmed);
        sampleOrder.setProcessedByStaff(staffUser); // Nhân viên bán hàng đã duyệt đơn trước đó

        when(userRepository.findByEmail("admin@apsports.com")).thenReturn(Optional.of(adminUser));
        when(orderRepository.findByIdForUpdate(500L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.empty());
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());
        when(orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(500L)).thenReturn(Collections.emptyList());

        // Admin vào bấm hủy đơn -> processedByStaff vẫn phải giữ nguyên là staffUser
        AdminOrderDetailResponse cancelRes = adminOrderService.cancelOrder(
                500L, new CancelOrderRequest("Hết màu khách chọn"), "admin@apsports.com"
        );

        assertEquals("cancelled", cancelRes.getStatus());
        assertEquals(staffUser, sampleOrder.getProcessedByStaff(), "Không được ghi đè nhân viên bán hàng phụ trách ban đầu");

        // Kiểm thử gửi E-Invoice thành công
        adminOrderService.sendEInvoice(500L);
        verify(emailService, times(1)).sendEInvoiceEmail(eq("customer@gmail.com"), any(AdminOrderDetailResponse.class));
    }

    @Test
    @DisplayName("TC-MGT-11: Phân quyền cô lập giữa Bưu cục (ROLE_GHN_STATION) & Tài xế (ROLE_GHN_SHIPPER) và Che giấu dữ liệu nhạy cảm SĐT/Email (DemoLogisticsController)")
    void demoLogisticsController_IsolatesStationAndShipperRoles_AndMasksCustomerData() {
        Authentication stationAuth = new UsernamePasswordAuthenticationToken(
                "station@ghn.vn", null, List.of(new SimpleGrantedAuthority("ROLE_GHN_STATION"))
        );
        Authentication shipperAuth = new UsernamePasswordAuthenticationToken(
                "shipper@ghn.vn", null, List.of(new SimpleGrantedAuthority("ROLE_GHN_SHIPPER"))
        );

        // Nhánh A: Bưu cục (GHN_STATION) cố tình gọi xác nhận giao thành công (delivered) -> Chặn 403
        AppException exStation = assertThrows(AppException.class, () ->
                demoLogisticsController.updateDemoOrderStatus(500L, new UpdateOrderStatusRequest("delivered", null), stationAuth)
        );
        assertEquals(HttpStatus.FORBIDDEN, exStation.getStatus());

        // Nhánh B: Tài xế (GHN_SHIPPER) cố tình gọi chuyển sang shipped (việc của Bưu cục) -> Chặn 403
        AppException exShipper = assertThrows(AppException.class, () ->
                demoLogisticsController.updateDemoOrderStatus(500L, new UpdateOrderStatusRequest("shipped", null), shipperAuth)
        );
        assertEquals(HttpStatus.FORBIDDEN, exShipper.getStatus());

        // Nhánh C: Tài xế (GHN_SHIPPER) xác nhận delivered hợp lệ -> Thành công & Tự động che SĐT + Email khách hàng
        sampleOrder.setStatus(OrderStatus.shipping);
        when(userRepository.findByEmail("shipper@ghn.vn")).thenReturn(Optional.of(shipperUser));
        when(orderRepository.findById(500L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.empty());
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());
        when(orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(500L)).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<AdminOrderDetailResponse>> res = demoLogisticsController.updateDemoOrderStatus(
                500L, new UpdateOrderStatusRequest("delivered", "Đã giao tận tay"), shipperAuth
        );

        AdminOrderDetailResponse maskedData = res.getBody().getData();
        assertEquals("098****655", maskedData.getCustomerPhone(), "Số điện thoại 0988776655 phải được che thành 098****655");
        assertEquals("c***@gmail.com", maskedData.getCustomerEmail(), "Email customer@gmail.com phải được che thành c***@gmail.com");
    }
}
