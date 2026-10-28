package com.web.ap_sports.order;

import com.web.ap_sports.config.VNPayConfig;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import com.web.ap_sports.dto.response.customer.VNPayIpnResponse;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.OrderStatusHistory;
import com.web.ap_sports.entity.Payment;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.GhnService;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.OrderInventoryService;
import com.web.ap_sports.service.common.VNPayService;
import com.web.ap_sports.service.common.geocoding.GeocodingCascadeService;
import com.web.ap_sports.service.common.impl.VNPayServiceImpl;
import com.web.ap_sports.service.customer.ShippingAddressService;
import com.web.ap_sports.service.customer.impl.CustomerOrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Bộ Unit Test cho Nhóm 4: Thanh toán Trực tuyến VNPay (Generate URL, Checksum, Return, IPN Webhook, Retry & Auto-Refund)
 * (TC-VNP-01 -> TC-VNP-09, gồm 11 Unit Tests).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Nhóm 4: Cổng Thanh toán Trực tuyến VNPay & Đối soát IPN Unit Tests (11 Tests)")
class VNPayPaymentAndOrderCallbackTest {

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
    private VNPayService mockVnPayService;
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
    private GhnService ghnService;

    private VNPayConfig realVnPayConfig;
    private VNPayServiceImpl realVnPayService;
    private CustomerOrderServiceImpl customerOrderService;

    private User customerUser;
    private Order pendingOrder;
    private Payment pendingPayment;

    @BeforeEach
    void setUp() {
        realVnPayConfig = new VNPayConfig();
        ReflectionTestUtils.setField(realVnPayConfig, "vnpTmnCode", "APSPORTS1");
        ReflectionTestUtils.setField(realVnPayConfig, "vnpHashSecret", "SECRETKEY1234567890ABCDEF");
        ReflectionTestUtils.setField(realVnPayConfig, "vnpPayUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        ReflectionTestUtils.setField(realVnPayConfig, "vnpReturnUrl", "http://localhost:3000/checkout/vnpay-return");
        ReflectionTestUtils.setField(realVnPayConfig, "vnpApiUrl", "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction");

        realVnPayService = new VNPayServiceImpl(realVnPayConfig);

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
                mockVnPayService,
                emailService,
                shippingAddressService,
                geocodingCascadeService,
                eventPublisher,
                inventoryAlertService,
                orderInventoryService,
                realVnPayConfig,
                ghnService
        );

        customerUser = User.builder()
                .id(100L)
                .name("Nguyễn Văn A")
                .email("customer@apsports.com")
                .build();

        pendingOrder = Order.builder()
                .id(500L)
                .orderCode("AP20261029001")
                .user(customerUser)
                .totalPrice(new BigDecimal("220000"))
                .shippingFee(new BigDecimal("30000"))
                .discountAmount(BigDecimal.ZERO)
                .finalAmount(new BigDecimal("250000"))
                .status(OrderStatus.pending)
                .build();

        pendingPayment = Payment.builder()
                .id(10L)
                .order(pendingOrder)
                .paymentMethod(Payment.PaymentMethod.vnpay)
                .vnpTxnRef("AP20261029001")
                .amount(new BigDecimal("250000"))
                .status(Payment.PaymentStatus.pending)
                .build();
    }

