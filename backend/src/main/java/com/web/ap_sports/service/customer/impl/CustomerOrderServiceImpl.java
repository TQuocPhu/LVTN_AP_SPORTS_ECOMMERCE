package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.config.VNPayConfig;
import com.web.ap_sports.constant.StoreLocationConstants;
import com.web.ap_sports.dto.request.customer.CreateOrderRequest;
import com.web.ap_sports.dto.response.customer.OrderItemResponse;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.enums.PaymentStatus;
import com.web.ap_sports.event.OrderPlacedEvent;
import com.web.ap_sports.event.OrderCancelledByCustomerEvent;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.InventoryAlertService;
import com.web.ap_sports.service.common.VNPayService;
import com.web.ap_sports.service.customer.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.web.ap_sports.service.customer.ShippingAddressService;
import com.web.ap_sports.service.common.geocoding.GeocodingCascadeService;
import com.web.ap_sports.service.common.geocoding.GeoCoordinate;
import com.web.ap_sports.event.OrderPlacedEvent;
import com.web.ap_sports.event.OrderCancelledByCustomerEvent;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor 
@Slf4j
public class CustomerOrderServiceImpl implements CustomerOrderService {

    private static final String DEFAULT_CLIENT_IP = "127.0.0.1";

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReviewRepository reviewRepository;
    private final PaymentRepository paymentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final UserRepository userRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final VNPayService vnPayService;
    private final EmailService emailService;
    private final ShippingAddressService shippingAddressService;
    private final GeocodingCascadeService geocodingCascadeService;
    private final ApplicationEventPublisher eventPublisher;
    private final InventoryAlertService inventoryAlertService;
    private final com.web.ap_sports.service.common.OrderInventoryService orderInventoryService;
    private final com.web.ap_sports.config.VNPayConfig vnPayConfig;
    private final com.web.ap_sports.service.common.GhnService ghnService;

    @Value("${app.shipping.ghn.api-url:https://online-gateway.ghn.vn/shiip/public-api/v2}")
    private String ghnApiUrl;

    @Value("${app.shipping.ghn.token:}")
    private String ghnToken;

    @Value("${app.shipping.ghn.shop-id:}")
    private String ghnShopId;


    @Override
    @Transactional
    public OrderResponse createOrder(String email, CreateOrderRequest request, String clientIp) {
        User user = getUserByEmail(email);

        // 1. Kiểm tra Giỏ hàng & Lọc theo sản phẩm đã chọn
        List<CartItem> cartItems;
        if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
            cartItems = cartItemRepository.findByUserIdAndIdIn(user.getId(), request.getCartItemIds());
        } else {
            cartItems = cartItemRepository.findByUserIdAndIsSelectedTrue(user.getId());
            if (cartItems.isEmpty()) {
                cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            }
        }
        if (cartItems.isEmpty()) {
            throw new AppException("Vui lòng chọn ít nhất 1 sản phẩm từ giỏ hàng để tạo đơn hàng.", HttpStatus.BAD_REQUEST);
        }

        // 2. Kiểm tra Địa chỉ giao hàng
        ShippingAddress address = shippingAddressRepository.findByIdAndUserId(request.getShippingAddressId(), user.getId())
                .orElseThrow(() -> new AppException("Địa chỉ giao hàng không hợp lệ.", HttpStatus.NOT_FOUND));

