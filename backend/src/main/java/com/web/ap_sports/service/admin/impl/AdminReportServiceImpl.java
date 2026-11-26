package com.web.ap_sports.service.admin.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.report.*;
import com.web.ap_sports.entity.Category;
import com.web.ap_sports.entity.InventoryTransaction;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.OrderItem;
import com.web.ap_sports.entity.Payment;
import com.web.ap_sports.entity.Product;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.enums.ProductVariantStatus;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.admin.AdminReportService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminReportServiceImpl implements AdminReportService {

    // ==========================================
    // CÁC HẰNG SỐ CẤU HÌNH DOANH SỐ & HOA HỒNG
    // ==========================================
    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("0.02"); // 2% hoa hồng trên doanh thu hoàn
                                                                                      // thành
    private static final double KPI_SUCCESS_RATE_EXCELLENT_THRESHOLD = 90.0; // Ngưỡng xuất sắc: >= 90%
    private static final double KPI_SUCCESS_RATE_GOOD_THRESHOLD = 75.0; // Ngưỡng đạt: >= 75%
    private static final BigDecimal KPI_BONUS_AMOUNT = new BigDecimal("1000000"); // Thưởng KPI xuất sắc: 1.000.000 VNĐ
    private static final int DEFAULT_TOP_LIMIT = 10; // Giới hạn hiển thị Top sản phẩm
    private static final int LOW_STOCK_THRESHOLD = 5; // Ngưỡng cảnh báo tồn kho thấp (<= 5)
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter LABEL_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ObjectMapper objectMapper;

    @Override
    public RevenueOverviewReportResponse getRevenueOverview(LocalDateTime fromDate, LocalDateTime toDate,
            Long staffId) {
        List<Order> orders = orderRepository.findOrdersForReport(fromDate, toDate, staffId);

        BigDecimal totalDeliveredRevenue = BigDecimal.ZERO;
        BigDecimal totalGrossRevenue = BigDecimal.ZERO;
        BigDecimal totalDiscountAmount = BigDecimal.ZERO;
        BigDecimal totalShippingFee = BigDecimal.ZERO;
        BigDecimal cashPaymentRevenue = BigDecimal.ZERO;
        BigDecimal vnpayPaymentRevenue = BigDecimal.ZERO;

        long totalOrders = orders.size();
        long completedOrders = 0;
        long deliveringOrders = 0;
        long cancelledOrders = 0;
        long returnedOrders = 0;

        Map<String, TimeSeriesPointResponse> timeSeriesMap = new TreeMap<>();

        for (Order o : orders) {
            String dateKey = o.getCreatedAt() != null ? o.getCreatedAt().format(DATE_FORMATTER) : "N/A";
            String dateLabel = o.getCreatedAt() != null ? o.getCreatedAt().format(LABEL_FORMATTER) : "N/A";

            TimeSeriesPointResponse point = timeSeriesMap.computeIfAbsent(dateKey,
                    k -> TimeSeriesPointResponse.builder()
                            .date(dateKey)
                            .label(dateLabel)
                            .revenue(BigDecimal.ZERO)
                            .orderCount(0)
                            .completedCount(0)
                            .cancelledCount(0)
                            .build());

            point.setOrderCount(point.getOrderCount() + 1);

            OrderStatus status = o.getStatus();
            boolean isCompleted = (status == OrderStatus.delivered || status == OrderStatus.completed);
            boolean isDelivering = (status == OrderStatus.shipping || status == OrderStatus.shipped
                    || status == OrderStatus.processing);
            boolean isCancelled = (status == OrderStatus.cancelled);
            boolean isReturned = (status == OrderStatus.returned);

            if (isCompleted) {
                completedOrders++;
                point.setCompletedCount(point.getCompletedCount() + 1);

                BigDecimal amount = o.getFinalAmount() != null ? o.getFinalAmount() : BigDecimal.ZERO;
                totalDeliveredRevenue = totalDeliveredRevenue.add(amount);
                point.setRevenue(point.getRevenue().add(amount));

                if (o.getDiscountAmount() != null) {
                    totalDiscountAmount = totalDiscountAmount.add(o.getDiscountAmount());
                }
                if (o.getShippingFee() != null) {
                    totalShippingFee = totalShippingFee.add(o.getShippingFee());
                }
                if (o.getTotalPrice() != null) {
                    totalGrossRevenue = totalGrossRevenue.add(o.getTotalPrice());
                }

                // Kiểm tra phương thức thanh toán
                Payment p = paymentRepository.findByOrderId(o.getId()).orElse(null);
                if (p != null && p.getPaymentMethod() == Payment.PaymentMethod.vnpay) {
                    vnpayPaymentRevenue = vnpayPaymentRevenue.add(amount);
                } else {
                    cashPaymentRevenue = cashPaymentRevenue.add(amount);
                }
            } else if (isDelivering) {
                deliveringOrders++;
            } else if (isCancelled) {
                cancelledOrders++;
                point.setCancelledCount(point.getCancelledCount() + 1);
            } else if (isReturned) {
                returnedOrders++;
            }
        }

        double successRate = totalOrders > 0 ? (double) completedOrders / totalOrders * 100.0 : 0.0;
        double cancellationRate = totalOrders > 0 ? (double) cancelledOrders / totalOrders * 100.0 : 0.0;
        BigDecimal aov = completedOrders > 0
                ? totalDeliveredRevenue.divide(BigDecimal.valueOf(completedOrders), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal totalNetRevenue = totalDeliveredRevenue.subtract(totalShippingFee);
        if (totalNetRevenue.compareTo(BigDecimal.ZERO) < 0)
            totalNetRevenue = BigDecimal.ZERO;

        return RevenueOverviewReportResponse.builder()
                .totalGrossRevenue(
                        totalGrossRevenue.compareTo(BigDecimal.ZERO) > 0 ? totalGrossRevenue : totalDeliveredRevenue)
                .totalNetRevenue(totalNetRevenue)
                .totalDeliveredRevenue(totalDeliveredRevenue)
                .totalDiscountAmount(totalDiscountAmount)
                .totalShippingFee(totalShippingFee)
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .deliveringOrders(deliveringOrders)
                .cancelledOrders(cancelledOrders)
                .returnedOrders(returnedOrders)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .cancellationRate(Math.round(cancellationRate * 10.0) / 10.0)
                .averageOrderValue(aov)
                .cashPaymentRevenue(cashPaymentRevenue)
                .vnpayPaymentRevenue(vnpayPaymentRevenue)
                .timeSeries(new ArrayList<>(timeSeriesMap.values()))
                .build();
    }

    @Override
    public List<StaffPerformanceReportResponse> getStaffPerformance(LocalDateTime fromDate, LocalDateTime toDate) {
        List<User> staffList = userRepository.findActiveUsersByRoles(List.of("STAFF", "ADMIN"));
        List<StaffPerformanceReportResponse> result = new ArrayList<>();

        for (User staff : staffList) {
            List<Order> orders = orderRepository.findOrdersForReport(fromDate, toDate, staff.getId());

            long totalHandled = orders.size();
            long completed = 0;
            long delivering = 0;
            long cancelled = 0;
            BigDecimal deliveredRevenue = BigDecimal.ZERO;

            for (Order o : orders) {
                OrderStatus status = o.getStatus();
                if (status == OrderStatus.delivered || status == OrderStatus.completed) {
                    completed++;
                    if (o.getFinalAmount() != null) {
                        deliveredRevenue = deliveredRevenue.add(o.getFinalAmount());
                    }
                } else if (status == OrderStatus.shipping || status == OrderStatus.shipped
                        || status == OrderStatus.processing) {
                    delivering++;
                } else if (status == OrderStatus.cancelled || status == OrderStatus.returned) {
                    cancelled++;
                }
            }

            double successRate = totalHandled > 0 ? (double) completed / totalHandled * 100.0 : 0.0;
            double cancellationRate = totalHandled > 0 ? (double) cancelled / totalHandled * 100.0 : 0.0;
            BigDecimal aov = completed > 0
                    ? deliveredRevenue.divide(BigDecimal.valueOf(completed), 0, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            BigDecimal commission = deliveredRevenue.multiply(DEFAULT_COMMISSION_RATE).setScale(0,
                    RoundingMode.HALF_UP);
            BigDecimal bonus = (successRate >= KPI_SUCCESS_RATE_EXCELLENT_THRESHOLD && completed >= 5)
                    ? KPI_BONUS_AMOUNT
                    : BigDecimal.ZERO;
            BigDecimal totalEarnings = commission.add(bonus);

            String badge;
            if (totalHandled == 0) {
                badge = "CHƯA CÓ ĐƠN";
            } else if (successRate >= KPI_SUCCESS_RATE_EXCELLENT_THRESHOLD && completed >= 3) {
                badge = "XUẤT SẮC";
            } else if (successRate >= KPI_SUCCESS_RATE_GOOD_THRESHOLD) {
                badge = "ĐẠT CHỈ TIÊU";
            } else {
                badge = "CẦN CẢI THIỆN";
            }

            result.add(StaffPerformanceReportResponse.builder()
                    .staffId(staff.getId())
                    .staffName(staff.getName())
                    .staffEmail(staff.getEmail())
                    .staffRole(staff.getRole() != null ? staff.getRole().getName() : "STAFF")
                    .staffAvatar(staff.getAvatar())
                    .employeeCode(staff.getEmployeeCode() != null ? staff.getEmployeeCode() : "NV-" + staff.getId())
                    .totalHandledOrders(totalHandled)
                    .completedOrders(completed)
                    .deliveringOrders(delivering)
                    .cancelledOrders(cancelled)
                    .successRate(Math.round(successRate * 10.0) / 10.0)
                    .cancellationRate(Math.round(cancellationRate * 10.0) / 10.0)
                    .deliveredRevenue(deliveredRevenue)
                    .averageOrderValue(aov)
                    .commissionRate(BigDecimal.ZERO)
                    .estimatedCommission(BigDecimal.ZERO)
                    .kpiBonus(BigDecimal.ZERO)
                    .totalEstimatedEarnings(BigDecimal.ZERO)
                    .performanceBadge(badge)
                    .build());
        }

        // Sắp xếp bảng xếp hạng: Doanh thu giảm dần, sau đó theo số đơn thành công giảm
        // dần
        result.sort((a, b) -> {
            int cmp = b.getDeliveredRevenue().compareTo(a.getDeliveredRevenue());
            if (cmp != 0)
                return cmp;
            return Long.compare(b.getCompletedOrders(), a.getCompletedOrders());
        });

        return result;
    }

    @Override
    public TopMerchandiseReportResponse getTopMerchandise(LocalDateTime fromDate, LocalDateTime toDate, Integer limit) {
        int finalLimit = (limit != null && limit > 0) ? limit : DEFAULT_TOP_LIMIT;

        List<Object[]> topProductRows = orderItemRepository.findTopSellingProducts(fromDate, toDate,
                PageRequest.of(0, finalLimit));
        List<TopProductItemResponse> topProducts = new ArrayList<>();

        for (Object[] row : topProductRows) {
            Long productId = (Long) row[0];
            String name = (String) row[1];
            String slug = (String) row[2];
            long qty = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            BigDecimal rev = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;

            String image = productImageRepository.findFirstByProductIdAndIsPrimaryTrue(productId)
                    .map(ProductImage::getImagePath)
                    .orElseGet(() -> productImageRepository.findByProductId(productId).stream()
                            .findFirst().map(ProductImage::getImagePath).orElse(""));

            topProducts.add(TopProductItemResponse.builder()
                    .productId(productId)
                    .productName(name)
                    .slug(slug)
                    .image(image)
                    .totalQuantitySold(qty)
                    .totalRevenue(rev)
                    .build());
        }

        List<Object[]> catRows = orderItemRepository.findCategoryRevenueBreakdown(fromDate, toDate);
        List<CategoryRevenueItemResponse> catList = new ArrayList<>();
        BigDecimal totalCatRevenue = BigDecimal.ZERO;

        for (Object[] row : catRows) {
            BigDecimal rev = row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO;
            totalCatRevenue = totalCatRevenue.add(rev);
        }

        for (Object[] row : catRows) {
            Long catId = (Long) row[0];
            String catName = (String) row[1];
            long qty = row[2] != null ? ((Number) row[2]).longValue() : 0L;
            BigDecimal rev = row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO;

            double pct = totalCatRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? rev.divide(totalCatRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                    : 0.0;

            catList.add(CategoryRevenueItemResponse.builder()
                    .categoryId(catId)
                    .categoryName(catName)
                    .totalQuantitySold(qty)
                    .totalRevenue(rev)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        return TopMerchandiseReportResponse.builder()
                .topProducts(topProducts)
                .categoryBreakdown(catList)
                .build();
    }

    @Override
    public WarehouseReportResponse getWarehouseReport(LocalDateTime fromDate, LocalDateTime toDate) {
        BigDecimal totalValue = inventoryTransactionRepository.sumTotalInventoryValue();
        if (totalValue == null)
            totalValue = BigDecimal.ZERO;

        long totalStock = productVariantRepository.sumTotalStockQuantity();
        long lowStockCount = productVariantRepository.countLowStockVariants(LOW_STOCK_THRESHOLD);
        long outOfStockCount = productVariantRepository.countOutOfStockVariants();

        Long inboundQty = inventoryTransactionRepository.sumQuantityByTypeInPeriod(TransactionType.IMPORT, fromDate,
                toDate);
        Long manualOutboundQty = inventoryTransactionRepository.sumQuantityByTypeInPeriod(TransactionType.EXPORT,
                fromDate, toDate);
        if (manualOutboundQty == null)
            manualOutboundQty = 0L;

        // Tính lượng sản phẩm đã xuất bán theo đơn hàng đã xuất kho bàn giao GHN trở đi
        // (shipped, shipping, delivered, completed)
        List<OrderStatus> outboundStatuses = List.of(
                OrderStatus.shipped,
                OrderStatus.shipping,
                OrderStatus.delivered,
                OrderStatus.completed);
        Long orderOutboundQty = orderItemRepository.sumQuantityByOrderStatusesInPeriod(outboundStatuses, fromDate,
                toDate);
        if (orderOutboundQty == null)
            orderOutboundQty = 0L;

        long totalOutboundQty = manualOutboundQty + orderOutboundQty;

        List<ProductVariant> lowVariants = productVariantRepository.findLowStockVariants(LOW_STOCK_THRESHOLD,
                PageRequest.of(0, 50));
        List<LowStockVariantItemResponse> lowStockItems = new ArrayList<>();

        for (ProductVariant v : lowVariants) {
            String img = "";
            if (v.getImages() != null && !v.getImages().isEmpty()) {
                img = v.getImages().get(0).getImagePath();
            } else if (v.getProduct() != null) {
                img = productImageRepository.findFirstByProductIdAndIsPrimaryTrue(v.getProduct().getId())
                        .map(ProductImage::getImagePath)
                        .orElse("");
            }

            lowStockItems.add(LowStockVariantItemResponse.builder()
                    .variantId(v.getId())
                    .productId(v.getProduct() != null ? v.getProduct().getId() : null)
                    .productName(v.getProduct() != null ? v.getProduct().getName() : "Sản phẩm")
                    .sku(v.getSku())
                    .size(v.getSize())
                    .color(v.getColor())
                    .price(v.getPrice())
                    .costPrice(v.getCostPrice())
                    .stockQuantity(v.getStockQuantity())
                    .image(img)
                    .build());
        }

        return WarehouseReportResponse.builder()
                .totalInventoryValue(totalValue)
                .totalStockQuantity(totalStock)
                .lowStockVariantCount(lowStockCount)
                .outOfStockVariantCount(outOfStockCount)
                .inboundQuantityInPeriod(inboundQty != null ? inboundQty : 0L)
                .outboundQuantityInPeriod(totalOutboundQty)
                .orderOutboundQuantity(orderOutboundQty)
                .manualOutboundQuantity(manualOutboundQty)
                .lowStockVariants(lowStockItems)
                .build();
    }

    @Override
    public List<UserResponse> getStaffDropdownList() {
        List<User> staffUsers = userRepository.findActiveUsersByRoles(List.of("STAFF", "ADMIN"));
        List<UserResponse> res = new ArrayList<>();
        for (User u : staffUsers) {
            res.add(UserResponse.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .avatar(u.getAvatar())
                    .roleName(u.getRole() != null ? u.getRole().getName() : "")
                    .build());
        }
        return res;
    }

    // =========================================================================
    // HỆ THỐNG API DRILL-DOWN BẢNG CHI TIẾT KHI CLICK VÀO CÁC BIỂU ĐỒ BÁO CÁO & DASHBOARD
    // =========================================================================

    @Override
    public Page<ReportDrilldownOrderResponse> getDrilldownOrders(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String statusGroup,
            String paymentMethod,
            Long productId,
            Long categoryId,
            Long staffId,
            Pageable pageable
    ) {
        Set<Long> expandedCategoryIds = categoryId != null
                ? expandCategoryHierarchy(categoryId)
                : Collections.emptySet();

        List<OrderStatus> targetStatuses = resolveTargetStatuses(statusGroup);

        Specification<Order> spec = (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            List<Predicate> predicates = new ArrayList<>();

            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }
            if (staffId != null) {
                predicates.add(cb.equal(root.get("processedByStaff").get("id"), staffId));
            }
            if (targetStatuses != null && !targetStatuses.isEmpty()) {
                predicates.add(root.get("status").in(targetStatuses));
            }

            // Lọc theo phương thức thanh toán (VNPAY vs CASH/COD - khớp 100% logic PaymentMethodPieChart)
            if (StringUtils.hasText(paymentMethod) && !"ALL".equalsIgnoreCase(paymentMethod.trim())) {
                String pm = paymentMethod.trim().toUpperCase();
                Subquery<Long> vnpaySubquery = query.subquery(Long.class);
                Root<Payment> payRoot = vnpaySubquery.from(Payment.class);
                vnpaySubquery.select(payRoot.get("order").get("id"))
                        .where(cb.equal(payRoot.get("paymentMethod"), Payment.PaymentMethod.vnpay));

                if ("VNPAY".equals(pm)) {
                    predicates.add(cb.in(root.get("id")).value(vnpaySubquery));
                } else if ("CASH".equals(pm) || "COD".equals(pm)) {
                    predicates.add(cb.not(cb.in(root.get("id")).value(vnpaySubquery)));
                }
            }

            // Lọc các đơn hàng có chứa sản phẩm cụ thể (khi click Top Sản Phẩm / Top 10 Bóng Đá)
            if (productId != null) {
                Subquery<Long> prodSubquery = query.subquery(Long.class);
                Root<OrderItem> oiRoot = prodSubquery.from(OrderItem.class);
                prodSubquery.select(oiRoot.get("order").get("id"))
                        .where(cb.equal(oiRoot.get("product").get("id"), productId));
                predicates.add(cb.in(root.get("id")).value(prodSubquery));
            }

            // Lọc các đơn hàng có chứa sản phẩm thuộc danh mục cụ thể + danh mục con/cháu
            if (!expandedCategoryIds.isEmpty()) {
                Subquery<Long> catSubquery = query.subquery(Long.class);
                Root<OrderItem> oiRoot = catSubquery.from(OrderItem.class);
                Join<OrderItem, Product> pJoin = oiRoot.join("product", JoinType.INNER);
                Join<Product, Category> secCatJoin = pJoin.join("categories", JoinType.LEFT);
                catSubquery.select(oiRoot.get("order").get("id"))
                        .where(cb.or(
                                pJoin.get("category").get("id").in(expandedCategoryIds),
                                secCatJoin.get("id").in(expandedCategoryIds)
                        ));
                predicates.add(cb.in(root.get("id")).value(catSubquery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable sortedPageable = PageRequest.of(
                Math.max(0, pageable.getPageNumber()),
                Math.max(1, pageable.getPageSize()),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Order> orderPage = orderRepository.findAll(spec, sortedPageable);
        List<Order> orders = orderPage.getContent();
        if (orders.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), sortedPageable, orderPage.getTotalElements());
        }

        // Batch Fetch toàn bộ OrderItem & Payment cho trang đơn hàng hiện tại để triệt tiêu 100% N+1 query
        List<Long> orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());
        Map<Long, List<OrderItem>> itemsByOrderId = orderItemRepository.findByOrderIdInWithDetails(orderIds)
                .stream()
                .collect(Collectors.groupingBy(oi -> oi.getOrder().getId()));

        Map<Long, Payment> paymentByOrderId = paymentRepository.findByOrderIdIn(orderIds)
                .stream()
                .filter(p -> p.getOrder() != null && p.getOrder().getId() != null)
                .collect(Collectors.toMap(p -> p.getOrder().getId(), p -> p, (a, b) -> a));

        List<ReportDrilldownOrderResponse> dtos = new ArrayList<>();
        for (Order o : orders) {
            List<OrderItem> oItems = itemsByOrderId.getOrDefault(o.getId(), Collections.emptyList());
            Payment payment = paymentByOrderId.get(o.getId());

            String payMethodStr = (payment != null && payment.getPaymentMethod() == Payment.PaymentMethod.vnpay)
                    ? "VNPAY"
                    : "COD";
            String payStatusStr = (payment != null && payment.getStatus() != null)
                    ? payment.getStatus().name()
                    : "pending";

            String custName = (o.getShippingAddress() != null && StringUtils.hasText(o.getShippingAddress().getFullName()))
                    ? o.getShippingAddress().getFullName()
                    : (o.getUser() != null ? o.getUser().getName() : "Khách hàng");
            String custPhone = (o.getShippingAddress() != null && StringUtils.hasText(o.getShippingAddress().getPhone()))
                    ? o.getShippingAddress().getPhone()
                    : (o.getUser() != null ? o.getUser().getPhoneNumber() : "");
            String custEmail = o.getUser() != null ? o.getUser().getEmail() : "";
            String staffName = o.getProcessedByStaff() != null ? o.getProcessedByStaff().getName() : null;

            int totalQty = 0;
            List<ReportDrilldownOrderResponse.DrilldownOrderItemDto> itemDtos = new ArrayList<>();
            for (OrderItem oi : oItems) {
                int qty = oi.getQuantity() != null ? oi.getQuantity() : 0;
                totalQty += qty;
                BigDecimal unitPrice = oi.getPrice() != null ? oi.getPrice() : BigDecimal.ZERO;
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(qty));

                Long itemProdId = oi.getProduct() != null ? oi.getProduct().getId() : null;
                Long itemPrimaryCatId = (oi.getProduct() != null && oi.getProduct().getCategory() != null)
                        ? oi.getProduct().getCategory().getId()
                        : null;
                boolean matched = (productId != null && productId.equals(itemProdId))
                        || (!expandedCategoryIds.isEmpty() && itemPrimaryCatId != null && expandedCategoryIds.contains(itemPrimaryCatId));

                itemDtos.add(ReportDrilldownOrderResponse.DrilldownOrderItemDto.builder()
                        .productId(itemProdId)
                        .productName(oi.getProduct() != null ? oi.getProduct().getName() : "Sản phẩm")
                        .sku(oi.getVariant() != null ? oi.getVariant().getSku() : "")
                        .variantLabel(formatCleanVariantLabel(oi.getVariant()))
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .matchedFilter(matched)
                        .build());
            }

            dtos.add(ReportDrilldownOrderResponse.builder()
                    .orderId(o.getId())
                    .orderCode(o.getOrderCode())
                    .createdAt(o.getCreatedAt())
                    .customerName(custName)
                    .customerPhone(custPhone)
                    .customerEmail(custEmail)
                    .status(o.getStatus() != null ? o.getStatus().getValue() : "pending")
                    .paymentMethod(payMethodStr)
                    .paymentStatus(payStatusStr)
                    .totalPrice(o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                    .shippingFee(o.getShippingFee() != null ? o.getShippingFee() : BigDecimal.ZERO)
                    .discountAmount(o.getDiscountAmount() != null ? o.getDiscountAmount() : BigDecimal.ZERO)
                    .finalAmount(o.getFinalAmount() != null ? o.getFinalAmount() : BigDecimal.ZERO)
                    .processedByStaffName(staffName)
                    .totalQuantity(totalQty)
                    .items(itemDtos)
                    .build());
        }

        return new PageImpl<>(dtos, sortedPageable, orderPage.getTotalElements());
    }

    @Override
    public Page<WarehouseDrilldownStockResponse> getDrilldownStocks(
            String stockFilter,
            Long categoryId,
            Pageable pageable
    ) {
        Set<Long> expandedCategoryIds = categoryId != null
                ? expandCategoryHierarchy(categoryId)
                : Collections.emptySet();

        Specification<ProductVariant> spec = (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
            }
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ProductVariantStatus.ACTIVE));

            if (StringUtils.hasText(stockFilter) && !"ALL".equalsIgnoreCase(stockFilter.trim())) {
                String sf = stockFilter.trim().toUpperCase();
                if ("SAFE".equals(sf)) {
                    predicates.add(cb.greaterThan(root.get("stockQuantity"), LOW_STOCK_THRESHOLD));
                } else if ("LOW".equals(sf)) {
                    predicates.add(cb.between(root.get("stockQuantity"), 1, LOW_STOCK_THRESHOLD));
                } else if ("LOW_ALL".equals(sf)) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("stockQuantity"), LOW_STOCK_THRESHOLD));
                } else if ("OUT".equals(sf)) {
                    predicates.add(cb.equal(root.get("stockQuantity"), 0));
                }
            }

            if (!expandedCategoryIds.isEmpty()) {
                Join<ProductVariant, Product> pJoin = root.join("product", JoinType.INNER);
                Join<Product, Category> secCatJoin = pJoin.join("categories", JoinType.LEFT);
                predicates.add(cb.or(
                        pJoin.get("category").get("id").in(expandedCategoryIds),
                        secCatJoin.get("id").in(expandedCategoryIds)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable sortedPageable = PageRequest.of(
                Math.max(0, pageable.getPageNumber()),
                Math.max(1, pageable.getPageSize()),
                Sort.by(Sort.Direction.ASC, "stockQuantity").and(Sort.by(Sort.Direction.DESC, "id"))
        );

        Page<ProductVariant> variantPage = productVariantRepository.findAll(spec, sortedPageable);
        List<WarehouseDrilldownStockResponse> dtos = variantPage.getContent().stream()
                .map(v -> {
                    int qty = v.getStockQuantity() != null ? v.getStockQuantity() : 0;
                    BigDecimal cost = v.getCostPrice() != null ? v.getCostPrice() : BigDecimal.ZERO;
                    BigDecimal price = v.getPrice() != null ? v.getPrice() : BigDecimal.ZERO;
                    BigDecimal unitVal = cost.compareTo(BigDecimal.ZERO) > 0 ? cost : price;
                    BigDecimal invVal = qty > 0 ? unitVal.multiply(BigDecimal.valueOf(qty)) : BigDecimal.ZERO;

                    String stockStatus = qty == 0 ? "OUT" : (qty <= LOW_STOCK_THRESHOLD ? "LOW" : "SAFE");
                    String catName = (v.getProduct() != null && v.getProduct().getCategory() != null)
                            ? v.getProduct().getCategory().getName()
                            : "Chưa phân loại";

                    return WarehouseDrilldownStockResponse.builder()
                            .variantId(v.getId())
                            .productId(v.getProduct() != null ? v.getProduct().getId() : null)
                            .productName(v.getProduct() != null ? v.getProduct().getName() : "Sản phẩm")
                            .categoryName(catName)
                            .sku(v.getSku())
                            .barcode(v.getBarcode())
                            .variantLabel(formatCleanVariantLabel(v))
                            .costPrice(cost)
                            .price(price)
                            .stockQuantity(qty)
                            .inventoryValue(invVal)
                            .stockStatus(stockStatus)
                            .build();
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, sortedPageable, variantPage.getTotalElements());
    }

    @Override
    public Page<WarehouseDrilldownTransactionResponse> getDrilldownTransactions(
            String txFilter,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    ) {
        TransactionType type = null;
        String keyword = null;
        if (StringUtils.hasText(txFilter) && !"ALL".equalsIgnoreCase(txFilter.trim())) {
            String tf = txFilter.trim().toUpperCase();
            if ("IMPORT".equals(tf)) {
                type = TransactionType.IMPORT;
            } else if ("EXPORT".equals(tf)) {
                type = TransactionType.EXPORT;
            } else if ("ORDER_EXPORT".equals(tf)) {
                type = TransactionType.EXPORT;
                keyword = "PXK-DH-";
            } else if ("MANUAL_EXPORT".equals(tf)) {
                type = TransactionType.EXPORT;
            }
        }

        Pageable sortedPageable = PageRequest.of(
                Math.max(0, pageable.getPageNumber()),
                Math.max(1, pageable.getPageSize()),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<InventoryTransaction> txPage = inventoryTransactionRepository.searchTransactions(
                type,
                null,
                keyword,
                fromDate,
                toDate,
                sortedPageable
        );

        final boolean filterManualOnly = "MANUAL_EXPORT".equalsIgnoreCase(txFilter != null ? txFilter.trim() : "");

        List<WarehouseDrilldownTransactionResponse> dtos = txPage.getContent().stream()
                .filter(tx -> !filterManualOnly || (tx.getCode() == null || !tx.getCode().startsWith("PXK-DH-")))
                .map(tx -> {
                    ProductVariant v = tx.getVariant();
                    int qty = tx.getQuantity() != null ? tx.getQuantity() : 0;
                    BigDecimal cost = tx.getUnitCost() != null ? tx.getUnitCost() : BigDecimal.ZERO;
                    return WarehouseDrilldownTransactionResponse.builder()
                            .transactionId(tx.getId())
                            .ticketCode(tx.getCode())
                            .transactionType(tx.getType() != null ? tx.getType().name() : "EXPORT")
                            .productName(v != null && v.getProduct() != null ? v.getProduct().getName() : "Sản phẩm")
                            .sku(v != null ? v.getSku() : "")
                            .variantLabel(formatCleanVariantLabel(v))
                            .quantity(qty)
                            .unitCost(cost)
                            .totalAmount(cost.multiply(BigDecimal.valueOf(qty)))
                            .supplierName(tx.getSupplier() != null ? tx.getSupplier().getName() : null)
                            .createdByName(tx.getCreatedBy() != null ? tx.getCreatedBy().getName() : "Hệ thống")
                            .note(tx.getNote())
                            .createdAt(tx.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, sortedPageable, txPage.getTotalElements());
    }

    /**
     * Ánh xạ linh hoạt mã nhóm trạng thái hoặc tên trạng thái tiếng Việt trên biểu đồ sang danh sách OrderStatus.
     */
    private List<OrderStatus> resolveTargetStatuses(String statusGroup) {
        if (!StringUtils.hasText(statusGroup) || "ALL".equalsIgnoreCase(statusGroup.trim())) {
            return Collections.emptyList();
        }
        String key = statusGroup.trim().toUpperCase();
        switch (key) {
            case "VALID":
                // Đơn hợp lệ: toàn bộ trạng thái trừ hủy / hoàn trả / lỗi thanh toán (khớp công thức KPI Dashboard)
                return List.of(OrderStatus.pending, OrderStatus.confirmed, OrderStatus.processing,
                        OrderStatus.shipped, OrderStatus.shipping, OrderStatus.delivered, OrderStatus.completed);
            case "COMPLETED":
                return List.of(OrderStatus.delivered, OrderStatus.completed);
            case "DELIVERING":
            case "SHIPPING_FUNNEL":
                return List.of(OrderStatus.processing, OrderStatus.shipped, OrderStatus.shipping);
            case "PLACED":
                return List.of(OrderStatus.pending, OrderStatus.confirmed);
            case "CANCELLED":
                return List.of(OrderStatus.cancelled);
            case "RETURNED":
                return List.of(OrderStatus.returned);
            case "CANCELLED_OR_RETURNED":
                return List.of(OrderStatus.cancelled, OrderStatus.returned);
            default:
                OrderStatus exact = OrderStatus.fromString(statusGroup.trim().toLowerCase());
                if (exact != null) {
                    return List.of(exact);
                }
                // Hỗ trợ ánh xạ nhãn tiếng Việt từ biểu đồ tròn Trạng thái đơn phụ trách trên Dashboard
                String lowerVi = statusGroup.trim().toLowerCase();
                if (lowerVi.contains("hoàn tất") || lowerVi.contains("thành công") || lowerVi.contains("đã giao")) {
                    return List.of(OrderStatus.delivered, OrderStatus.completed);
                }
                if (lowerVi.contains("đang giao") || lowerVi.contains("vận chuyển") || lowerVi.contains("đóng gói")) {
                    return List.of(OrderStatus.processing, OrderStatus.shipped, OrderStatus.shipping);
                }
                if (lowerVi.contains("chờ")) {
                    return List.of(OrderStatus.pending);
                }
                if (lowerVi.contains("xác nhận") || lowerVi.contains("đã duyệt")) {
                    return List.of(OrderStatus.confirmed);
                }
                if (lowerVi.contains("hủy")) {
                    return List.of(OrderStatus.cancelled);
                }
                if (lowerVi.contains("hoàn trả") || lowerVi.contains("trả hàng")) {
                    return List.of(OrderStatus.returned);
                }
                return Collections.emptyList();
        }
    }

    /**
     * Mở rộng categoryId thành tập gồm cả danh mục gốc + toàn bộ danh mục con, cháu.
     */
    private Set<Long> expandCategoryHierarchy(Long rootCategoryId) {
        Set<Long> result = new LinkedHashSet<>();
        if (rootCategoryId == null) return result;
        result.add(rootCategoryId);
        List<Category> allCategories = categoryRepository.findAll();
        if (allCategories != null && !allCategories.isEmpty()) {
            Map<Long, List<Category>> childrenMap = allCategories.stream()
                    .filter(c -> c.getParent() != null && c.getParent().getId() != null)
                    .collect(Collectors.groupingBy(c -> c.getParent().getId()));
            collectCategoryChildrenRecursive(rootCategoryId, childrenMap, result, 0);
        }
        return result;
    }

    private void collectCategoryChildrenRecursive(
            Long parentId,
            Map<Long, List<Category>> childrenMap,
            Set<Long> collected,
            int depth
    ) {
        if (parentId == null || depth > 10) return;
        for (Category child : childrenMap.getOrDefault(parentId, Collections.emptyList())) {
            if (child.getId() != null && collected.add(child.getId())) {
                collectCategoryChildrenRecursive(child.getId(), childrenMap, collected, depth + 1);
            }
        }
    }

    /**
     * Định dạng nhãn biến thể sạch đẹp (không bao giờ trả chuỗi JSON thô cho giao diện bảng).
     */
    private String formatCleanVariantLabel(ProductVariant variant) {
        if (variant == null) return "Tiêu chuẩn";
        List<String> parts = new ArrayList<>();

        if (StringUtils.hasText(variant.getAttributes())) {
            String raw = variant.getAttributes().trim();
            if (raw.startsWith("{")) {
                try {
                    Map<String, Object> map = objectMapper.readValue(raw, new TypeReference<Map<String, Object>>() {});
                    if (map != null && !map.isEmpty()) {
                        for (Map.Entry<String, Object> e : map.entrySet()) {
                            if (e.getKey() != null && e.getValue() != null && StringUtils.hasText(String.valueOf(e.getValue()))) {
                                parts.add(e.getKey().trim() + ": " + String.valueOf(e.getValue()).trim());
                            }
                        }
                        if (!parts.isEmpty()) {
                            return String.join(" | ", parts);
                        }
                    }
                } catch (Exception ignored) {
                }
            } else {
                return raw;
            }
        }

        if (StringUtils.hasText(variant.getSize())) {
            parts.add("Size: " + variant.getSize().trim());
        }
        if (StringUtils.hasText(variant.getColor())) {
            parts.add("Màu: " + variant.getColor().trim());
        }
        return parts.isEmpty() ? "Tiêu chuẩn" : String.join(" | ", parts);
    }
}