    private Map<String, String> buildValidCallbackParams(String responseCode, String txStatus, String amountStr) {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "AP20261029001");
        params.put("vnp_TmnCode", "APSPORTS1");
        params.put("vnp_Amount", amountStr);
        params.put("vnp_ResponseCode", responseCode);
        params.put("vnp_TransactionStatus", txStatus);
        params.put("vnp_TransactionNo", "14567890");
        params.put("vnp_PayDate", "20261029003000");
        params.put("vnp_SecureHash", "VALID_HASH");
        return params;
    }

    @Test
    @DisplayName("TC-VNP-01: Khởi tạo URL thanh toán VNPay (generatePaymentUrl) & Xác thực chữ ký HMAC-SHA512 (verifyChecksum)")
    void generatePaymentUrl_AndVerifyChecksum_WorksAccurately() {
        String url = realVnPayService.generatePaymentUrl(pendingOrder, "0:0:0:0:0:0:0:1");

        assertNotNull(url);
        assertTrue(url.startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?"));
        assertTrue(url.contains("vnp_Amount=25000000"), "250,000 VNĐ phải nhân 100 thành 25000000");
        assertTrue(url.contains("vnp_IpAddr=127.0.0.1"), "IPv6 localhost phải chuẩn hóa về 127.0.0.1");
        assertTrue(url.contains("vnp_SecureHash="));

        // Trích xuất các tham số từ URL để kiểm chứng verifyChecksum
        String queryPart = url.substring(url.indexOf('?') + 1);
        Map<String, String> parsedParams = new HashMap<>();
        for (String pair : queryPart.split("&")) {
            int idx = pair.indexOf('=');
            String k = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.US_ASCII);
            String v = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.US_ASCII);
            parsedParams.put(k, v);
        }

        assertTrue(realVnPayService.verifyChecksum(parsedParams), "Chữ ký nguyên bản phải hợp lệ");

        // Giả mạo số tiền trên URL -> verifyChecksum phải trả về false
        parsedParams.put("vnp_Amount", "100000");
        assertFalse(realVnPayService.verifyChecksum(parsedParams), "Sửa số tiền phải làm mất hiệu lực chữ ký");
    }

    @Test
    @DisplayName("TC-VNP-02: Xử lý processVNPayReturn khi Thanh toán THÀNH CÔNG (00) -> Cập nhật Payment completed, trừ lại kho nếu đang payment_failed & Gửi Email")
    void processVNPayReturn_Success00_UpdatesPaymentAndSendsEmail() {
        pendingOrder.setStatus(OrderStatus.payment_failed);
        Map<String, String> params = buildValidCallbackParams("00", "00", "25000000");

        when(mockVnPayService.verifyChecksum(params)).thenReturn(true);
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());

        OrderResponse res = customerOrderService.processVNPayReturn(params);

        assertEquals("pending", res.getStatus(), "Đơn thanh toán lại thành công phải quay về pending chờ Admin duyệt");
        assertEquals("completed", res.getPaymentStatus());
        assertNotNull(pendingPayment.getPaidAt());
        assertEquals("14567890", pendingPayment.getTransactionId());

        verify(orderInventoryService, times(1)).reDeductOrderStock(pendingOrder);
        verify(emailService, times(1)).sendOrderConfirmationEmail(
                eq("customer@apsports.com"), eq("Nguyễn Văn A"), eq("AP20261029001"), eq("250000"), contains("VNPay")
        );
    }

    @Test
    @DisplayName("TC-VNP-03: Xử lý processVNPayReturn khi Thanh toán THẤT BẠI / KHÁCH HỦY (24) -> Đổi sang payment_failed, hoàn kho + khôi phục giỏ hàng & Sinh retryUrl")
    void processVNPayReturn_Failed24_ReleasesResourcesAndGeneratesRetryUrl() {
        Map<String, String> params = buildValidCallbackParams("24", "02", "25000000");

        when(mockVnPayService.verifyChecksum(params)).thenReturn(true);
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());
        when(mockVnPayService.generatePaymentUrl(eq(pendingOrder), anyString()))
                .thenReturn("https://sandbox.vnpayment.vn/retry-url");

        OrderResponse res = customerOrderService.processVNPayReturn(params);

        assertEquals("payment_failed", res.getStatus());
        assertEquals("failed", res.getPaymentStatus());
        assertEquals("https://sandbox.vnpayment.vn/retry-url", res.getPaymentUrl());
        verify(orderInventoryService, times(1)).releaseOrderResources(pendingOrder, true);
    }

    @Test
    @DisplayName("TC-VNP-04: Chặn processVNPayReturn khi Sai chữ ký (Invalid Checksum), Sai vnp_TmnCode, hoặc Sai lệch số tiền vnp_Amount")
    void processVNPayReturn_InvalidChecksumOrTmnCodeOrAmount_ThrowsBadRequest() {
        // Nhánh A: Sai chữ ký
        Map<String, String> badHashParams = buildValidCallbackParams("00", "00", "25000000");
        when(mockVnPayService.verifyChecksum(badHashParams)).thenReturn(false);

        AppException exHash = assertThrows(AppException.class,
                () -> customerOrderService.processVNPayReturn(badHashParams));
        assertEquals(HttpStatus.BAD_REQUEST, exHash.getStatus());
        assertTrue(exHash.getMessage().contains("Invalid Checksum"));

        // Nhánh B: Sai vnp_TmnCode
        Map<String, String> badTmnParams = buildValidCallbackParams("00", "00", "25000000");
        badTmnParams.put("vnp_TmnCode", "HACKER_TMN");
        when(mockVnPayService.verifyChecksum(badTmnParams)).thenReturn(true);
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));

        AppException exTmn = assertThrows(AppException.class,
                () -> customerOrderService.processVNPayReturn(badTmnParams));
        assertEquals(HttpStatus.BAD_REQUEST, exTmn.getStatus());
        assertEquals("Mã Merchant (vnp_TmnCode) không hợp lệ.", exTmn.getMessage());

        // Nhánh C: Sai số tiền vnp_Amount (Gửi 100,000 VNĐ thay vì 250,000 VNĐ)
        Map<String, String> badAmountParams = buildValidCallbackParams("00", "00", "10000000");
        when(mockVnPayService.verifyChecksum(badAmountParams)).thenReturn(true);

        AppException exAmount = assertThrows(AppException.class,
                () -> customerOrderService.processVNPayReturn(badAmountParams));
        assertEquals(HttpStatus.BAD_REQUEST, exAmount.getStatus());
        assertEquals("Số tiền thanh toán không khớp với đơn hàng.", exAmount.getMessage());
    }

    @Test
    @DisplayName("TC-VNP-05: Đảm bảo tính Idempotency trên processVNPayReturn khi khách F5 tải lại trang kết quả nhiều lần")
    void processVNPayReturn_WhenAlreadyCompleted_ReturnsImmediatelyWithoutDuplicateSideEffects() {
        pendingPayment.setStatus(Payment.PaymentStatus.completed);
        Map<String, String> params = buildValidCallbackParams("00", "00", "25000000");

        when(mockVnPayService.verifyChecksum(params)).thenReturn(true);
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());

        OrderResponse res = customerOrderService.processVNPayReturn(params);

        assertEquals("completed", res.getPaymentStatus());
        verify(paymentRepository, never()).save(any());
        verify(emailService, never()).sendOrderConfirmationEmail(anyString(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("TC-VNP-06: Tự động Hoàn tiền (Auto-Refund) khi Callback VNPay báo thành công (00) nhưng Đơn hàng đã bị Hủy (cancelled) trước đó")
    void processVNPayReturn_SuccessOnCancelledOrder_TriggersAutoRefund() {
        pendingOrder.setStatus(OrderStatus.cancelled);
        Map<String, String> params = buildValidCallbackParams("00", "00", "25000000");

        when(mockVnPayService.verifyChecksum(params)).thenReturn(true);
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));
        when(mockVnPayService.refundPayment(eq(pendingPayment), eq(pendingOrder), anyString(), eq("SystemAuto")))
                .thenReturn(true);
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());

        OrderResponse res = customerOrderService.processVNPayReturn(params);

        assertEquals("cancelled", res.getStatus(), "Đơn đã hủy không được tự ý mở lại");
        assertEquals("refunded", res.getPaymentStatus(), "Payment phải chuyển sang trạng thái refunded");
        verify(mockVnPayService, times(1)).refundPayment(eq(pendingPayment), eq(pendingOrder), anyString(), eq("SystemAuto"));
        verify(orderStatusHistoryRepository, times(1)).save(any(OrderStatusHistory.class));
    }

    @Test
    @DisplayName("TC-VNP-07a: Xử lý Webhook processVNPayIpn -> Trả đúng mã RspCode chuẩn VNPay cho các lỗi (97, 01, 99, 04, 02)")
    void processVNPayIpn_ErrorAndIdempotentScenarios_ReturnsStandardVnPayRspCodes() {
        // 1. Sai chữ ký -> 97
        Map<String, String> p97 = buildValidCallbackParams("00", "00", "25000000");
        when(mockVnPayService.verifyChecksum(p97)).thenReturn(false);
        assertEquals("97", customerOrderService.processVNPayIpn(p97).getRspCode());

        // 2. Không tìm thấy đơn hàng -> 01
        Map<String, String> p01 = buildValidCallbackParams("00", "00", "25000000");
        when(mockVnPayService.verifyChecksum(p01)).thenReturn(true);
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.empty());
        assertEquals("01", customerOrderService.processVNPayIpn(p01).getRspCode());

        // 3. Sai vnp_TmnCode -> 99
        Map<String, String> p99 = buildValidCallbackParams("00", "00", "25000000");
        p99.put("vnp_TmnCode", "WRONG_TMN");
        when(mockVnPayService.verifyChecksum(p99)).thenReturn(true);
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));
        assertEquals("99", customerOrderService.processVNPayIpn(p99).getRspCode());

        // 4. Sai số tiền vnp_Amount -> 04
        Map<String, String> p04 = buildValidCallbackParams("00", "00", "99999900");
        when(mockVnPayService.verifyChecksum(p04)).thenReturn(true);
        assertEquals("04", customerOrderService.processVNPayIpn(p04).getRspCode());

        // 5. Đơn hàng đã được xác nhận trước đó (Idempotent) -> 02
        pendingPayment.setStatus(Payment.PaymentStatus.completed);
        Map<String, String> p02 = buildValidCallbackParams("00", "00", "25000000");
        when(mockVnPayService.verifyChecksum(p02)).thenReturn(true);
        assertEquals("02", customerOrderService.processVNPayIpn(p02).getRspCode());
    }

    @Test
    @DisplayName("TC-VNP-07b: Xử lý Webhook processVNPayIpn thành công (00) cho cả giao dịch Thành công và Thất bại")
    void processVNPayIpn_ValidSuccessAndFailure_ReturnsRspCode00() {
        when(orderRepository.findByOrderCodeForUpdate("AP20261029001")).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));

        // Nhánh 1: Giao dịch IPN báo thất bại (24) -> Hoàn kho và trả RspCode = 00
        Map<String, String> failParams = buildValidCallbackParams("24", "02", "25000000");
        when(mockVnPayService.verifyChecksum(failParams)).thenReturn(true);

        VNPayIpnResponse resFail = customerOrderService.processVNPayIpn(failParams);
        assertEquals("00", resFail.getRspCode());
        assertEquals(OrderStatus.payment_failed, pendingOrder.getStatus());
        assertEquals(Payment.PaymentStatus.failed, pendingPayment.getStatus());
        verify(orderInventoryService, times(1)).releaseOrderResources(pendingOrder, true);

        // Nhánh 2: Giao dịch IPN báo thành công (00) -> Trừ lại kho, gửi email và trả RspCode = 00
        Map<String, String> okParams = buildValidCallbackParams("00", "00", "25000000");
        when(mockVnPayService.verifyChecksum(okParams)).thenReturn(true);

        VNPayIpnResponse resOk = customerOrderService.processVNPayIpn(okParams);
        assertEquals("00", resOk.getRspCode());
        assertEquals(OrderStatus.pending, pendingOrder.getStatus());
        assertEquals(Payment.PaymentStatus.completed, pendingPayment.getStatus());
        verify(orderInventoryService, times(1)).reDeductOrderStock(pendingOrder);
    }

    @Test
    @DisplayName("TC-VNP-08: Khách hàng bấm Thanh toán lại VNPay (retryVNPayPayment) thành công cho đơn payment_failed")
    void retryVNPayPayment_OnPaymentFailedOrder_RedeductsStockAndReturnsNewPaymentUrl() {
        pendingOrder.setStatus(OrderStatus.payment_failed);
        pendingPayment.setStatus(Payment.PaymentStatus.failed);

        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(orderRepository.findByOrderCodeAndUserIdForUpdate("AP20261029001", 100L)).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));
        when(mockVnPayService.generatePaymentUrl(pendingOrder, "127.0.0.1")).thenReturn("https://vnpay.vn/new-link");
        when(orderItemRepository.findByOrderId(500L)).thenReturn(Collections.emptyList());

        OrderResponse res = customerOrderService.retryVNPayPayment("customer@apsports.com", "AP20261029001", "127.0.0.1");

        assertEquals("pending", res.getStatus());
        assertEquals("pending", res.getPaymentStatus());
        assertEquals("https://vnpay.vn/new-link", res.getPaymentUrl());
        verify(orderInventoryService, times(1)).reDeductOrderStock(pendingOrder);
    }

    @Test
    @DisplayName("TC-VNP-09a: Chặn retryVNPayPayment khi Đơn hàng đã bị hủy (cancelled) hoặc đang vận chuyển (shipping)")
    void retryVNPayPayment_InvalidOrderStatus_ThrowsBadRequest() {
        pendingOrder.setStatus(OrderStatus.cancelled);
        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(orderRepository.findByOrderCodeAndUserIdForUpdate("AP20261029001", 100L)).thenReturn(Optional.of(pendingOrder));

        AppException ex = assertThrows(AppException.class,
                () -> customerOrderService.retryVNPayPayment("customer@apsports.com", "AP20261029001", "127.0.0.1"));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        assertEquals("Đơn hàng không ở trạng thái cho phép thanh toán lại.", ex.getMessage());
    }

    @Test
    @DisplayName("TC-VNP-09b: Chặn retryVNPayPayment khi Đơn hàng là COD hoặc Đã thanh toán hoàn tất (completed)")
    void retryVNPayPayment_CodOrAlreadyCompleted_ThrowsBadRequest() {
        when(userRepository.findByEmail("customer@apsports.com")).thenReturn(Optional.of(customerUser));
        when(orderRepository.findByOrderCodeAndUserIdForUpdate("AP20261029001", 100L)).thenReturn(Optional.of(pendingOrder));
        when(paymentRepository.findByOrderId(500L)).thenReturn(Optional.of(pendingPayment));

        // Nhánh A: Đơn hàng là COD (cash)
        pendingPayment.setPaymentMethod(Payment.PaymentMethod.cash);
        AppException exCod = assertThrows(AppException.class,
                () -> customerOrderService.retryVNPayPayment("customer@apsports.com", "AP20261029001", "127.0.0.1"));
        assertEquals(HttpStatus.BAD_REQUEST, exCod.getStatus());
        assertEquals("Phương thức thanh toán của đơn hàng không phải là VNPay.", exCod.getMessage());

        // Nhánh B: Đơn hàng VNPay nhưng đã completed
        pendingPayment.setPaymentMethod(Payment.PaymentMethod.vnpay);
        pendingPayment.setStatus(Payment.PaymentStatus.completed);
        AppException exDone = assertThrows(AppException.class,
                () -> customerOrderService.retryVNPayPayment("customer@apsports.com", "AP20261029001", "127.0.0.1"));
        assertEquals(HttpStatus.BAD_REQUEST, exDone.getStatus());
        assertEquals("Đơn hàng này đã được thanh toán hoặc hoàn tiền.", exDone.getMessage());
    }
}
