package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.config.VNPayConfig;
import com.web.ap_sports.dto.request.customer.CreateOrderRequest;
import com.web.ap_sports.dto.response.customer.OrderItemResponse;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.EmailService;
import com.web.ap_sports.service.common.VNPayService;
import com.web.ap_sports.service.customer.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

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
            cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        if (cartItems.isEmpty()) {
            throw new AppException("Vui lòng chọn ít nhất 1 sản phẩm từ giỏ hàng để tạo đơn hàng.", HttpStatus.BAD_REQUEST);
        }

        // 2. Kiểm tra Địa chỉ giao hàng
        ShippingAddress address = shippingAddressRepository.findByIdAndUserId(request.getShippingAddressId(), user.getId())
                .orElseThrow(() -> new AppException("Địa chỉ giao hàng không hợp lệ.", HttpStatus.NOT_FOUND));

        // 3. Phí giao hàng mặc định/tính toán (30.000đ)
        BigDecimal shippingFee = BigDecimal.valueOf(30000);

        // 4. Tính tổng tiền các sản phẩm được chọn trong giỏ hàng
        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            BigDecimal price = item.getVariant() != null && item.getVariant().getPrice() != null
                    ? item.getVariant().getPrice()
                    : item.getProduct().getPrice();
            totalPrice = totalPrice.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

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
                        user.getId(), coupon.getId(), List.of("cancelled", "payment_failed")
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

        // 7. Tra cứu bưu cục kho GHN gần nhất dựa trên districtId & wardCode
        Map<String, Object> ghnStationInfo = fetchNearestGhnStation(address.getDistrictId(), address.getWardCode());

        // 8. Tạo Entity Order
        Order order = Order.builder()
                .orderCode(orderCode)
                .user(user)
                .totalPrice(totalPrice)
                .shippingFee(shippingFee)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status("pending")
                .shippingAddress(address)
                .shippingProvider("GHN")
                .trackingCode(trackingCode)
                .gpsLatitude(address.getLatitude() != null ? address.getLatitude() : 10.7769)
                .gpsLongitude(address.getLongitude() != null ? address.getLongitude() : 106.7009)
                .coupon(appliedCoupon)
                .note(request.getNote())
                .build();

        if (ghnStationInfo != null) {
            // Station ID (locationId hoặc station_id)
            Object stationIdObj = ghnStationInfo.get("locationId");
            if (stationIdObj == null) stationIdObj = ghnStationInfo.get("station_id");
            if (stationIdObj == null) stationIdObj = ghnStationInfo.get("id");
            if (stationIdObj instanceof Number) {
                order.setGhnStationId(((Number) stationIdObj).intValue());
            } else if (stationIdObj != null) {
                try { order.setGhnStationId(Integer.parseInt(stationIdObj.toString())); } catch (Exception ignored) {}
            }

            // Station Name (locationName hoặc name)
            Object nameObj = ghnStationInfo.get("locationName");
            if (nameObj == null) nameObj = ghnStationInfo.get("name");
            if (nameObj != null) {
                order.setGhnStationName(String.valueOf(nameObj));
            }

            // Station Address
            Object addrObj = ghnStationInfo.get("address");
            if (addrObj != null) {
                order.setGhnStationAddress(String.valueOf(addrObj));
            }

            // Station Latitude
            Object latObj = ghnStationInfo.get("latitude");
            if (latObj == null) latObj = ghnStationInfo.get("lat");
            if (latObj instanceof Number) {
                order.setGhnStationLatitude(((Number) latObj).doubleValue());
            } else if (latObj != null) {
                try { order.setGhnStationLatitude(Double.parseDouble(latObj.toString())); } catch (Exception ignored) {}
            }

            // Station Longitude
            Object lngObj = ghnStationInfo.get("longitude");
            if (lngObj == null) lngObj = ghnStationInfo.get("lng");
            if (lngObj == null) lngObj = ghnStationInfo.get("long");
            if (lngObj instanceof Number) {
                order.setGhnStationLongitude(((Number) lngObj).doubleValue());
            } else if (lngObj != null) {
                try { order.setGhnStationLongitude(Double.parseDouble(lngObj.toString())); } catch (Exception ignored) {}
            }
        }

        // Fallback tự động gán thông tin station nếu API sandbox chưa khả dụng hoặc thiếu trường
        if (order.getGhnStationId() == null) {
            int distId = address.getDistrictId() != null ? address.getDistrictId() : 1442;
            order.setGhnStationId(10000 + distId);
            order.setGhnStationName("Bưu cục GHN Kho " + (address.getCity() != null ? address.getCity() : "Trung Tâm"));
            order.setGhnStationAddress("Bưu cục GHN " + (address.getAddress() != null ? address.getAddress() : "123 Đường Trung Tâm"));
            order.setGhnStationLatitude(address.getLatitude() != null ? address.getLatitude() + 0.005 : 10.7769);
            order.setGhnStationLongitude(address.getLongitude() != null ? address.getLongitude() + 0.005 : 106.7009);
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
            // Thanh toán VNPay THÀNH CÔNG
            payment.setStatus(Payment.PaymentStatus.completed);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            order.setStatus("confirmed");
            orderRepository.save(order);

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(order)
                    .status("confirmed")
                    .note("Thanh toán trực tuyến thành công qua cổng VNPay (Mã giao dịch VNPay: " + vnpTransactionNo + ").")
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
            if (!"payment_failed".equalsIgnoreCase(order.getStatus())) {
                order.setStatus("payment_failed");
                orderRepository.save(order);
                rollbackOrderStock(order);
            }

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(order)
                    .status("payment_failed")
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

        if ("confirmed".equalsIgnoreCase(order.getStatus()) || "delivered".equalsIgnoreCase(order.getStatus())) {
            throw new AppException("Đơn hàng này đã được thanh toán hoặc xác nhận.", HttpStatus.BAD_REQUEST);
        }

        // Nếu đơn hàng đang bị payment_failed, tiến hành Trừ lại Tồn kho và chuyển về pending
        if ("payment_failed".equalsIgnoreCase(order.getStatus())) {
            reDeductOrderStock(order);
            order.setStatus("pending");
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
    public Page<OrderResponse> getMyOrders(String email, Pageable pageable) {
        User user = getUserByEmail(email);
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return orders.map(order -> {
            List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
            Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
            return mapToOrderResponse(order, items, payment, null);
        });
    }

    @SuppressWarnings("rawtypes")
    private Map<String, Object> fetchNearestGhnStation(Integer districtId, String wardCode) {
        if (districtId == null) return null;
        try {
            String baseUrl = ghnApiUrl;
            if (!baseUrl.endsWith("/")) baseUrl += "/";
            if (!baseUrl.endsWith("v2/")) baseUrl += "v2/";
            String url = baseUrl + "station/get";

            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(3000);
            factory.setReadTimeout(3000);
            RestTemplate restTemplate = new RestTemplate(factory);

            HttpHeaders headers = new HttpHeaders();
            if (ghnToken != null && !ghnToken.isBlank()) headers.set("Token", ghnToken);
            if (ghnShopId != null && !ghnShopId.isBlank()) headers.set("ShopId", ghnShopId);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("district_id", districtId);
            if (wardCode != null && !wardCode.isBlank()) {
                body.put("ward_code", wardCode);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data instanceof List && !((List<?>) data).isEmpty()) {
                    Object firstStation = ((List<?>) data).get(0);
                    if (firstStation instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> stationMap = (Map<String, Object>) firstStation;
                        Object sName = stationMap.get("locationName");
                        if (sName == null) sName = stationMap.get("name");
                        log.info("Đã tìm thấy bưu cục kho GHN gần nhất: {} - {}", sName, stationMap.get("address"));
                        return stationMap;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Không thể tra cứu bưu cục kho GHN cho districtId={}: {}", districtId, e.getMessage());
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
                .status(order.getStatus())
                .paymentMethod(pMethod)
                .paymentStatus(pStatus)
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
