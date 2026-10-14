package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.response.customer.UserResponse;
import com.web.ap_sports.dto.response.report.*;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.Payment;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.admin.AdminReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminReportServiceImpl implements AdminReportService {

    // ==========================================
    // CÁC HẰNG SỐ CẤU HÌNH DOANH SỐ & HOA HỒNG
    // ==========================================
    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("0.02");       // 2% hoa hồng trên doanh thu hoàn thành
    private static final double KPI_SUCCESS_RATE_EXCELLENT_THRESHOLD = 90.0;                 // Ngưỡng xuất sắc: >= 90%
    private static final double KPI_SUCCESS_RATE_GOOD_THRESHOLD = 75.0;                      // Ngưỡng đạt: >= 75%
    private static final BigDecimal KPI_BONUS_AMOUNT = new BigDecimal("1000000");            // Thưởng KPI xuất sắc: 1.000.000 VNĐ
    private static final int DEFAULT_TOP_LIMIT = 10;                                         // Giới hạn hiển thị Top sản phẩm
    private static final int LOW_STOCK_THRESHOLD = 5;                                        // Ngưỡng cảnh báo tồn kho thấp (<= 5)
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter LABEL_FORMATTER = DateTimeFormatter.ofPattern("dd/MM");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public RevenueOverviewReportResponse getRevenueOverview(LocalDateTime fromDate, LocalDateTime toDate, Long staffId) {
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

            TimeSeriesPointResponse point = timeSeriesMap.computeIfAbsent(dateKey, k -> TimeSeriesPointResponse.builder()
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
            boolean isDelivering = (status == OrderStatus.shipping || status == OrderStatus.shipped || status == OrderStatus.processing);
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
        if (totalNetRevenue.compareTo(BigDecimal.ZERO) < 0) totalNetRevenue = BigDecimal.ZERO;

        return RevenueOverviewReportResponse.builder()
                .totalGrossRevenue(totalGrossRevenue.compareTo(BigDecimal.ZERO) > 0 ? totalGrossRevenue : totalDeliveredRevenue)
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
                } else if (status == OrderStatus.shipping || status == OrderStatus.shipped || status == OrderStatus.processing) {
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

            BigDecimal commission = deliveredRevenue.multiply(DEFAULT_COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP);
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
                    .commissionRate(DEFAULT_COMMISSION_RATE.multiply(new BigDecimal("100")))
                    .estimatedCommission(commission)
                    .kpiBonus(bonus)
                    .totalEstimatedEarnings(totalEarnings)
                    .performanceBadge(badge)
                    .build());
        }

        // Sắp xếp bảng xếp hạng: Doanh thu giảm dần, sau đó theo số đơn thành công giảm dần
        result.sort((a, b) -> {
            int cmp = b.getDeliveredRevenue().compareTo(a.getDeliveredRevenue());
            if (cmp != 0) return cmp;
            return Long.compare(b.getCompletedOrders(), a.getCompletedOrders());
        });

        return result;
    }

    @Override
    public TopMerchandiseReportResponse getTopMerchandise(LocalDateTime fromDate, LocalDateTime toDate, Integer limit) {
        int finalLimit = (limit != null && limit > 0) ? limit : DEFAULT_TOP_LIMIT;

        List<Object[]> topProductRows = orderItemRepository.findTopSellingProducts(fromDate, toDate, PageRequest.of(0, finalLimit));
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
        if (totalValue == null) totalValue = BigDecimal.ZERO;

        long totalStock = productVariantRepository.sumTotalStockQuantity();
        long lowStockCount = productVariantRepository.countLowStockVariants(LOW_STOCK_THRESHOLD);
        long outOfStockCount = productVariantRepository.countOutOfStockVariants();

        Long inboundQty = inventoryTransactionRepository.sumQuantityByTypeInPeriod(TransactionType.IMPORT, fromDate, toDate);
        Long manualOutboundQty = inventoryTransactionRepository.sumQuantityByTypeInPeriod(TransactionType.EXPORT, fromDate, toDate);
        if (manualOutboundQty == null) manualOutboundQty = 0L;

        // Tính lượng sản phẩm đã xuất bán theo đơn hàng đã xuất kho bàn giao GHN trở đi (shipped, shipping, delivered, completed)
        List<OrderStatus> outboundStatuses = List.of(
                OrderStatus.shipped,
                OrderStatus.shipping,
                OrderStatus.delivered,
                OrderStatus.completed
        );
        Long orderOutboundQty = orderItemRepository.sumQuantityByOrderStatusesInPeriod(outboundStatuses, fromDate, toDate);
        if (orderOutboundQty == null) orderOutboundQty = 0L;

        long totalOutboundQty = manualOutboundQty + orderOutboundQty;

        List<ProductVariant> lowVariants = productVariantRepository.findLowStockVariants(LOW_STOCK_THRESHOLD, PageRequest.of(0, 15));
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
}