        // 3. Tính tổng tiền & tổng trọng lượng (grams) của CÁC SẢN PHẨM ĐƯỢC CHỌN TRONG GIỎ HÀNG
        BigDecimal totalPrice = BigDecimal.ZERO;
        int totalWeight = 0;
        for (CartItem item : cartItems) {
            BigDecimal price = item.getVariant() != null && item.getVariant().getPrice() != null
                    ? item.getVariant().getPrice()
                    : item.getProduct().getPrice();
            totalPrice = totalPrice.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));

            Product p = item.getProduct();
            int w = (p != null && p.getWeight() != null && p.getWeight() > 0) ? p.getWeight() : 500;
            totalWeight += w * (item.getQuantity() != null ? item.getQuantity() : 1);
        }
        if (totalWeight <= 0) totalWeight = 500;

        // 4. Tính Phí giao hàng GHN thực tế từ Kho AP Sports ĐHCT (Ninh Kiều, Cần Thơ) theo tổng trọng lượng và tổng giá trị sản phẩm được chọn
        BigDecimal shippingFee = calculateGhnShippingFee(address.getDistrictId(), address.getWardCode(), totalWeight, totalPrice);
        if (shippingFee == null && request.getShippingFee() != null) {
            shippingFee = request.getShippingFee();
        }
        if (shippingFee == null) {
            shippingFee = BigDecimal.valueOf(30000);
        }
        log.info("[GHN Shipping Fee] Phí giao hàng cho {} sản phẩm được chọn (tổng {}g): {} VNĐ (districtId={}, wardCode={})",
                cartItems.size(), totalWeight, shippingFee, address.getDistrictId(), address.getWardCode());

        // 5. Áp dụng mã giảm giá (Coupon) nếu có & Ràng buộc loại giảm giá (FREESHIP vs FIXED vs PERCENT)
        Coupon appliedCoupon = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            String code = request.getCouponCode().trim().toUpperCase();
            Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                    .orElseThrow(() -> new AppException("Mã giảm giá [" + code + "] không tồn tại trên hệ thống.", HttpStatus.BAD_REQUEST));

            LocalDateTime now = LocalDateTime.now();

            if (!Boolean.TRUE.equals(coupon.getIsActive()) || (coupon.getStatus() != null && !"active".equalsIgnoreCase(coupon.getStatus()))) {
                throw new AppException("Mã giảm giá [" + code + "] hiện đã bị tạm dừng hoặc không còn hoạt động.", HttpStatus.BAD_REQUEST);
            }
            if (coupon.getStartsAt() != null && coupon.getStartsAt().isAfter(now)) {
                throw new AppException("Mã giảm giá [" + code + "] chưa đến thời gian sử dụng.", HttpStatus.BAD_REQUEST);
            }
            if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(now)) {
                throw new AppException("Mã giảm giá [" + code + "] đã hết hạn sử dụng.", HttpStatus.BAD_REQUEST);
            }
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                throw new AppException("Mã giảm giá [" + code + "] đã hết lượt sử dụng.", HttpStatus.BAD_REQUEST);
            }
            if (coupon.getUserUsageLimit() != null && coupon.getUserUsageLimit() > 0) {
                long userUsedCount = orderRepository.countByUserIdAndCouponIdAndStatusNotIn(
                        user.getId(), coupon.getId(), List.of(OrderStatus.cancelled, OrderStatus.payment_failed)
                );
                if (userUsedCount >= coupon.getUserUsageLimit()) {
                    throw new AppException("Tài khoản của bạn đã sử dụng hết lượt (" + coupon.getUserUsageLimit() + " lần) của mã giảm giá này.", HttpStatus.BAD_REQUEST);
                }
            }
            if (coupon.getMinOrderValue() != null && totalPrice.compareTo(coupon.getMinOrderValue()) < 0) {
                throw new AppException(String.format("Đơn hàng tối thiểu phải từ %,d VNĐ để áp dụng mã giảm giá này.", coupon.getMinOrderValue().longValue()), HttpStatus.BAD_REQUEST);
            }

            appliedCoupon = coupon;
            Coupon.CouponType type = coupon.getType();

            if (type == Coupon.CouponType.PERCENT) {
                BigDecimal percentRatio = coupon.getValue().divide(new BigDecimal("100"), 4, java.math.RoundingMode.HALF_UP);
                discountAmount = totalPrice.multiply(percentRatio).setScale(2, java.math.RoundingMode.HALF_UP);
                if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    if (discountAmount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                        discountAmount = coupon.getMaxDiscountAmount();
                    }
                }
                if (discountAmount.compareTo(totalPrice) > 0) {
                    discountAmount = totalPrice;
                }
            } else if (type == Coupon.CouponType.FIXED) {
                discountAmount = coupon.getValue() != null ? coupon.getValue() : BigDecimal.ZERO;
                if (discountAmount.compareTo(totalPrice) > 0) {
                    discountAmount = totalPrice;
                }
            } else if (type == Coupon.CouponType.FREESHIP) {
                // FREESHIP chỉ trừ vào tiền ship, tối đa bằng phí ship thực tế
                discountAmount = coupon.getValue() != null ? coupon.getValue() : BigDecimal.ZERO;
                if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
                    discountAmount = discountAmount.min(coupon.getMaxDiscountAmount());
                }
                discountAmount = discountAmount.min(shippingFee);
            }
        }

        BigDecimal finalAmount = totalPrice.add(shippingFee).subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        // 6. Mã đơn hàng ngẫu nhiên (Ví dụ: AP202609241530123)
        String orderCode = "AP" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + (100 + new Random().nextInt(900));

        // Mã vận đơn GHN tự động
        String trackingCode = "GHN-" + orderCode;

        // 7. Tra cứu bưu cục kho GHN gần nhất (gọi qua GhnService Bean riêng biệt để đảm bảo Propagation.NOT_SUPPORTED hoạt động, tránh HikariCP leak)
        Map<String, Object> ghnStationInfo = ghnService.fetchNearestGhnStation(address.getDistrictId(), address.getWardCode());

        // 8. Tọa độ GPS thực của Khách Hàng (lấy từ ShippingAddress, self-heal nếu thiếu)
        if (address.getLatitude() == null || address.getLatitude() == 0.0
                || address.getLongitude() == null || address.getLongitude() == 0.0) {
            log.warn("[Order] Địa chỉ ID: {} chưa có tọa độ trong DB, tiến hành self-heal geocode.", address.getId());
            shippingAddressService.ensureGeocodedIfMissing(address);
        }

        double customerLat = address.getLatitude() != null ? address.getLatitude() : 0.0;
        double customerLng = address.getLongitude() != null ? address.getLongitude() : 0.0;

        if (customerLat == 0.0 || customerLng == 0.0) {
            log.error("[Order] Không thể xác định tọa độ GPS cho đơn hàng, đơn sẽ không có vị trí khách chính xác. addressId={}", address.getId());
        }

        // Tạo Entity Order
        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .totalPrice(totalPrice)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(OrderStatus.pending)
                .shippingAddress(address)
                .shippingProvider("GHN")
                .trackingCode(trackingCode)
                .gpsLatitude(customerLat)
                .gpsLongitude(customerLng)
                .coupon(appliedCoupon)
                .note(request.getNote())
                .build();

        if (ghnStationInfo != null) {
            // Station ID: sandbox trả 'station_id', production trả 'locationId'
            Object stationIdObj = ghnStationInfo.get("locationId");
            if (stationIdObj == null) stationIdObj = ghnStationInfo.get("station_id");
            if (stationIdObj == null) stationIdObj = ghnStationInfo.get("id");
            if (stationIdObj instanceof Number) {
                order.setGhnStationId(((Number) stationIdObj).intValue());
            } else if (stationIdObj != null) {
                try { order.setGhnStationId(Integer.parseInt(stationIdObj.toString())); } catch (Exception ignored) {}
            }

            // Station Name: sandbox trả 'name', production trả 'locationName'
            Object nameObj = ghnStationInfo.get("locationName");
            if (nameObj == null) nameObj = ghnStationInfo.get("name");
            if (nameObj != null) order.setGhnStationName(String.valueOf(nameObj));

            // Station Address
            Object addrObj = ghnStationInfo.get("address");
            if (addrObj != null) order.setGhnStationAddress(String.valueOf(addrObj));

            // Station Lat/Lng: production có, sandbox KHÔNG có
            Object latObj = ghnStationInfo.get("latitude");
            if (latObj == null) latObj = ghnStationInfo.get("lat");
            if (latObj instanceof Number) {
                order.setGhnStationLatitude(((Number) latObj).doubleValue());
            } else if (latObj != null) {
                try { order.setGhnStationLatitude(Double.parseDouble(latObj.toString())); } catch (Exception ignored) {}
            }

            Object lngObj = ghnStationInfo.get("longitude");
            if (lngObj == null) lngObj = ghnStationInfo.get("lng");
            if (lngObj == null) lngObj = ghnStationInfo.get("long");
            if (lngObj instanceof Number) {
                order.setGhnStationLongitude(((Number) lngObj).doubleValue());
            } else if (lngObj != null) {
                try { order.setGhnStationLongitude(Double.parseDouble(lngObj.toString())); } catch (Exception ignored) {}
            }

        }

        // Fallback: nếu không lấy được station ID từ GHN Sandbox
        if (order.getGhnStationId() == null) {
            int distId = address.getDistrictId() != null ? address.getDistrictId() : 1442;
            order.setGhnStationId(10000 + distId);
            order.setGhnStationName("Bưu cục GHN - " + (address.getCity() != null ? address.getCity() : "TP. Hồ Chí Minh"));
            order.setGhnStationAddress("Bưu cục GHN " + (address.getAddress() != null ? address.getAddress() : "khu vực trung tâm"));
        }

        // Gán tọa độ trạm bằng tọa độ GPS khách hàng (Single Source of Truth, 0ms latency)
        if (order.getGhnStationLatitude() == null || order.getGhnStationLatitude() == 0.0
                || order.getGhnStationLongitude() == null || order.getGhnStationLongitude() == 0.0) {
            order.setGhnStationLatitude(customerLat);
            order.setGhnStationLongitude(customerLng);
        }

        Order savedOrder = orderRepository.save(order);

        // 9. Lưu danh sách OrderItem & Trừ tồn kho
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            BigDecimal itemPrice = cartItem.getVariant() != null && cartItem.getVariant().getPrice() != null
                    ? cartItem.getVariant().getPrice()
                    : cartItem.getProduct().getPrice();

            BigDecimal costPrice = cartItem.getVariant() != null ? cartItem.getVariant().getCostPrice() : BigDecimal.ZERO;

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .variant(cartItem.getVariant())
                    .quantity(cartItem.getQuantity())
                    .price(itemPrice)
                    .costPrice(costPrice)
                    .build();
            orderItems.add(orderItemRepository.save(orderItem));

            // Khấu trừ số lượng tồn kho sản phẩm (Cả Product lẫn ProductVariant)
            Product product = cartItem.getProduct();
            if (product != null) {
                Product lockedProduct = productRepository.findByIdForUpdate(product.getId())
                        .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.NOT_FOUND));
                int currentProductStock = lockedProduct.getStock() != null ? lockedProduct.getStock() : 0;
                if (currentProductStock < cartItem.getQuantity()) {
                    throw new AppException("Sản phẩm " + lockedProduct.getName() + " không đủ số lượng trong kho.", HttpStatus.BAD_REQUEST);
                }
                int newProductStock = currentProductStock - cartItem.getQuantity();
                lockedProduct.setStock(newProductStock);
                if (newProductStock == 0) {
                    lockedProduct.setStatus("out_of_stock");
                }
                productRepository.save(lockedProduct);
            }

            if (cartItem.getVariant() != null) {
                ProductVariant variant = cartItem.getVariant();
                ProductVariant lockedVariant = productVariantRepository.findByIdForUpdate(variant.getId())
                        .orElseThrow(() -> new AppException("Phân loại hàng không tồn tại", HttpStatus.NOT_FOUND));
                int currentVariantStock = lockedVariant.getStockQuantity() != null ? lockedVariant.getStockQuantity() : 0;
                if (currentVariantStock < cartItem.getQuantity()) {
                    throw new AppException("Phân loại hàng đã chọn của sản phẩm không đủ số lượng trong kho.", HttpStatus.BAD_REQUEST);
                }
                int newVariantStock = currentVariantStock - cartItem.getQuantity();
                lockedVariant.setStockQuantity(newVariantStock);
                inventoryAlertService.checkAndAlert(lockedVariant, currentVariantStock, newVariantStock);
                productVariantRepository.save(lockedVariant);
            }
        }

        // 9.5. Xóa sản phẩm đã được đặt khỏi giỏ hàng trong Database
        cartItemRepository.deleteAll(cartItems);

        // 9.6. Khóa lượt sử dụng Coupon ngay khi tạo đơn (để rollback đúng nếu thất bại)
        if (appliedCoupon != null) {
            int used = appliedCoupon.getUsedCount() != null ? appliedCoupon.getUsedCount() : 0;
            appliedCoupon.setUsedCount(used + 1);
            couponRepository.save(appliedCoupon);
        }

        // 10. Ghi vết Lịch sử Trạng thái Đơn hàng (OrderStatusHistory)
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status("pending")
                .note("Đơn hàng đã được khởi tạo thành công trên hệ thống AP Sports.")
                .changedBy(user)
                .build();
        orderStatusHistoryRepository.save(history);

        // 11. Xử lý Phương thức Thanh Toán
        boolean isVnPay = "VNPAY".equalsIgnoreCase(request.getPaymentMethod());
        Payment.PaymentMethod pMethod = isVnPay ? Payment.PaymentMethod.vnpay : Payment.PaymentMethod.cash;

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(pMethod)
                .vnpTxnRef(orderCode)
                .amount(finalAmount)
                .status(Payment.PaymentStatus.pending)
                .build();
        paymentRepository.save(payment);

        String paymentUrl = null;
        if (isVnPay) {
            paymentUrl = vnPayService.generatePaymentUrl(savedOrder, clientIp);
        } else {
            // Thanh toán COD: Gửi email xác nhận ngay
            emailService.sendOrderConfirmationEmail(
                    user.getEmail(),
                    user.getName() != null ? user.getName() : user.getEmail(),
                    orderCode,
                    finalAmount.toString(),
                    "Thanh toán khi nhận hàng (COD)"
            );
        }

        // Bắn event thông báo tới Admin và Staff
        eventPublisher.publishEvent(OrderPlacedEvent.builder()
                .orderId(savedOrder.getId())
                .orderCode(savedOrder.getOrderCode())
                .totalAmount(finalAmount)
                .senderId(user.getId())
                .build());

        return mapToOrderResponse(savedOrder, orderItems, payment, paymentUrl);
    }

    @Override
    @Transactional
    public OrderResponse processVNPayReturn(Map<String, String> queryParams) {
        String vnpTxnRef = queryParams.get("vnp_TxnRef");
        if (!vnPayService.verifyChecksum(queryParams)) {
            log.error("Cảnh báo: Chữ ký VNPay không hợp lệ! Dữ liệu có thể đã bị giả mạo. Mã đơn hàng (vnp_TxnRef): {}", vnpTxnRef);
            throw new AppException("Dữ liệu thanh toán không hợp lệ hoặc đã bị thay đổi (Invalid Checksum).", HttpStatus.BAD_REQUEST);
        }

        String vnpResponseCode = queryParams.get("vnp_ResponseCode");
        String vnpTransactionNo = queryParams.get("vnp_TransactionNo");

        if (vnpTxnRef == null || vnpTxnRef.isBlank()) {
            throw new AppException("Thiếu tham số mã đơn hàng vnp_TxnRef.", HttpStatus.BAD_REQUEST);
        }

        // Khóa bản ghi Order để chống race condition khi callback trùng hoặc gọi đồng thời
        Order lockedOrder = orderRepository.findByOrderCodeForUpdate(vnpTxnRef)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng mã " + vnpTxnRef, HttpStatus.NOT_FOUND));

        Payment payment = paymentRepository.findByOrderId(lockedOrder.getId())
                .orElseGet(() -> Payment.builder()
                        .order(lockedOrder)
                        .paymentMethod(Payment.PaymentMethod.vnpay)
                        .vnpTxnRef(vnpTxnRef)
                        .amount(lockedOrder.getFinalAmount())
                        .status(Payment.PaymentStatus.pending)
                        .build());

        // Kiểm tra phương thức thanh toán
        if (payment.getPaymentMethod() != Payment.PaymentMethod.vnpay) {
            throw new AppException("Phương thức thanh toán không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra TmnCode
        String vnpTmnCode = queryParams.get("vnp_TmnCode");
        if (vnpTmnCode == null || !vnpTmnCode.equals(vnPayConfig.getVnpTmnCode())) {
            log.error("Cảnh báo: vnp_TmnCode không khớp! Đơn hàng: {}. Mong đợi: {}, VNPay trả về: {}", vnpTxnRef, vnPayConfig.getVnpTmnCode(), vnpTmnCode);
            throw new AppException("Mã Merchant (vnp_TmnCode) không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        // Đối chiếu số tiền giao dịch (vnp_Amount) - bắt buộc
        String vnpAmountStr = queryParams.get("vnp_Amount");
        if (vnpAmountStr == null || vnpAmountStr.isBlank()) {
            throw new AppException("Thiếu tham số vnp_Amount từ VNPay.", HttpStatus.BAD_REQUEST);
        }
        try {
            long vnpAmount = Long.parseLong(vnpAmountStr);
            long expectedAmount = payment.getAmount().setScale(2, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).longValue();
            if (vnpAmount != expectedAmount) {
                log.error("Cảnh báo: Sai lệch số tiền thanh toán! Đơn hàng: {}. Mong đợi: {}, VNPay trả về: {}", vnpTxnRef, expectedAmount, vnpAmount);
                throw new AppException("Số tiền thanh toán không khớp với đơn hàng.", HttpStatus.BAD_REQUEST);
            }
        } catch (NumberFormatException e) {
            throw new AppException("Định dạng số tiền không hợp lệ từ VNPay.", HttpStatus.BAD_REQUEST);
        }

        // Idempotency check toàn cục: Sau khi đã xác minh chữ ký, mã bảo mật và số tiền, mới kiểm tra trạng thái
        // Nếu giao dịch đã thành công/hoàn tiền thì không xử lý các callback đến sau (tránh cập nhật nhiều lần)
        if (payment.getStatus() == Payment.PaymentStatus.completed || payment.getStatus() == Payment.PaymentStatus.refunded) {
            return mapToOrderResponse(lockedOrder, orderItemRepository.findByOrderId(lockedOrder.getId()), payment, null);
        }

        payment.setVnpResponseCode(vnpResponseCode);
        if (vnpTransactionNo != null) payment.setTransactionId(vnpTransactionNo);
        
        String vnpPayDate = queryParams.get("vnp_PayDate");
        if (vnpPayDate != null && !vnpPayDate.isBlank()) {
            payment.setVnpPayDate(vnpPayDate);
        }

        String vnpTransactionStatus = queryParams.get("vnp_TransactionStatus");
        String retryUrl = null;

        if ("00".equals(vnpResponseCode) && "00".equals(vnpTransactionStatus)) {
            // Thanh toán VNPay THÀNH CÔNG
            payment.setStatus(Payment.PaymentStatus.completed);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Kiểm tra trạng thái đơn hàng (đơn hàng bị hủy nhưng tiền vẫn được thu)
            if (lockedOrder.getStatus() == OrderStatus.cancelled || lockedOrder.getStatus() == OrderStatus.returned) {
                log.warn("Nhận được callback thành công nhưng đơn hàng {} đã bị hủy/trả hàng. Tiến hành hoàn tiền tự động.", lockedOrder.getOrderCode());
                try {
                    boolean refundResult = vnPayService.refundPayment(payment, lockedOrder, DEFAULT_CLIENT_IP, "SystemAuto");
                    if (refundResult) {
                        payment.setStatus(Payment.PaymentStatus.refunded);
                        paymentRepository.save(payment);
                        
                        OrderStatusHistory history = OrderStatusHistory.builder()
                                .order(lockedOrder)
                                .status(lockedOrder.getStatus().getValue())
                                .note("Nhận được tiền từ VNPay nhưng đơn hàng đã bị hủy. Hệ thống tự động hoàn tiền thành công.")
                                .changedBy(lockedOrder.getUser())
                                .build();
                        orderStatusHistoryRepository.save(history);
                    }
                } catch (Exception e) {
                    log.error("Hoàn tiền tự động thất bại cho đơn hàng {}: {}", lockedOrder.getOrderCode(), e.getMessage());
                    OrderStatusHistory history = OrderStatusHistory.builder()
                            .order(lockedOrder)
                            .status(lockedOrder.getStatus().getValue())
                            .note("Nhận được tiền từ VNPay nhưng đơn hàng đã bị hủy. Tự động hoàn tiền thất bại. Vui lòng đối soát thủ công: " + e.getMessage())
                            .changedBy(lockedOrder.getUser())
                            .build();
                    orderStatusHistoryRepository.save(history);
                }
                return mapToOrderResponse(lockedOrder, orderItemRepository.findByOrderId(lockedOrder.getId()), payment, null);
            }

            // Nếu đơn hàng đang ở trạng thái không cho phép xử lý thành công (ngoại trừ pending, payment_failed)
            if (lockedOrder.getStatus() != OrderStatus.pending && lockedOrder.getStatus() != OrderStatus.payment_failed) {
                log.warn("Callback VNPay thành công nhưng đơn hàng đang ở trạng thái {}. Mã đơn: {}", lockedOrder.getStatus(), vnpTxnRef);
                return mapToOrderResponse(lockedOrder, orderItemRepository.findByOrderId(lockedOrder.getId()), payment, null);
            }

            // Nếu đơn hàng đang là payment_failed thì trừ lại tồn kho (vì trước đó đã được hoàn kho khi thất bại)
            if (lockedOrder.getStatus() == OrderStatus.payment_failed) {
                orderInventoryService.reDeductOrderStock(lockedOrder);
            }
            lockedOrder.setStatus(OrderStatus.pending);
            orderRepository.save(lockedOrder);

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(lockedOrder)
                    .status(OrderStatus.pending.getValue())
                    .note("Thanh toán trực tuyến thành công qua cổng VNPay (Mã giao dịch VNPay: " + (vnpTransactionNo != null ? vnpTransactionNo : "") + "). Đơn hàng đang chờ Admin xác nhận.")
                    .changedBy(lockedOrder.getUser())
                    .build();
            orderStatusHistoryRepository.save(history);

            emailService.sendOrderConfirmationEmail(
                    lockedOrder.getUser().getEmail(),
                    lockedOrder.getUser().getName() != null ? lockedOrder.getUser().getName() : lockedOrder.getUser().getEmail(),
                    lockedOrder.getOrderCode(),
                    lockedOrder.getFinalAmount().toString(),
                    "Thanh toán trực tuyến qua VNPay"
            );
        } else {
            if (payment.getStatus() == Payment.PaymentStatus.failed) {
                return mapToOrderResponse(lockedOrder, orderItemRepository.findByOrderId(lockedOrder.getId()), payment, null);
            }
            
            // Nếu đơn hàng đang ở trạng thái không cho phép thất bại (ngoại trừ pending, payment_failed)
            if (lockedOrder.getStatus() != OrderStatus.pending && lockedOrder.getStatus() != OrderStatus.payment_failed) {
                log.warn("Callback VNPay thất bại nhưng đơn hàng đang ở trạng thái {}. Mã đơn: {}", lockedOrder.getStatus(), vnpTxnRef);
                return mapToOrderResponse(lockedOrder, orderItemRepository.findByOrderId(lockedOrder.getId()), payment, null);
            }

            // Thanh toán VNPay THẤT BẠI hoặc HỦY BỎ
            payment.setStatus(Payment.PaymentStatus.failed);
            paymentRepository.save(payment);

            lockedOrder.setStatus(OrderStatus.payment_failed);
            orderRepository.save(lockedOrder);
            
            // Tiến hành Hoàn lại Tồn kho và Giỏ hàng thông qua InventoryService (có cờ tránh lặp)
            orderInventoryService.releaseOrderResources(lockedOrder, true);

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(lockedOrder)
                    .status(OrderStatus.payment_failed.getValue())
                    .note("Thanh toán VNPay không thành công hoặc bị hủy bỏ (Mã lỗi VNPay: " + vnpResponseCode + "). Tồn kho đã được hoàn trả.")
                    .changedBy(lockedOrder.getUser())
                    .build();
            orderStatusHistoryRepository.save(history);

            // Tự động tạo URL thanh toán mới sẵn sàng cho nút "Thanh toán lại"
            try {
                retryUrl = vnPayService.generatePaymentUrl(lockedOrder, DEFAULT_CLIENT_IP);
            } catch (Exception e) {
                log.warn("Không thể sinh lại paymentUrl cho đơn hàng #{}: {}", lockedOrder.getOrderCode(), e.getMessage());
            }
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(lockedOrder.getId());
        return mapToOrderResponse(lockedOrder, items, payment, retryUrl);
    }

    @Override
    @Transactional
    public OrderResponse retryVNPayPayment(String email, String orderCode, String clientIp) {
        User user = getUserByEmail(email);
        Order lockedOrder = orderRepository.findByOrderCodeAndUserIdForUpdate(orderCode, user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng yêu cầu.", HttpStatus.NOT_FOUND));

        if (lockedOrder.getStatus() != OrderStatus.pending && lockedOrder.getStatus() != OrderStatus.payment_failed) {
            throw new AppException("Đơn hàng không ở trạng thái cho phép thanh toán lại.", HttpStatus.BAD_REQUEST);
        }

        Payment payment = paymentRepository.findByOrderId(lockedOrder.getId())
                .orElseGet(() -> Payment.builder()
                        .order(lockedOrder)
                        .paymentMethod(Payment.PaymentMethod.vnpay)
                        .vnpTxnRef(orderCode)
                        .amount(lockedOrder.getFinalAmount())
                        .status(Payment.PaymentStatus.pending)
                        .build());
                        
        if (payment.getPaymentMethod() != Payment.PaymentMethod.vnpay) {
            throw new AppException("Phương thức thanh toán của đơn hàng không phải là VNPay.", HttpStatus.BAD_REQUEST);
        }

        if (payment.getStatus() == Payment.PaymentStatus.completed || payment.getStatus() == Payment.PaymentStatus.refunded) {
            throw new AppException("Đơn hàng này đã được thanh toán hoặc hoàn tiền.", HttpStatus.BAD_REQUEST);
        }

        // Nếu đơn hàng đang bị payment_failed, tiến hành Trừ lại Tồn kho và chuyển về pending
        if (lockedOrder.getStatus() == OrderStatus.payment_failed) {
            orderInventoryService.reDeductOrderStock(lockedOrder);
            lockedOrder.setStatus(OrderStatus.pending);
            orderRepository.save(lockedOrder);
        }


        payment.setStatus(Payment.PaymentStatus.pending);
        paymentRepository.save(payment);

        String paymentUrl = vnPayService.generatePaymentUrl(lockedOrder, clientIp);
        List<OrderItem> items = orderItemRepository.findByOrderId(lockedOrder.getId());
        return mapToOrderResponse(lockedOrder, items, payment, paymentUrl);
    }



    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String email, String orderCode) {
        User user = getUserByEmail(email);
        Order order = orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng #" + orderCode, HttpStatus.NOT_FOUND));
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        return mapToOrderResponse(order, items, payment, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(String email, String status, String keyword, String sortBy, String sortDir, Pageable pageable) {
        User user = getUserByEmail(email);

        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), user.getId()));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim())) {
                OrderStatus orderStatus = OrderStatus.fromString(status.trim().toLowerCase());
                if (orderStatus != null) {
                    predicates.add(cb.equal(root.get("status"), orderStatus));
                }
            }

            if (keyword != null && !keyword.isBlank()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                Predicate pCode = cb.like(cb.lower(root.get("orderCode")), kw);
                Predicate pTrack = cb.like(cb.lower(root.get("trackingCode")), kw);
                predicates.add(cb.or(pCode, pTrack));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        Pageable customPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(direction, sortField));

        Page<Order> orders = orderRepository.findAll(spec, customPageable);
        return orders.map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
            return mapToOrderResponse(order, items, payment, null);
        });
    }

    @Override
    @Transactional
    public OrderResponse cancelMyOrder(String email, String orderCode, String reason) {
        User user = getUserByEmail(email);
        Order lockedOrder = orderRepository.findByOrderCodeAndUserIdForUpdate(orderCode, user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng #" + orderCode, HttpStatus.NOT_FOUND));

        // Khách hàng chỉ được phép hủy đơn khi đơn CHƯA bàn giao bưu cục GHN (pending, confirmed, processing)
        if (lockedOrder.getStatus() == OrderStatus.shipped || lockedOrder.getStatus() == OrderStatus.shipping || lockedOrder.getStatus() == OrderStatus.delivered) {
            throw new AppException("Đơn hàng đã bàn giao bưu cục GHN / đang vận chuyển, không thể hủy bỏ!", HttpStatus.BAD_REQUEST);
        }
        if (lockedOrder.getStatus() == OrderStatus.cancelled) {
            throw new AppException("Đơn hàng này đã bị hủy từ trước.", HttpStatus.BAD_REQUEST);
        }

        lockedOrder.setStatus(OrderStatus.cancelled);
        Order savedOrder = orderRepository.save(lockedOrder);

        // Hoàn lại tồn kho sản phẩm (Không khôi phục giỏ hàng khi khách chủ động hủy)
        orderInventoryService.releaseOrderResources(savedOrder, false);

        // Cập nhật trạng thái thanh toán
        paymentRepository.findByOrderId(savedOrder.getId()).ifPresent(payment -> {
            if (payment.getStatus() == Payment.PaymentStatus.completed) {
                if (payment.getPaymentMethod() == Payment.PaymentMethod.vnpay) {
                    try {
                        boolean refundResult = vnPayService.refundPayment(payment, savedOrder, DEFAULT_CLIENT_IP, user.getEmail());
                        if (refundResult) {
                            payment.setStatus(Payment.PaymentStatus.refunded);
                        }
                    } catch (Exception e) {
                        log.error("Lỗi hoàn tiền tự động khi khách hủy đơn {}: {}", savedOrder.getOrderCode(), e.getMessage());
                        OrderStatusHistory history = OrderStatusHistory.builder()
                                .order(savedOrder)
                                .status(OrderStatus.cancelled.getValue())
                                .note("Lỗi hoàn tiền tự động VNPay: " + e.getMessage() + ". Cần đối soát thủ công.")
                                .changedBy(user)
                                .build();
                        orderStatusHistoryRepository.save(history);
                    }
                } else {
                    log.warn("Đơn hàng {} có thanh toán (không phải VNPay) đã completed nhưng bị hủy. Chờ xử lý hoàn tiền/đối soát thủ công.", savedOrder.getOrderCode());
                    // Không đổi sang refunded vì COD/Tiền mặt chưa được hoàn tự động
                }
            } else if (payment.getStatus() == Payment.PaymentStatus.pending) {
                payment.setStatus(Payment.PaymentStatus.failed);
            }
            paymentRepository.save(payment);
        });

        // Ghi vết lịch sử
        String noteMsg = "Khách hàng hủy đơn hàng. " + (reason != null && !reason.isBlank() ? "Lý do: " + reason : "");
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status("cancelled")
                .note(noteMsg)
                .changedBy(user)
                .build();
        orderStatusHistoryRepository.save(history);

        List<OrderItem> items = orderItemRepository.findByOrderId(savedOrder.getId());
        Payment payment = paymentRepository.findByOrderId(savedOrder.getId()).orElse(null);

        // Bắn Event
        eventPublisher.publishEvent(OrderCancelledByCustomerEvent.builder()
                .orderId(savedOrder.getId())
                .orderCode(savedOrder.getOrderCode())
                .customerId(user.getId())
                .build());

        return mapToOrderResponse(savedOrder, items, payment, null);
    }

    @Override
    @Transactional
    public OrderResponse returnMyOrder(String email, String orderCode, String reason) {
        User user = getUserByEmail(email);
        Order order = orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng #" + orderCode, HttpStatus.NOT_FOUND));

        // Khách hàng chỉ được phép gửi yêu cầu trả hàng khi đơn ĐÃ GIAO THÀNH CÔNG (delivered)
        if (order.getStatus() != OrderStatus.delivered) {
            throw new AppException("Chỉ đơn hàng đã giao thành công mới có thể gửi yêu cầu trả hàng!", HttpStatus.BAD_REQUEST);
        }

        order.setStatus(OrderStatus.returned);
        Order savedOrder = orderRepository.save(order);

        // Ghi vết lịch sử
        String noteMsg = "Khách hàng gửi yêu cầu Trả Hàng / Hoàn Tiền. " + (reason != null && !reason.isBlank() ? "Lý do: " + reason : "");
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status("returned")
                .note(noteMsg)
                .changedBy(user)
                .build();
        orderStatusHistoryRepository.save(history);

        List<OrderItem> items = orderItemRepository.findByOrderId(savedOrder.getId());
        Payment payment = paymentRepository.findByOrderId(savedOrder.getId()).orElse(null);

        // Bắn Event
        eventPublisher.publishEvent(OrderCancelledByCustomerEvent.builder()
                .orderId(savedOrder.getId())
                .orderCode(savedOrder.getOrderCode())
                .customerId(user.getId())
                .build());

        return mapToOrderResponse(savedOrder, items, payment, null);
    }

    @Override
    @Transactional
    public OrderResponse completeMyOrder(String email, String orderCode) {
        User user = getUserByEmail(email);
        Order lockedOrder = orderRepository.findByOrderCodeAndUserIdForUpdate(orderCode, user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng #" + orderCode, HttpStatus.NOT_FOUND));

        if (lockedOrder.getStatus() == OrderStatus.completed) {
            List<OrderItem> items = orderItemRepository.findByOrderId(lockedOrder.getId());
            Payment payment = paymentRepository.findByOrderId(lockedOrder.getId()).orElse(null);
            return mapToOrderResponse(lockedOrder, items, payment, null);
        }

        // Khách hàng chỉ được phép xác nhận đã nhận hàng khi đơn hàng ĐÃ GIAO THÀNH CÔNG (delivered)
        if (lockedOrder.getStatus() != OrderStatus.delivered) {
            throw new AppException("Chỉ đơn hàng ở trạng thái [Đã Giao - delivered] mới có thể xác nhận đã nhận hàng!", HttpStatus.BAD_REQUEST);
        }

        lockedOrder.setStatus(OrderStatus.completed);
        Order savedOrder = orderRepository.save(lockedOrder);

        // Ghi vết lịch sử chuyển đổi trạng thái
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.completed.getValue())
                .note("Khách hàng [" + user.getName() + "] xác nhận đã nhận được hàng và hài lòng với sản phẩm.")
                .changedBy(user)
                .build();
        orderStatusHistoryRepository.save(history);

        log.info("Khách hàng [{}] đã xác nhận nhận hàng và hoàn tất đơn hàng #{}", user.getEmail(), savedOrder.getOrderCode());

        List<OrderItem> items = orderItemRepository.findByOrderId(savedOrder.getId());
        Payment payment = paymentRepository.findByOrderId(savedOrder.getId()).orElse(null);

        return mapToOrderResponse(savedOrder, items, payment, null);
    }




    /**
     * Tính phí giao hàng GHN từ Kho AP Sports ĐHCT (Ninh Kiều, Cần Thơ - districtId=1442, wardCode="21211")
     * đến Quận/Huyện và Phường/Xã khách hàng.
     */
    @SuppressWarnings("rawtypes")
    private BigDecimal calculateGhnShippingFee(Integer toDistrictId, String toWardCode, Integer totalWeight, BigDecimal orderSubtotal) {
        if (toDistrictId == null || ghnToken == null || ghnToken.isBlank()) {
            return null;
        }
        try {
            String base = (ghnApiUrl != null && !ghnApiUrl.isBlank()) ? ghnApiUrl.trim() : "https://online-gateway.ghn.vn/shiip/public-api/v2";
            if (!base.endsWith("/")) base = base + "/";
            String url = base + "shipping-order/fee";

            org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                    new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(4000);
            factory.setReadTimeout(5000);
            RestTemplate restTemplate = new RestTemplate(factory);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnToken);
            if (ghnShopId != null && !ghnShopId.isBlank()) {
                headers.set("ShopId", ghnShopId);
            }
            headers.setContentType(MediaType.APPLICATION_JSON);

            int finalWeight = (totalWeight != null && totalWeight > 0) ? totalWeight : 500;
            int boxLength = finalWeight > 3000 ? 30 : (finalWeight > 1000 ? 20 : 15);
            int boxWidth = finalWeight > 3000 ? 20 : (finalWeight > 1000 ? 15 : 10);
            int boxHeight = finalWeight > 3000 ? 15 : 10;

            // 1. Tra cứu Dịch vụ Vận chuyển (available-services) khả dụng cho tuyến đường từ kho tới toDistrictId
            Integer matchedServiceId = null;
            Integer matchedServiceTypeId = 2; // Default Chuẩn GHN Express
            try {
                String availUrl = base + "shipping-order/available-services";
                Map<String, Object> availBody = new HashMap<>();
                if (ghnShopId != null && !ghnShopId.isBlank()) {
                    try { availBody.put("shop_id", Integer.parseInt(ghnShopId.trim())); } catch (Exception ignored) {}
                }
                availBody.put("from_district", StoreLocationConstants.STORE_DISTRICT_ID);
                availBody.put("to_district", toDistrictId);

                HttpEntity<Map<String, Object>> availEntity = new HttpEntity<>(availBody, headers);
                ResponseEntity<Map> availResp = restTemplate.exchange(availUrl, HttpMethod.POST, availEntity, Map.class);
                if (availResp.getStatusCode().is2xxSuccessful() && availResp.getBody() != null) {
                    Object availData = availResp.getBody().get("data");
                    if (availData instanceof List && !((List<?>) availData).isEmpty()) {
                        for (Object sObj : (List<?>) availData) {
                            if (sObj instanceof Map) {
                                Map<?, ?> sMap = (Map<?, ?>) sObj;
                                Object typeId = sMap.get("service_type_id");
                                Object servId = sMap.get("service_id");
                                if (typeId instanceof Number && ((Number) typeId).intValue() == 2 && servId instanceof Number) {
                                    matchedServiceId = ((Number) servId).intValue();
                                    matchedServiceTypeId = 2;
                                    break;
                                }
                            }
                        }
                        if (matchedServiceId == null) {
                            Map<?, ?> firstMap = (Map<?, ?>) ((List<?>) availData).get(0);
                            if (firstMap.get("service_id") instanceof Number) {
                                matchedServiceId = ((Number) firstMap.get("service_id")).intValue();
                            }
                            if (firstMap.get("service_type_id") instanceof Number) {
                                matchedServiceTypeId = ((Number) firstMap.get("service_type_id")).intValue();
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("[GHN Fee] Không tra cứu được available-services: {}", e.getMessage());
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from_district_id", StoreLocationConstants.STORE_DISTRICT_ID); // Kho chính AP Sports - ĐHCT, Ninh Kiều, Cần Thơ
            requestBody.put("from_ward_code", StoreLocationConstants.STORE_WARD_CODE); // Phường Xuân Khánh, Ninh Kiều, Cần Thơ
            if (matchedServiceId != null) {
                requestBody.put("service_id", matchedServiceId);
            }
            requestBody.put("service_type_id", matchedServiceTypeId);
            requestBody.put("to_district_id", toDistrictId);
            if (toWardCode != null && !toWardCode.isBlank()) {
                requestBody.put("to_ward_code", toWardCode.trim());
            }
            requestBody.put("height", boxHeight);
            requestBody.put("length", boxLength);
            requestBody.put("weight", finalWeight);
            requestBody.put("width", boxWidth);

            if (orderSubtotal != null && orderSubtotal.compareTo(BigDecimal.ZERO) > 0) {
                int insuranceVal = Math.min(orderSubtotal.intValue(), 5000000);
                requestBody.put("insurance_value", insuranceVal);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data instanceof Map) {
                    Object totalObj = ((Map) data).get("total");
                    if (totalObj instanceof Number) {
                        BigDecimal fee = BigDecimal.valueOf(((Number) totalObj).longValue());
                        log.info("[GHN Fee] ✅ GHN trả về phí giao hàng thành công: {} VNĐ (tới districtId={}, weight={}g)", fee, toDistrictId, finalWeight);
                        return fee;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[GHN Fee] Không tính được phí giao hàng động từ GHN (districtId={}): {}", toDistrictId, e.getMessage());
        }
        return null;
    }



    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("Không tìm thấy thông tin tài khoản người dùng.", HttpStatus.NOT_FOUND));
    }

    private OrderResponse mapToOrderResponse(Order order, List<OrderItem> items, Payment payment, String paymentUrl) {
        ShippingAddressResponse addressResp = null;
        if (order.getShippingAddress() != null) {
            ShippingAddress addr = order.getShippingAddress();
            addressResp = ShippingAddressResponse.builder()
                    .id(addr.getId())
                    .fullName(addr.getFullName())
                    .phone(addr.getPhone())
                    .address(addr.getAddress())
                    .city(addr.getCity())
                    .provinceId(addr.getProvinceId())
                    .districtId(addr.getDistrictId())
                    .wardCode(addr.getWardCode())
                    .latitude(addr.getLatitude())
                    .longitude(addr.getLongitude())
                    .isDefault(addr.isDefault())
                    .createdAt(addr.getCreatedAt())
                    .updatedAt(addr.getUpdatedAt())
                    .build();
        }

        List<Long> itemIds = (items != null ? items : Collections.<OrderItem>emptyList()).stream()
                .map(OrderItem::getId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
        Set<Long> reviewedItemIds = itemIds.isEmpty() ? Collections.emptySet()
                : new HashSet<>(reviewRepository.findReviewedOrderItemIds(itemIds));

        List<OrderItemResponse> itemResps = (items != null ? items : Collections.<OrderItem>emptyList()).stream().map(item -> {
            String img = null;
            if (item.getProduct() != null) {
                List<ProductImage> pImages = productImageRepository.findByProductId(item.getProduct().getId());
                img = pImages.stream()
                        .filter(ProductImage::isPrimary)
                        .map(ProductImage::getImagePath)
                        .findFirst()
                        .orElseGet(() -> pImages.isEmpty() ? null : pImages.get(0).getImagePath());
            }

            return OrderItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getId())
                    .productName(item.getProduct().getName())
                    .productSlug(item.getProduct().getSlug())
                    .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                    .sku(item.getVariant() != null ? item.getVariant().getSku() : null)
                    .barcode(item.getVariant() != null ? (item.getVariant().getBarcode() != null ? item.getVariant().getBarcode() : item.getVariant().getSku()) : null)
                    .color(item.getVariant() != null ? item.getVariant().getColor() : null)
                    .size(item.getVariant() != null ? item.getVariant().getSize() : null)
                    .attributes(item.getVariant() != null ? item.getVariant().getAttributes() : null)
                    .variantSummary(item.getVariant() != null
                            ? com.web.ap_sports.util.VariantAttributeUtil.buildSummary(
                                    item.getVariant().getAttributes(),
                                    item.getVariant().getColor(),
                                    item.getVariant().getSize(),
                                    item.getVariant().getSku())
                            : null)
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .image(img)
                    .isReviewed(item.getId() != null && reviewedItemIds.contains(item.getId()))
                    .build();
        }).collect(Collectors.toList());

        String pMethod = payment != null && payment.getPaymentMethod() != null
                ? payment.getPaymentMethod().name().toUpperCase()
                : "COD";

        String pStatus = payment != null && payment.getStatus() != null
                ? payment.getStatus().name().toLowerCase()
                : "pending";

        String staffName = order.getProcessedByStaff() != null ? order.getProcessedByStaff().getName() : null;
        String shipperName = null;
        String shipperPhone = null;
        if (order.getAssignedShipper() != null) {
            shipperName = order.getAssignedShipper().getName();
            shipperPhone = order.getAssignedShipper().getPhoneNumber();
        }

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .totalPrice(order.getTotalPrice())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus() != null ? order.getStatus().getValue() : OrderStatus.pending.getValue())
                .paymentMethod(pMethod)
                .paymentStatus(pStatus)
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .couponName(order.getCoupon() != null ? order.getCoupon().getName() : null)
                .paymentUrl(paymentUrl)
                .shippingAddress(addressResp)
                .trackingCode(order.getTrackingCode())
                .shippingProvider(order.getShippingProvider())
                .gpsLatitude(order.getGpsLatitude())
                .gpsLongitude(order.getGpsLongitude())
                .ghnStationId(order.getGhnStationId())
                .ghnStationName(order.getGhnStationName())
                .ghnStationAddress(order.getGhnStationAddress())
                .ghnStationLatitude(order.getGhnStationLatitude())
                .ghnStationLongitude(order.getGhnStationLongitude())
                .staffName(staffName)
                .shipperName(shipperName)
                .shipperPhone(shipperPhone)
                .note(order.getNote())
                .packVerified(Boolean.TRUE.equals(order.getPackVerified()))
                .items(itemResps)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
