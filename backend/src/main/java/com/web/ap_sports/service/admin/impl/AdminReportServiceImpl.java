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
    private final ProductRepository productRepository;
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

        // Tính Giá vốn hàng bán (COGS) & Lợi nhuận gộp từ các đơn hoàn tất (batch load tránh N+1)
        List<Long> completedOrderIds = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.delivered || o.getStatus() == OrderStatus.completed)
                .map(Order::getId)
                .toList();
        BigDecimal totalCogs = BigDecimal.ZERO;
        if (!completedOrderIds.isEmpty()) {
            List<OrderItem> completedItems = orderItemRepository.findByOrderIdInWithDetails(completedOrderIds);
            for (OrderItem oi : completedItems) {
                BigDecimal unitCost = oi.getCostPrice();
                if (unitCost == null && oi.getVariant() != null) {
                    unitCost = oi.getVariant().getCostPrice();
                }
                if (unitCost != null && oi.getQuantity() != null && oi.getQuantity() > 0) {
                    totalCogs = totalCogs.add(unitCost.multiply(BigDecimal.valueOf(oi.getQuantity())));
                }
            }
        }
        BigDecimal grossProfit = totalNetRevenue.subtract(totalCogs);
        double grossMarginPercent = totalNetRevenue.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(BigDecimal.valueOf(100))
                        .divide(totalNetRevenue, 1, RoundingMode.HALF_UP)
                        .doubleValue()
                : 0.0;

        // Tính % tăng trưởng so với kỳ liền trước khi có khoảng thời gian xác định
        Double revenueGrowthPercent = null;
        Double ordersGrowthPercent = null;
        Double aovGrowthPercent = null;
        if (fromDate != null && toDate != null) {
            java.time.Duration duration = java.time.Duration.between(fromDate, toDate);
            if (duration.toSeconds() > 0) {
                LocalDateTime prevTo = fromDate.minusNanos(1);
                LocalDateTime prevFrom = prevTo.minus(duration);
                List<Order> prevOrders = orderRepository.findOrdersForReport(prevFrom, prevTo, staffId);

                BigDecimal prevDeliveredRev = BigDecimal.ZERO;
                long prevCompletedCount = 0;
                for (Order po : prevOrders) {
                    if (po.getStatus() == OrderStatus.delivered || po.getStatus() == OrderStatus.completed) {
                        prevCompletedCount++;
                        prevDeliveredRev = prevDeliveredRev.add(po.getFinalAmount() != null ? po.getFinalAmount() : BigDecimal.ZERO);
                    }
                }
                BigDecimal prevAov = prevCompletedCount > 0
                        ? prevDeliveredRev.divide(BigDecimal.valueOf(prevCompletedCount), 0, RoundingMode.HALF_UP)
                        : BigDecimal.ZERO;

                revenueGrowthPercent = calcGrowthPercent(totalDeliveredRevenue, prevDeliveredRev);
                ordersGrowthPercent = calcGrowthPercent(BigDecimal.valueOf(totalOrders), BigDecimal.valueOf(prevOrders.size()));
                aovGrowthPercent = calcGrowthPercent(aov, prevAov);
            }
        }

        return RevenueOverviewReportResponse.builder()
                .totalGrossRevenue(
                        totalGrossRevenue.compareTo(BigDecimal.ZERO) > 0 ? totalGrossRevenue : totalDeliveredRevenue)
                .totalNetRevenue(totalNetRevenue)
                .totalDeliveredRevenue(totalDeliveredRevenue)
                .totalDiscountAmount(totalDiscountAmount)
                .totalShippingFee(totalShippingFee)
                .totalCostOfGoodsSold(totalCogs)
                .grossProfit(grossProfit)
                .grossMarginPercent(grossMarginPercent)
                .revenueGrowthPercent(revenueGrowthPercent)
                .ordersGrowthPercent(ordersGrowthPercent)
                .aovGrowthPercent(aovGrowthPercent)
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

    private double calcGrowthPercent(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return (current != null && current.compareTo(BigDecimal.ZERO) > 0) ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 1, RoundingMode.HALF_UP)
                .doubleValue();
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

        // Nạp cây danh mục một lần để phân giải cả Top SP lẫn Cơ cấu danh mục cha gốc từ bảng trung gian product_categories
        Map<Long, Category> allCatMap = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));

        List<Object[]> topProductRows = orderItemRepository.findTopSellingProducts(fromDate, toDate,
                PageRequest.of(0, finalLimit));
        List<Object[]> deliveredProductSales = orderItemRepository.findDeliveredSalesGroupedByProduct(fromDate, toDate);

        Set<Long> allSoldProductIds = new HashSet<>();
        for (Object[] row : topProductRows) {
            if (row[0] != null) allSoldProductIds.add(((Number) row[0]).longValue());
        }
        for (Object[] row : deliveredProductSales) {
            if (row[0] != null) allSoldProductIds.add(((Number) row[0]).longValue());
        }

        Map<Long, Product> soldProductMap = allSoldProductIds.isEmpty()
                ? Collections.emptyMap()
                : productRepository.findAllWithCategoriesByIdIn(allSoldProductIds).stream()
                        .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        List<TopProductItemResponse> topProducts = new ArrayList<>();
        for (Object[] row : topProductRows) {
            Long productId = ((Number) row[0]).longValue();
            String name = (String) row[1];
            String slug = (String) row[2];
            long qty = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            BigDecimal rev = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;

            Product prod = soldProductMap.get(productId);
            Category leafCat = resolvePrimaryLeafCategory(prod, allCatMap);
            Category rootCat = resolveRootCategory(leafCat, allCatMap);

            String leafCatName = leafCat != null ? leafCat.getName() : "Chưa phân loại";
            String rootCatName = rootCat != null ? rootCat.getName() : leafCatName;

            String image = productImageRepository.findFirstByProductIdAndIsPrimaryTrue(productId)
                    .map(ProductImage::getImagePath)
                    .orElseGet(() -> productImageRepository.findByProductId(productId).stream()
                            .findFirst().map(ProductImage::getImagePath).orElse(""));

            topProducts.add(TopProductItemResponse.builder()
                    .productId(productId)
                    .productName(name)
                    .slug(slug)
                    .categoryName(leafCatName)
                    .rootCategoryName(rootCatName)
                    .image(image)
                    .totalQuantitySold(qty)
                    .totalRevenue(rev)
                    .build());
        }

        // Tổng hợp doanh thu & sản lượng theo Nhánh danh mục (leaf) và Nhóm danh mục cha (root) từ bảng trung gian product_categories
        BigDecimal totalCatRevenue = BigDecimal.ZERO;
        Map<Long, String> leafNameMap = new HashMap<>();
        Map<Long, Long> leafQtyMap = new HashMap<>();
        Map<Long, BigDecimal> leafRevMap = new HashMap<>();

        Map<Long, String> rootNameMap = new HashMap<>();
        Map<Long, Long> rootQtyMap = new HashMap<>();
        Map<Long, BigDecimal> rootRevMap = new HashMap<>();

        for (Object[] row : deliveredProductSales) {
            Long productId = ((Number) row[0]).longValue();
            long qty = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal rev = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            totalCatRevenue = totalCatRevenue.add(rev);

            Product prod = soldProductMap.get(productId);
            Category leafCat = resolvePrimaryLeafCategory(prod, allCatMap);
            Category rootCat = resolveRootCategory(leafCat, allCatMap);

            Long leafId = leafCat != null ? leafCat.getId() : -1L;
            String leafName = leafCat != null ? leafCat.getName() : "Chưa phân loại";
            leafNameMap.put(leafId, leafName);
            leafQtyMap.merge(leafId, qty, Long::sum);
            leafRevMap.merge(leafId, rev, BigDecimal::add);

            Long rootId = rootCat != null ? rootCat.getId() : leafId;
            String rootName = rootCat != null ? rootCat.getName() : leafName;
            rootNameMap.put(rootId, rootName);
            rootQtyMap.merge(rootId, qty, Long::sum);
            rootRevMap.merge(rootId, rev, BigDecimal::add);
        }

        List<CategoryRevenueItemResponse> catList = buildCategoryBreakdownList(leafNameMap, leafQtyMap, leafRevMap, totalCatRevenue);
        List<CategoryRevenueItemResponse> rootCatList = buildCategoryBreakdownList(rootNameMap, rootQtyMap, rootRevMap, totalCatRevenue);

        return TopMerchandiseReportResponse.builder()
                .topProducts(topProducts)
                .categoryBreakdown(catList)
                .rootCategoryBreakdown(rootCatList)
                .build();
    }

    /**
     * Chọn danh mục cụ thể nhất (sâu nhất trong cây danh mục) của sản phẩm từ bảng trung gian `product_categories`,
     * fallback sang `product.getCategory()` nếu bảng trung gian chưa có bản ghi.
     */
    private Category resolvePrimaryLeafCategory(Product product, Map<Long, Category> allCatMap) {
        if (product == null) return null;
        Set<Category> linked = product.getCategories();
        if (linked != null && !linked.isEmpty()) {
            Category best = null;
            int bestDepth = -1;
            for (Category c : linked) {
                Category managed = allCatMap.getOrDefault(c.getId(), c);
                int depth = getCategoryDepth(managed, allCatMap);
                if (depth > bestDepth) {
                    bestDepth = depth;
                    best = managed;
                }
            }
            if (best != null) return best;
        }
        return product.getCategory() != null ? allCatMap.getOrDefault(product.getCategory().getId(), product.getCategory()) : null;
    }

    private int getCategoryDepth(Category category, Map<Long, Category> allCatMap) {
        int depth = 0;
        Category curr = category;
        Set<Long> visited = new HashSet<>();
        while (curr != null && curr.getParent() != null && visited.add(curr.getId())) {
            curr = allCatMap.get(curr.getParent().getId());
            depth++;
        }
        return depth;
    }

    private Category resolveRootCategory(Category category, Map<Long, Category> allCatMap) {
        if (category == null) return null;
        Category rootCat = allCatMap.getOrDefault(category.getId(), category);
        Set<Long> visitedIds = new HashSet<>();
        while (rootCat != null && rootCat.getParent() != null && visitedIds.add(rootCat.getId())) {
            Category parent = allCatMap.get(rootCat.getParent().getId());
            if (parent == null) break;
            rootCat = parent;
        }
        return rootCat;
    }

    private List<CategoryRevenueItemResponse> buildCategoryBreakdownList(
            Map<Long, String> nameMap,
            Map<Long, Long> qtyMap,
            Map<Long, BigDecimal> revMap,
            BigDecimal totalRevenue
    ) {
        List<CategoryRevenueItemResponse> list = new ArrayList<>();
        for (Map.Entry<Long, String> entry : nameMap.entrySet()) {
            Long id = entry.getKey();
            long qty = qtyMap.getOrDefault(id, 0L);
            BigDecimal rev = revMap.getOrDefault(id, BigDecimal.ZERO);
            double pct = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? rev.divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                    : 0.0;
            list.add(CategoryRevenueItemResponse.builder()
                    .categoryId(id)
                    .categoryName(entry.getValue())
                    .totalQuantitySold(qty)
                    .totalRevenue(rev)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }
        list.sort((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()));
        return list;
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
                boolean catMatched = false;
                if (!expandedCategoryIds.isEmpty() && oi.getProduct() != null) {
                    if (oi.getProduct().getCategories() != null) {
                        for (Category c : oi.getProduct().getCategories()) {
                            if (c != null && expandedCategoryIds.contains(c.getId())) {
                                catMatched = true;
                                break;
                            }
                        }
                    }
                    if (!catMatched && oi.getProduct().getCategory() != null) {
                        catMatched = expandedCategoryIds.contains(oi.getProduct().getCategory().getId());
                    }
                }
                boolean matched = (productId != null && productId.equals(itemProdId)) || catMatched;

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

        Map<Long, Category> allCatMapForStocks = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));

        Page<ProductVariant> variantPage = productVariantRepository.findAll(spec, sortedPageable);
        List<WarehouseDrilldownStockResponse> dtos = variantPage.getContent().stream()
                .map(v -> {
                    int qty = v.getStockQuantity() != null ? v.getStockQuantity() : 0;
                    BigDecimal cost = v.getCostPrice() != null ? v.getCostPrice() : BigDecimal.ZERO;
                    BigDecimal price = v.getPrice() != null ? v.getPrice() : BigDecimal.ZERO;
                    BigDecimal unitVal = cost.compareTo(BigDecimal.ZERO) > 0 ? cost : price;
                    BigDecimal invVal = qty > 0 ? unitVal.multiply(BigDecimal.valueOf(qty)) : BigDecimal.ZERO;

                    String stockStatus = qty == 0 ? "OUT" : (qty <= LOW_STOCK_THRESHOLD ? "LOW" : "SAFE");
                    Category leafCat = resolvePrimaryLeafCategory(v.getProduct(), allCatMapForStocks);
                    String catName = leafCat != null ? leafCat.getName() : "Chưa phân loại";

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

    @Override
    public FinancialReconciliationResponse getFinancialReconciliation(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String paymentMethod,
            Long staffId
    ) {
        List<Order> rawOrders = orderRepository.findOrdersForReport(fromDate, toDate, staffId);
        List<Long> orderIds = rawOrders.stream().map(Order::getId).toList();
        Map<Long, Payment> paymentMap = orderIds.isEmpty()
                ? Collections.emptyMap()
                : paymentRepository.findByOrderIdIn(orderIds).stream()
                        .collect(Collectors.toMap(p -> p.getOrder().getId(), p -> p, (a, b) -> a));

        String normalizedMethodFilter = StringUtils.hasText(paymentMethod) ? paymentMethod.trim().toUpperCase() : "ALL";
        DateTimeFormatter fullViDateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        Map<String, FinancialReconciliationResponse.DailyReconciliationRow> dailyMap = new TreeMap<>(Comparator.reverseOrder());
        List<FinancialReconciliationResponse.ReconciliationExceptionItem> exceptions = new ArrayList<>();

        long totalOrders = 0;
        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalShipping = BigDecimal.ZERO;
        BigDecimal totalVnpay = BigDecimal.ZERO;
        BigDecimal totalCod = BigDecimal.ZERO;
        BigDecimal totalCollected = BigDecimal.ZERO;
        BigDecimal totalVnpayPrepaidPending = BigDecimal.ZERO;
        BigDecimal totalPending = BigDecimal.ZERO;
        BigDecimal totalCancelledUnpaid = BigDecimal.ZERO;
        BigDecimal totalPaymentFailed = BigDecimal.ZERO;
        BigDecimal totalPendingRefund = BigDecimal.ZERO;
        long pendingRefundCount = 0;
        BigDecimal totalRefunded = BigDecimal.ZERO;
        long refundedCount = 0;
        BigDecimal totalLost = BigDecimal.ZERO;

        for (Order o : rawOrders) {
            Payment payment = paymentMap.get(o.getId());
            boolean isVnpay = payment != null && payment.getPaymentMethod() == Payment.PaymentMethod.vnpay;
            String methodLabel = isVnpay ? "VNPAY" : "COD";

            if (!"ALL".equals(normalizedMethodFilter) && !normalizedMethodFilter.equals(methodLabel)) {
                continue;
            }

            String dateKey = o.getCreatedAt() != null ? o.getCreatedAt().format(DATE_FORMATTER) : "0000-00-00";
            String dateLabel = o.getCreatedAt() != null ? o.getCreatedAt().format(fullViDateFormatter) : "Không xác định";

            FinancialReconciliationResponse.DailyReconciliationRow row = dailyMap.computeIfAbsent(
                    dateKey,
                    k -> FinancialReconciliationResponse.DailyReconciliationRow.builder()
                            .date(dateKey)
                            .label(dateLabel)
                            .orderCount(0)
                            .grossRevenue(BigDecimal.ZERO)
                            .discountAmount(BigDecimal.ZERO)
                            .shippingFee(BigDecimal.ZERO)
                            .vnpayCollectedRevenue(BigDecimal.ZERO)
                            .codCollectedRevenue(BigDecimal.ZERO)
                            .netCollectedRevenue(BigDecimal.ZERO)
                            .vnpayPrepaidPendingRevenue(BigDecimal.ZERO)
                            .pendingReconciliationRevenue(BigDecimal.ZERO)
                            .cancelledUnpaidRevenue(BigDecimal.ZERO)
                            .pendingRefundRevenue(BigDecimal.ZERO)
                            .refundedRevenue(BigDecimal.ZERO)
                            .lostCancelledRevenue(BigDecimal.ZERO)
                            .collectionRate(0.0)
                            .build()
            );

            BigDecimal amount = o.getFinalAmount() != null ? o.getFinalAmount() : BigDecimal.ZERO;
            BigDecimal discount = o.getDiscountAmount() != null ? o.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal shipping = o.getShippingFee() != null ? o.getShippingFee() : BigDecimal.ZERO;

            totalOrders++;
            totalGross = totalGross.add(amount);
            totalDiscount = totalDiscount.add(discount);
            totalShipping = totalShipping.add(shipping);

            row.setOrderCount(row.getOrderCount() + 1);
            row.setGrossRevenue(row.getGrossRevenue().add(amount));
            row.setDiscountAmount(row.getDiscountAmount().add(discount));
            row.setShippingFee(row.getShippingFee().add(shipping));

            OrderStatus status = o.getStatus();
            Payment.PaymentStatus payStatus = payment != null ? payment.getStatus() : Payment.PaymentStatus.pending;

            boolean isLost = (status == OrderStatus.cancelled || status == OrderStatus.returned || status == OrderStatus.payment_failed);
            boolean isDelivered = (status == OrderStatus.delivered || status == OrderStatus.completed);
            boolean isVnpayPaid = isVnpay && payStatus == Payment.PaymentStatus.completed;
            boolean isRefunded = payStatus == Payment.PaymentStatus.refunded;

            if (isLost || isRefunded) {
                totalLost = totalLost.add(amount);
                row.setLostCancelledRevenue(row.getLostCancelledRevenue().add(amount));

                if (isRefunded) {
                    totalRefunded = totalRefunded.add(amount);
                    refundedCount++;
                    row.setRefundedRevenue(row.getRefundedRevenue().add(amount));
                } else if (isVnpayPaid && (status == OrderStatus.cancelled || status == OrderStatus.returned)) {
                    totalPendingRefund = totalPendingRefund.add(amount);
                    pendingRefundCount++;
                    row.setPendingRefundRevenue(row.getPendingRefundRevenue().add(amount));

                    exceptions.add(FinancialReconciliationResponse.ReconciliationExceptionItem.builder()
                            .orderId(o.getId())
                            .orderCode(o.getOrderCode())
                            .customerName(o.getUser() != null ? o.getUser().getName() : "Khách lẻ")
                            .paymentMethod(methodLabel)
                            .paymentStatus(payStatus.name())
                            .orderStatus(status.name())
                            .amount(amount)
                            .issueDescription("Chờ hoàn tiền thủ công: VNPay đã thu tiền nhưng đơn đã hủy/trả hàng")
                            .createdAt(o.getCreatedAt())
                            .build());
                } else if (status == OrderStatus.payment_failed) {
                    totalPaymentFailed = totalPaymentFailed.add(amount);
                    row.setCancelledUnpaidRevenue(row.getCancelledUnpaidRevenue().add(amount));
                } else {
                    totalCancelledUnpaid = totalCancelledUnpaid.add(amount);
                    row.setCancelledUnpaidRevenue(row.getCancelledUnpaidRevenue().add(amount));
                }
            } else if (isDelivered) {
                totalCollected = totalCollected.add(amount);
                row.setNetCollectedRevenue(row.getNetCollectedRevenue().add(amount));
                if (isVnpay) {
                    totalVnpay = totalVnpay.add(amount);
                    row.setVnpayCollectedRevenue(row.getVnpayCollectedRevenue().add(amount));
                } else {
                    totalCod = totalCod.add(amount);
                    row.setCodCollectedRevenue(row.getCodCollectedRevenue().add(amount));
                }

                if (payStatus != Payment.PaymentStatus.completed) {
                    exceptions.add(FinancialReconciliationResponse.ReconciliationExceptionItem.builder()
                            .orderId(o.getId())
                            .orderCode(o.getOrderCode())
                            .customerName(o.getUser() != null ? o.getUser().getName() : "Khách lẻ")
                            .paymentMethod(methodLabel)
                            .paymentStatus(payStatus != null ? payStatus.name() : "pending")
                            .orderStatus(status.name())
                            .amount(amount)
                            .issueDescription("Đơn đã giao thành công nhưng trạng thái thanh toán chưa chốt completed")
                            .createdAt(o.getCreatedAt())
                            .build());
                }
            } else if (isVnpayPaid) {
                // VNPay đã thanh toán trước tại cổng nhưng đơn đang xử lý/đang giao (chưa hoàn tất giao hàng)
                totalVnpayPrepaidPending = totalVnpayPrepaidPending.add(amount);
                row.setVnpayPrepaidPendingRevenue(row.getVnpayPrepaidPendingRevenue().add(amount));
            } else {
                totalPending = totalPending.add(amount);
                row.setPendingReconciliationRevenue(row.getPendingReconciliationRevenue().add(amount));
            }
        }

        List<FinancialReconciliationResponse.DailyReconciliationRow> rows = new ArrayList<>(dailyMap.values());
        for (FinancialReconciliationResponse.DailyReconciliationRow r : rows) {
            if (r.getGrossRevenue().compareTo(BigDecimal.ZERO) > 0) {
                double rate = r.getNetCollectedRevenue()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(r.getGrossRevenue(), 1, RoundingMode.HALF_UP)
                        .doubleValue();
                r.setCollectionRate(rate);
            }
        }

        double overallRate = 0.0;
        if (totalGross.compareTo(BigDecimal.ZERO) > 0) {
            overallRate = totalCollected
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalGross, 1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return FinancialReconciliationResponse.builder()
                .totalOrders(totalOrders)
                .grossRevenue(totalGross)
                .totalDiscountAmount(totalDiscount)
                .totalShippingFee(totalShipping)
                .vnpayCollectedRevenue(totalVnpay)
                .codCollectedRevenue(totalCod)
                .netCollectedRevenue(totalCollected)
                .vnpayPrepaidPendingRevenue(totalVnpayPrepaidPending)
                .pendingReconciliationRevenue(totalPending)
                .lostCancelledRevenue(totalLost)
                .cancelledUnpaidRevenue(totalCancelledUnpaid)
                .paymentFailedRevenue(totalPaymentFailed)
                .pendingRefundRevenue(totalPendingRefund)
                .pendingRefundCount(pendingRefundCount)
                .refundedRevenue(totalRefunded)
                .refundedCount(refundedCount)
                .collectionRate(overallRate)
                .dailyRows(rows)
                .exceptions(exceptions)
                .build();
    }
}
