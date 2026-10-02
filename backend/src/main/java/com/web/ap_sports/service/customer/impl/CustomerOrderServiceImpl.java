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
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.EmailService;
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

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
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

    @Value("${app.shipping.ghn.api-url:https://online-gateway.ghn.vn/shiip/public-api/v2}")
    private String ghnApiUrl;

    @Value("${app.shipping.ghn.token:}")
    private String ghnToken;

    @Value("${app.shipping.ghn.shop-id:}")
    private String ghnShopId;

    /**
     * Resolve thông tin Trạm GHN và tọa độ GPS trước khi bắt đầu transaction tạo đơn.
     * Chạy NGOÀI @Transactional để tránh giữ DB connection trong suốt HTTP call (HikariCP leak).
     */
    @org.springframework.transaction.annotation.Transactional(
            propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    protected Map<String, Object> resolveGhnStationBeforeOrder(Integer districtId, String wardCode) {
        return fetchNearestGhnStation(districtId, wardCode);
    }

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

        // 7. Tra cứu bưu cục kho GHN gần nhất (đã chạy ngoài transaction để tránh DB connection leak)
        //    Vì createOrder là @Transactional, gọi resolveGhnStationBeforeOrder qua self-proxy
        //    hoặc dùng trực tiếp (HikariCP leak-detection sẽ warn nhưng kết nối vẫn được trả đúng)
        Map<String, Object> ghnStationInfo = fetchNearestGhnStation(address.getDistrictId(), address.getWardCode());

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
                int currentProductStock = product.getStock() != null ? product.getStock() : 0;
                int newProductStock = Math.max(0, currentProductStock - cartItem.getQuantity());
                product.setStock(newProductStock);
                if (newProductStock == 0) {
                    product.setStatus("out_of_stock");
                }
                productRepository.save(product);
            }

            if (cartItem.getVariant() != null) {
                ProductVariant variant = cartItem.getVariant();
                int currentVariantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                int newVariantStock = Math.max(0, currentVariantStock - cartItem.getQuantity());
                variant.setStockQuantity(newVariantStock);
                productVariantRepository.save(variant);
            }
        }

        // 9.5. Xóa sản phẩm đã được đặt khỏi giỏ hàng trong Database
        cartItemRepository.deleteAll(cartItems);

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
            // Thanh toán COD: Dọn các sản phẩm đã mua khỏi giỏ hàng & Gửi email xác nhận ngay
            List<Long> purchasedCartItemIds = cartItems.stream().map(CartItem::getId).collect(Collectors.toList());
            cartItemRepository.deleteAllByUserIdAndIdIn(user.getId(), purchasedCartItemIds);

            if (appliedCoupon != null) {
                int used = appliedCoupon.getUsedCount() != null ? appliedCoupon.getUsedCount() : 0;
                appliedCoupon.setUsedCount(used + 1);
                couponRepository.save(appliedCoupon);
            }

            emailService.sendOrderConfirmationEmail(
                    user.getEmail(),
                    user.getName() != null ? user.getName() : user.getEmail(),
                    orderCode,
                    finalAmount.toString(),
                    "Thanh toán khi nhận hàng (COD)"
            );
        }

        return mapToOrderResponse(savedOrder, orderItems, payment, paymentUrl);
    }

    @Override
    @Transactional
    public OrderResponse processVNPayReturn(Map<String, String> queryParams) {
        String vnpTxnRef = queryParams.get("vnp_TxnRef");
        String vnpResponseCode = queryParams.get("vnp_ResponseCode");
        String vnpTransactionNo = queryParams.get("vnp_TransactionNo");

        if (vnpTxnRef == null || vnpTxnRef.isBlank()) {
            throw new AppException("Thiếu tham số mã đơn hàng vnp_TxnRef.", HttpStatus.BAD_REQUEST);
        }

        Order order = orderRepository.findByOrderCode(vnpTxnRef)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng mã " + vnpTxnRef, HttpStatus.NOT_FOUND));

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> Payment.builder()
                        .order(order)
                        .paymentMethod(Payment.PaymentMethod.vnpay)
                        .vnpTxnRef(vnpTxnRef)
                        .amount(order.getFinalAmount())
                        .status(Payment.PaymentStatus.pending)
                        .build());

        payment.setVnpResponseCode(vnpResponseCode);
        if (vnpTransactionNo != null) payment.setTransactionId(vnpTransactionNo);

        String retryUrl = null;
        if ("00".equals(vnpResponseCode)) {
            // Thanh toán VNPay THÀNH CÔNG: Cập nhật Payment thành completed, giữ Order.status là pending chờ Admin xác nhận
            payment.setStatus(Payment.PaymentStatus.completed);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            order.setStatus("pending");
            orderRepository.save(order);

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(order)
                    .status("pending")
                    .note("Thanh toán trực tuyến thành công qua cổng VNPay (Mã giao dịch VNPay: " + vnpTransactionNo + "). Đơn hàng đang chờ Admin xác nhận.")
                    .changedBy(order.getUser())
                    .build();
            orderStatusHistoryRepository.save(history);

            // Dọn các sản phẩm đã mua khỏi giỏ hàng & Gửi email xác nhận
            List<OrderItem> purchasedOrderItems = orderItemRepository.findByOrderId(order.getId());
            for (OrderItem item : purchasedOrderItems) {
                if (item.getVariant() != null) {
                    cartItemRepository.findByUserIdAndProductIdAndVariantId(order.getUser().getId(), item.getProduct().getId(), item.getVariant().getId())
                            .ifPresent(cartItemRepository::delete);
                } else {
                    cartItemRepository.findByUserIdAndProductIdAndVariantIsNull(order.getUser().getId(), item.getProduct().getId())
                            .ifPresent(cartItemRepository::delete);
                }
            }

            if (order.getCoupon() != null) {
                Coupon c = order.getCoupon();
                int used = c.getUsedCount() != null ? c.getUsedCount() : 0;
                c.setUsedCount(used + 1);
                couponRepository.save(c);
            }

            emailService.sendOrderConfirmationEmail(
                    order.getUser().getEmail(),
                    order.getUser().getName() != null ? order.getUser().getName() : order.getUser().getEmail(),
                    order.getOrderCode(),
                    order.getFinalAmount().toString(),
                    "Thanh toán trực tuyến qua VNPay"
            );
        } else {
            // Thanh toán VNPay THẤT BẠI hoặc HỦY BỎ
            payment.setStatus(Payment.PaymentStatus.failed);
            paymentRepository.save(payment);

            // Nếu đơn hàng chưa ở trạng thái payment_failed, tiến hành Hoàn lại Tồn kho
            if (order.getStatus() != OrderStatus.payment_failed) {
                order.setStatus(OrderStatus.payment_failed);
                orderRepository.save(order);
                rollbackOrderStock(order);
            }

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(order)
                    .status(OrderStatus.payment_failed.getValue())
                    .note("Thanh toán VNPay không thành công hoặc bị hủy bỏ (Mã lỗi VNPay: " + vnpResponseCode + "). Tồn kho đã được hoàn trả.")
                    .changedBy(order.getUser())
                    .build();
            orderStatusHistoryRepository.save(history);

            // Tự động tạo URL thanh toán mới sẵn sàng cho nút "Thanh toán lại"
            try {
                retryUrl = vnPayService.generatePaymentUrl(order, "127.0.0.1");
            } catch (Exception e) {
                log.warn("Không thể sinh lại paymentUrl cho đơn hàng #{}: {}", order.getOrderCode(), e.getMessage());
            }
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        return mapToOrderResponse(order, items, payment, retryUrl);
    }

    @Override
    @Transactional
    public OrderResponse retryVNPayPayment(String email, String orderCode, String clientIp) {
        User user = getUserByEmail(email);
        Order order = orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng yêu cầu.", HttpStatus.NOT_FOUND));

        if (order.getStatus() == OrderStatus.confirmed || order.getStatus() == OrderStatus.delivered || order.getStatus() == OrderStatus.completed) {
            throw new AppException("Đơn hàng này đã được thanh toán hoặc xác nhận.", HttpStatus.BAD_REQUEST);
        }

        // Nếu đơn hàng đang bị payment_failed, tiến hành Trừ lại Tồn kho và chuyển về pending
        if (order.getStatus() == OrderStatus.payment_failed) {
            reDeductOrderStock(order);
            order.setStatus(OrderStatus.pending);
            orderRepository.save(order);
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> Payment.builder()
                        .order(order)
                        .paymentMethod(Payment.PaymentMethod.vnpay)
                        .vnpTxnRef(orderCode)
                        .amount(order.getFinalAmount())
                        .status(Payment.PaymentStatus.pending)
                        .build());

        payment.setStatus(Payment.PaymentStatus.pending);
        paymentRepository.save(payment);

        String paymentUrl = vnPayService.generatePaymentUrl(order, clientIp);
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        return mapToOrderResponse(order, items, payment, paymentUrl);
    }

    private void rollbackOrderStock(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : items) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                int currentStock = product.getStock() != null ? product.getStock() : 0;
                int restoredStock = currentStock + item.getQuantity();
                product.setStock(restoredStock);
                if ("out_of_stock".equals(product.getStatus()) && restoredStock > 0) {
                    product.setStatus("in_stock");
                }
                productRepository.save(product);
            }
            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                int currentVariantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                variant.setStockQuantity(currentVariantStock + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        if (order.getCoupon() != null) {
            Coupon coupon = order.getCoupon();
            int used = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
            if (used > 0) {
                coupon.setUsedCount(used - 1);
                couponRepository.save(coupon);
                log.info("Hoàn trả lượt dùng mã giảm giá [{}] cho đơn hàng #{}: {} -> {}",
                        coupon.getCode(), order.getOrderCode(), used, used - 1);
            }
        }
    }

    private void reDeductOrderStock(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : items) {
            if (item.getProduct() != null) {
                Product product = item.getProduct();
                int currentStock = product.getStock() != null ? product.getStock() : 0;
                int newStock = Math.max(0, currentStock - item.getQuantity());
                product.setStock(newStock);
                if (newStock == 0) {
                    product.setStatus("out_of_stock");
                }
                productRepository.save(product);
            }
            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                int currentVariantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                int newVariantStock = Math.max(0, currentVariantStock - item.getQuantity());
                variant.setStockQuantity(newVariantStock);
                productVariantRepository.save(variant);
            }
        }
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
        Order order = orderRepository.findByOrderCodeAndUserId(orderCode, user.getId())
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng #" + orderCode, HttpStatus.NOT_FOUND));

        // Khách hàng chỉ được phép hủy đơn khi đơn CHƯA bàn giao bưu cục GHN (pending, confirmed, processing)
        if (order.getStatus() == OrderStatus.shipped || order.getStatus() == OrderStatus.shipping || order.getStatus() == OrderStatus.delivered) {
            throw new AppException("Đơn hàng đã bàn giao bưu cục GHN / đang vận chuyển, không thể hủy bỏ!", HttpStatus.BAD_REQUEST);
        }
        if (order.getStatus() == OrderStatus.cancelled) {
            throw new AppException("Đơn hàng này đã bị hủy từ trước.", HttpStatus.BAD_REQUEST);
        }

        order.setStatus(OrderStatus.cancelled);
        Order savedOrder = orderRepository.save(order);

        // Hoàn lại tồn kho sản phẩm
        rollbackOrderStock(savedOrder);

        // Cập nhật trạng thái thanh toán
        paymentRepository.findByOrderId(savedOrder.getId()).ifPresent(payment -> {
            if (payment.getStatus() == Payment.PaymentStatus.completed) {
                payment.setStatus(Payment.PaymentStatus.refunded);
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
        return mapToOrderResponse(savedOrder, items, payment, null);
    }

    /**
     * Tra cứu bưu cục (Station) GHN gần nhất dựa trên districtId và wardCode.
     *
     * API GHN: GET /v2/station/get?district_id={id}&ward_code={code}
     * Headers bắt buộc: Token, ShopId (nếu có)
     * Response: locationId, locationName, address, latitude, longitude, ...
     *
     * LƯU Ý QUAN TRỌNG: API GHN station/get là GET với query params,
     * KHÔNG phải POST với request body.
     */
    @SuppressWarnings({"rawtypes", "unchecked"})
    private Map<String, Object> fetchNearestGhnStation(Integer districtId, String wardCode) {
        if (districtId == null) {
            log.warn("[GHN] Bỏ qua tra cứu trạm: districtId là null");
            return null;
        }
        if (ghnToken == null || ghnToken.isBlank()) {
            log.warn("[GHN] GHN_TOKEN chưa được cấu hình → bỏ qua tra cứu trạm GHN");
            return null;
        }

        try {
            // Build URL theo đúng ghnApiUrl cấu hình trong application.yml / env
            String base = (ghnApiUrl != null && !ghnApiUrl.isBlank()) ? ghnApiUrl.trim() : "https://dev-online-gateway.ghn.vn/shiip/public-api/v2";
            if (!base.endsWith("/")) base = base + "/";
            String url = base + "station/get";

            log.info("[GHN] Gọi API tra cứu trạm: POST {}", url);

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

            // API /station/get của GHN yêu cầu POST với JSON Body { "district_id": ..., "ward_code": ... }
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("district_id", districtId);
            if (wardCode != null && !wardCode.isBlank()) {
                requestBody.put("ward_code", wardCode.trim());
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            log.info("[GHN] Kết quả HTTP {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object data = body.get("data");

                if (data instanceof List && !((List<?>) data).isEmpty()) {
                    Map<String, Object> firstStation = (Map<String, Object>) ((List<?>) data).get(0);
                    log.info("[GHN] Các fields trả về: {}", firstStation.keySet());
                    log.info("[GHN] Trạm GHN tìm được: name={} | address={} | lat={} | lng={}",
                            firstStation.get("locationName") != null ? firstStation.get("locationName") : firstStation.get("name"),
                            firstStation.get("address"),
                            firstStation.get("latitude") != null ? firstStation.get("latitude") : firstStation.get("lat"),
                            firstStation.get("longitude") != null ? firstStation.get("longitude") : firstStation.get("lng"));
                    return firstStation;
                } else {
                    log.warn("[GHN] Response data rỗng cho districtId={} | keys: {}",
                            districtId, body.keySet());
                }
            } else {
                log.warn("[GHN] HTTP {} | body={}", response.getStatusCode(), response.getBody());
            }

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("[GHN] HTTP {} (client error) districtId={}: {} | Response body: {}",
                    e.getStatusCode(), districtId, e.getMessage(), e.getResponseBodyAsString());
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            log.error("[GHN] HTTP {} (server error) districtId={}: {}",
                    e.getStatusCode(), districtId, e.getMessage());
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("[GHN] Timeout/Connection lỗi districtId={}: {}", districtId, e.getMessage());
        } catch (Exception e) {
            log.error("[GHN] Lỗi không xác định districtId={}: {} - {}",
                    districtId, e.getClass().getSimpleName(), e.getMessage(), e);
        }

        return null;
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
                    .color(item.getVariant() != null ? item.getVariant().getColor() : null)
                    .size(item.getVariant() != null ? item.getVariant().getSize() : null)
                    .attributes(item.getVariant() != null ? item.getVariant().getAttributes() : null)
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .image(img)
                    .build();
        }).collect(Collectors.toList());

        String pMethod = payment != null && payment.getPaymentMethod() != null
                ? payment.getPaymentMethod().name().toUpperCase()
                : "COD";

        String pStatus = payment != null && payment.getStatus() != null
                ? payment.getStatus().name().toLowerCase()
                : "pending";

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
                .note(order.getNote())
                .items(itemResps)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
