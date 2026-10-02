package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.request.admin.AdminOrderFilterRequest;
import com.web.ap_sports.dto.request.admin.CancelOrderRequest;
import com.web.ap_sports.dto.request.admin.UpdateOrderStatusRequest;
import com.web.ap_sports.dto.response.admin.*;
import com.web.ap_sports.dto.response.customer.OrderItemResponse;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.OrderItem;
import com.web.ap_sports.entity.OrderStatusHistory;
import com.web.ap_sports.entity.Payment;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.ShippingAddress;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.enums.PaymentStatus;
import com.web.ap_sports.exception.AppException;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.admin.AdminOrderService;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminOrderServiceImpl implements AdminOrderService {

    private static final String DEFAULT_SHIPPER_NAME = "Nguyễn Văn Nam (Shipper GHN Express)";
    private static final String DEFAULT_SHIPPER_PHONE = "0988 776 655";

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminOrderDetailResponse> getAdminOrders(AdminOrderFilterRequest filterRequest) {
        log.info("Admin/Staff truy vấn danh sách đơn hàng với bộ lọc: {}", filterRequest);

        int page = filterRequest.getPage() != null ? Math.max(0, filterRequest.getPage()) : 0;
        int size = filterRequest.getSize() != null ? Math.max(1, filterRequest.getSize()) : 10;
        String sortBy = filterRequest.getSortBy() != null && !filterRequest.getSortBy().isBlank() ? filterRequest.getSortBy() : "createdAt";
        Sort.Direction direction = "ASC".equalsIgnoreCase(filterRequest.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Specification<Order> spec = buildSpecification(filterRequest);

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);
        return orderPage.map(this::mapToAdminOrderDetailResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderSummaryResponse getOrderSummary() {
        log.info("Admin/Staff truy vấn báo cáo KPI tổng quan đơn hàng");

        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.pending);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.confirmed);
        long processingOrders = orderRepository.countByStatus(OrderStatus.processing);
        long shippingOrders = orderRepository.countByStatus(OrderStatus.shipping);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.delivered);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.cancelled);
        long paymentFailedOrders = orderRepository.countByStatus(OrderStatus.payment_failed);

        BigDecimal totalRevenue = orderRepository.sumDeliveredRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return AdminOrderSummaryResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .processingOrders(processingOrders)
                .shippingOrders(shippingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .paymentFailedOrders(paymentFailedOrders)
                .totalRevenue(totalRevenue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getAdminOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng ID #" + id, HttpStatus.NOT_FOUND));
        return mapToAdminOrderDetailResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getAdminOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng mã #" + orderCode, HttpStatus.NOT_FOUND));
        return mapToAdminOrderDetailResponse(order);
    }

    @Override
    @Transactional
    public AdminOrderDetailResponse confirmOrder(Long id, String staffEmail) {
        User staff = getUserByEmail(staffEmail);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng ID #" + id, HttpStatus.NOT_FOUND));

        if (order.getStatus() != OrderStatus.pending) {
            throw new AppException("Đơn hàng phải ở trạng thái [Chờ Duyệt - pending] mới có thể xác nhận đơn.", HttpStatus.BAD_REQUEST);
        }

        // Chỉ cập nhật trạng thái ĐƠN HÀNG → confirmed.
        order.setStatus(OrderStatus.confirmed);
        order.setProcessedByStaff(staff);
        Order savedOrder = orderRepository.save(order);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.confirmed.getValue())
                .note("Đơn hàng đã được nhân viên [" + staff.getName() + "] xác nhận thành công.")
                .changedBy(staff)
                .build();
        orderStatusHistoryRepository.save(history);

        log.info("Nhân viên [{}] đã xác nhận đơn hàng #{}", staff.getEmail(), savedOrder.getOrderCode());
        return mapToAdminOrderDetailResponse(savedOrder);
    }

    @Override
    @Transactional
    public AdminOrderDetailResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request, String staffEmail) {
        User staff = getUserByEmail(staffEmail);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng ID #" + id, HttpStatus.NOT_FOUND));

        String newStatusStr = request.getStatus().trim().toLowerCase();
        OrderStatus newStatus = OrderStatus.fromString(newStatusStr);
        if (newStatus == null) {
            throw new AppException("Trạng thái đơn hàng [" + request.getStatus() + "] không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        // Nếu yêu cầu hủy → delegate sang cancelOrder để kiểm tra điều kiện hủy (chỉ hủy được khi chưa gửi GHN)
        if (newStatus == OrderStatus.cancelled) {
            CancelOrderRequest cancelReq = new CancelOrderRequest(request.getNote() != null ? request.getNote() : "Hủy bởi nhân viên quản trị");
            return cancelOrder(id, cancelReq, staffEmail);
        }

        // Kiểm tra ràng buộc chuyển trạng thái nghiêm ngặt (Strict State Machine)
        if (newStatus == OrderStatus.processing && order.getStatus() != OrderStatus.confirmed) {
            throw new AppException("Đơn hàng phải ở trạng thái [Đã Duyệt - confirmed] mới có thể xuất kho AP Sports!", HttpStatus.BAD_REQUEST);
        }
        if (newStatus == OrderStatus.shipped && order.getStatus() != OrderStatus.processing) {
            throw new AppException("Đơn hàng phải ở trạng thái [Đang Đóng Gói - processing] mới có thể bàn giao Bưu cục GHN!", HttpStatus.BAD_REQUEST);
        }
        if (newStatus == OrderStatus.shipping && order.getStatus() != OrderStatus.shipped) {
            throw new AppException("Đơn hàng phải ở trạng thái [Đã Bàn Giao GHN - shipped] mới có thể xuất phát giao hàng!", HttpStatus.BAD_REQUEST);
        }
        if (newStatus == OrderStatus.delivered && order.getStatus() != OrderStatus.shipping) {
            throw new AppException("Đơn hàng phải ở trạng thái [Đang Giao - shipping] mới có thể xác nhận đã giao thành công!", HttpStatus.BAD_REQUEST);
        }

        order.setStatus(newStatus);
        if (order.getProcessedByStaff() == null) {
            order.setProcessedByStaff(staff);
        }
        Order savedOrder = orderRepository.save(order);

        // Quy tắc cập nhật trạng thái THANH TOÁN:
        // - Chỉ cập nhật payment status khi đơn hàng đến trạng thái 'delivered' (đã giao thành công).
        // - Chỉ áp dụng cho đơn COD (cash): chuyển payment từ pending → completed.
        // - Đơn VNPay: payment status đã được xử lý bởi callback VNPay (completed hoặc failed).
        //   Khi admin đánh dấu delivered cho VNPay, payment đã completed từ trước → không đổi gì.
        if (newStatus == OrderStatus.delivered) {
            paymentRepository.findByOrderId(savedOrder.getId()).ifPresent(payment -> {
                boolean isCod = payment.getPaymentMethod() == Payment.PaymentMethod.cash;
                boolean notYetPaid = payment.getStatus() != Payment.PaymentStatus.completed;
                if (isCod && notYetPaid) {
                    payment.setStatus(Payment.PaymentStatus.completed);
                    payment.setPaidAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                    log.info("Đơn COD #{}: thanh toán được đánh dấu hoàn thành khi đơn hàng đã giao.", savedOrder.getOrderCode());
                }
            });
        }

        String note = request.getNote() != null && !request.getNote().isBlank()
                ? request.getNote()
                : "Nhân viên [" + staff.getName() + "] đã cập nhật trạng thái đơn hàng sang: " + newStatus.getValue().toUpperCase();

        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status(newStatus.getValue())
                .note(note)
                .changedBy(staff)
                .build();
        orderStatusHistoryRepository.save(history);

        log.info("Nhân viên [{}] đã cập nhật đơn hàng #{} sang trạng thái [{}]", staff.getEmail(), savedOrder.getOrderCode(), newStatus.getValue());
        return mapToAdminOrderDetailResponse(savedOrder);
    }

    @Override
    @Transactional
    public AdminOrderDetailResponse cancelOrder(Long id, CancelOrderRequest request, String staffEmail) {
        User staff = getUserByEmail(staffEmail);
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng ID #" + id, HttpStatus.NOT_FOUND));

        if (order.getStatus() == OrderStatus.shipped || order.getStatus() == OrderStatus.shipping || order.getStatus() == OrderStatus.delivered) {
            throw new AppException("Đơn hàng đã bàn giao bưu cục GHN / đang vận chuyển, không thể hủy bỏ!", HttpStatus.BAD_REQUEST);
        }
        if (order.getStatus() == OrderStatus.cancelled) {
            throw new AppException("Đơn hàng này đã bị hủy từ trước.", HttpStatus.BAD_REQUEST);
        }

        order.setStatus(OrderStatus.cancelled);
        order.setProcessedByStaff(staff);
        Order savedOrder = orderRepository.save(order);

        // Hoàn trả tồn kho cho Product và Variant
        rollbackOrderStock(savedOrder);

        // Quy tắc cập nhật trạng thái THANH TOÁN khi hủy đơn:
        // - Nếu payment.status = completed (KH đã thanh toán xong, chủ yếu qua VNPay)
        //   → Chuyển thành 'refunded' (Mô phỏng hoàn tiền)
        // - Nếu payment.status = pending (COD chưa trả, hoặc VNPay chưa hoàn tất)
        //   → Chuyển thành 'failed' (Đơn hủy không thu được tiền)
        paymentRepository.findByOrderId(savedOrder.getId()).ifPresent(payment -> {
            if (payment.getStatus() == Payment.PaymentStatus.completed) {
                // Đã thanh toán → refund (mô phỏng hoàn tiền VNPay)
                payment.setStatus(Payment.PaymentStatus.refunded);
                log.info("Đơn #{}: hủy sau khi đã thanh toán → payment chuyển thành REFUNDED.", savedOrder.getOrderCode());
            } else if (payment.getStatus() == Payment.PaymentStatus.pending) {
                // Chưa thanh toán → hủy đơn thì cũng hủy luôn payment
                payment.setStatus(Payment.PaymentStatus.failed);
                log.info("Đơn #{}: hủy khi chưa thanh toán → payment chuyển thành FAILED.", savedOrder.getOrderCode());
            }
            // Nếu payment đã là failed/refunded → không thay đổi
            paymentRepository.save(payment);
        });

        String note = "Đơn hàng đã bị hủy bởi nhân viên [" + staff.getName() + "]. Lý do: " + request.getReason();
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status("cancelled")
                .note(note)
                .changedBy(staff)
                .build();
        orderStatusHistoryRepository.save(history);

        log.info("Nhân viên [{}] đã hủy đơn hàng #{} với lý do: {}", staff.getEmail(), savedOrder.getOrderCode(), request.getReason());
        return mapToAdminOrderDetailResponse(savedOrder);
    }

    /**
     * Hoàn trả tồn kho khi đơn hàng bị hủy hoặc thanh toán thất bại.
     * Áp dụng cho cả Product tổng và ProductVariant.
     */
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
                log.debug("Hoàn kho sản phẩm [{}]: {} → {}", product.getId(), currentStock, restoredStock);
            }
            if (item.getVariant() != null) {
                ProductVariant variant = item.getVariant();
                int currentVariantStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
                variant.setStockQuantity(currentVariantStock + item.getQuantity());
                productVariantRepository.save(variant);
            }
        }

        if (order.getCoupon() != null) {
            com.web.ap_sports.entity.Coupon coupon = order.getCoupon();
            int used = coupon.getUsedCount() != null ? coupon.getUsedCount() : 0;
            if (used > 0) {
                coupon.setUsedCount(used - 1);
                couponRepository.save(coupon);
                log.info("Admin hoàn trả lượt dùng mã giảm giá [{}] cho đơn hàng #{}: {} -> {}",
                        coupon.getCode(), order.getOrderCode(), used, used - 1);
            }
        }
    }

    private Specification<Order> buildSpecification(AdminOrderFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Keyword search (mã đơn, tên khách, email, sđt)
            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String kw = "%" + filter.getKeyword().trim().toLowerCase() + "%";
                Join<Order, User> userJoin = root.join("user", JoinType.LEFT);
                Join<Order, ShippingAddress> addrJoin = root.join("shippingAddress", JoinType.LEFT);

                Predicate pOrderCode = cb.like(cb.lower(root.get("orderCode")), kw);
                Predicate pUserName = cb.like(cb.lower(userJoin.get("name")), kw);
                Predicate pUserEmail = cb.like(cb.lower(userJoin.get("email")), kw);
                Predicate pAddrName = cb.like(cb.lower(addrJoin.get("fullName")), kw);
                Predicate pAddrPhone = cb.like(cb.lower(addrJoin.get("phone")), kw);

                predicates.add(cb.or(pOrderCode, pUserName, pUserEmail, pAddrName, pAddrPhone));
            }

            // 2. Filter theo status
            if (filter.getStatus() != null && !filter.getStatus().isBlank() && !"ALL".equalsIgnoreCase(filter.getStatus().trim())) {
                predicates.add(cb.equal(cb.lower(root.get("status")), filter.getStatus().trim().toLowerCase()));
            }

            // 3. Filter theo khoảng giá finalAmount
            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("finalAmount"), filter.getMinPrice()));
            }
            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("finalAmount"), filter.getMaxPrice()));
            }

            // 4. Filter theo khoảng ngày tạo createdAt
            if (filter.getStartDate() != null && !filter.getStartDate().isBlank()) {
                LocalDateTime start = parseDateTime(filter.getStartDate().trim(), true);
                if (start != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
                }
            }
            if (filter.getEndDate() != null && !filter.getEndDate().isBlank()) {
                LocalDateTime end = parseDateTime(filter.getEndDate().trim(), false);
                if (end != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private LocalDateTime parseDateTime(String text, boolean isStart) {
        try {
            if (text.contains("T")) {
                text = text.replace("T", " ");
            }
            if (text.length() == 10) {
                LocalDate date = LocalDate.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                return isStart ? date.atStartOfDay() : date.atTime(LocalTime.MAX);
            }
            return LocalDateTime.parse(text, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            return null;
        }
    }

    private User getUserByEmail(String email) {
        if (email != null && !email.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
        }
        // Fallback cho Hệ thống / Mô phỏng Logistics: Ưu tiên lấy tài khoản Bưu Cục GHN Express (Role GHN_STATION)
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && ("GHN_STATION".equalsIgnoreCase(u.getRole().getName()) || "ROLE_GHN_STATION".equalsIgnoreCase(u.getRole().getName())))
                .findFirst()
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> u.getRole() != null && ("ROLE_ADMIN".equalsIgnoreCase(u.getRole().getName()) || "ADMIN".equalsIgnoreCase(u.getRole().getName()) || "ROLE_STAFF".equalsIgnoreCase(u.getRole().getName()) || "STAFF".equalsIgnoreCase(u.getRole().getName())))
                        .findFirst()
                        .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null)));
    }

    private AdminOrderDetailResponse mapToAdminOrderDetailResponse(Order order) {
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

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemResponse> itemResps = (orderItems != null ? orderItems : Collections.<OrderItem>emptyList()).stream().map(item -> {
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
                    .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                    .productName(item.getProduct() != null ? item.getProduct().getName() : "Sản phẩm")
                    .productSlug(item.getProduct() != null ? item.getProduct().getSlug() : "")
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

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        String pMethod = payment != null && payment.getPaymentMethod() != null
                ? payment.getPaymentMethod().name().toUpperCase()
                : "COD";
        String pStatus = payment != null && payment.getStatus() != null
                ? payment.getStatus().name().toLowerCase()
                : "pending";

        UserResponse staffResp = null;
        if (order.getProcessedByStaff() != null) {
            User s = order.getProcessedByStaff();
            staffResp = UserResponse.builder()
                    .id(s.getId())
                    .name(s.getName())
                    .email(s.getEmail())
                    .avatar(s.getAvatar())
                    .roleName(s.getRole() != null ? s.getRole().getName() : "")
                    .build();
        }

        List<OrderStatusHistory> histories = orderStatusHistoryRepository.findByOrderIdOrderByCreatedAtDesc(order.getId());
        List<OrderStatusHistoryResponse> historyResps = (histories != null ? histories : Collections.<OrderStatusHistory>emptyList()).stream().map(h -> {
            User cb = h.getChangedBy();
            return OrderStatusHistoryResponse.builder()
                    .id(h.getId())
                    .status(h.getStatus())
                    .note(h.getNote())
                    .changedByUserId(cb != null ? cb.getId() : null)
                    .changedByName(cb != null ? cb.getName() : "Hệ thống")
                    .changedByEmail(cb != null ? cb.getEmail() : null)
                    .changedByRole(cb != null && cb.getRole() != null ? cb.getRole().getName() : "")
                    .createdAt(h.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        // Shipper simulation GPS points for map embedding & React Native mobile app
        Double stationLat = order.getGhnStationLatitude() != null ? order.getGhnStationLatitude() : 10.7769;
        Double stationLng = order.getGhnStationLongitude() != null ? order.getGhnStationLongitude() : 106.7009;
        
        // Lấy chính xác tọa độ GPS địa chỉ người nhận riêng của khách hàng đã đặt đơn
        Double destLat = order.getGpsLatitude() != null ? order.getGpsLatitude() :
                (order.getShippingAddress() != null && order.getShippingAddress().getLatitude() != null ? order.getShippingAddress().getLatitude() :
                (order.getGhnStationLatitude() != null ? order.getGhnStationLatitude() : 10.03054));
        Double destLng = order.getGpsLongitude() != null ? order.getGpsLongitude() :
                (order.getShippingAddress() != null && order.getShippingAddress().getLongitude() != null ? order.getShippingAddress().getLongitude() :
                (order.getGhnStationLongitude() != null ? order.getGhnStationLongitude() : 105.78280));

        Double shipperLat = stationLat + (destLat - stationLat) * 0.6;
        Double shipperLng = stationLng + (destLng - stationLng) * 0.6;

        return AdminOrderDetailResponse.builder()
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
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .customerName(order.getUser() != null ? order.getUser().getName() : "Khách hàng")
                .customerEmail(order.getUser() != null ? order.getUser().getEmail() : "")
                .customerPhone(order.getShippingAddress() != null ? order.getShippingAddress().getPhone() : (order.getUser() != null ? order.getUser().getPhoneNumber() : ""))
                .processedByStaff(staffResp)
                .shippingAddress(addressResp)
                .trackingCode(order.getTrackingCode())
                .shippingProvider(order.getShippingProvider())
                .gpsLatitude(destLat)
                .gpsLongitude(destLng)
                .ghnStationId(order.getGhnStationId())
                .ghnStationName(order.getGhnStationName())
                .ghnStationAddress(order.getGhnStationAddress())
                .ghnStationLatitude(stationLat)
                .ghnStationLongitude(stationLng)
                .shipperCurrentLatitude(shipperLat)
                .shipperCurrentLongitude(shipperLng)
                .shipperName(DEFAULT_SHIPPER_NAME)
                .shipperPhone(DEFAULT_SHIPPER_PHONE)
                .note(order.getNote())
                .items(itemResps)
                .statusHistories(historyResps)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
