package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.response.admin.AdminDashboardResponse;
import com.web.ap_sports.dto.response.admin.AdminDashboardResponse.*;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.entity.Payment;
import com.web.ap_sports.entity.ProductImage;
import com.web.ap_sports.entity.ProductVariant;
import com.web.ap_sports.entity.Review;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import com.web.ap_sports.enums.OrderStatus;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    // =========================================================================
    // CÁC HẰNG SỐ CẤU HÌNH MỤC TIÊU DOANH THU & KẾ HOẠCH KPI HỆ THỐNG AP SPORTS
    // =========================================================================

    /**
     * Mục tiêu doanh thu tháng khởi đầu (Baseline Monthly Revenue Target): 10.000.000 VND (10 triệu đồng).
     * CĂN CỨ VÀ LÝ DO LỰA CHỌN:
     * 1. Phù hợp với quy mô thực tế hiện tại của hệ thống đồ án (khoảng 10 - 20 đơn hàng phát sinh ban đầu).
     * 2. Mục tiêu 10 triệu đồng phản ánh sát với giá trị đơn hàng thực tế phát sinh trong cơ sở dữ liệu,
     *    không đưa ra các con số ảo hàng trăm triệu làm sai lệch phân tích tiến độ Pacing.
     */
    public static final long DEFAULT_MONTHLY_REVENUE_TARGET = 10_000_000L;

    /**
     * Tỷ lệ tăng trưởng mục tiêu kỳ vọng: 15% (1.15).
     */
    public static final double DEFAULT_GROWTH_EXPECTATION_RATE = 1.15;

    /**
     * Giới hạn hiển thị số dòng trên các bảng Widget tại Dashboard: TỐI ĐA 5 DÒNG (Top 5).
     * CĂN CỨ:
     * Giúp Dashboard gọn gàng, người quản lý nắm bắt trong 5 giây, có nút chuyển trang chuyên biệt để xem toàn bộ.
     */
    public static final int WIDGET_TOP_LIMIT = 5;

    /**
     * Ngưỡng cảnh báo tồn kho thấp nguy cấp: 5 sản phẩm/biến thể.
     */
    public static final int LOW_STOCK_THRESHOLD = 5;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter COHORT_MONTH_FORMATTER = DateTimeFormatter.ofPattern("'T'MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public AdminDashboardResponse getDashboardData(User currentUser) {
        String roleName = currentUser != null && currentUser.getRole() != null
                ? currentUser.getRole().getName().toUpperCase()
                : "ADMIN";

        LocalDateTime now = LocalDateTime.now();

        // Lấy TOÀN BỘ đơn hàng tích lũy trong hệ thống (100% dữ liệu thật, không bị giới hạn tháng)
        List<Order> allOrders = orderRepository.findAll();

        // Khởi tạo DTO phản hồi
        AdminDashboardResponse.AdminDashboardResponseBuilder responseBuilder = AdminDashboardResponse.builder()
                .userRole(roleName)
                .userName(currentUser != null ? currentUser.getName() : "Quản trị viên");

        // 1. XÂY DỰNG TẦNG 1: SCORECARDS TÍNH TOÁN TOÀN BỘ THEO DỮ LIỆU THẬT
        buildScorecardsByRole(responseBuilder, roleName, currentUser, allOrders, now);

        // 2. XÂY DỰNG TẦNG 2: BI CHARTS (KPI DUAL-LINE, SALES FUNNEL, COHORT RETENTION 100% DỮ LIỆU THẬT)
        buildBiCharts(responseBuilder, roleName, currentUser, allOrders, now);

        // 3. XÂY DỰNG TẦNG 3: CÁC WIDGET TOP 5 DÒNG KÈM LINK CHUYỂN TRANG
        buildQuickWidgetsByRole(responseBuilder, roleName, currentUser);

        return responseBuilder.build();
    }

    /**
     * Xây dựng Scorecards Tầng 1 tính toán toàn bộ đơn hàng thực tế
     */
    private void buildScorecardsByRole(
            AdminDashboardResponse.AdminDashboardResponseBuilder responseBuilder,
            String roleName,
            User currentUser,
            List<Order> allOrders,
            LocalDateTime now
    ) {
        if ("ADMIN".equals(roleName)) {
            // ADMIN: Toàn quyền xem tài chính doanh thu, số đơn, AOV, tỷ lệ hủy
            LocalDateTime startOfThisMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
            LocalDateTime startOfLastMonth = now.minusMonths(1).withDayOfMonth(1).with(LocalTime.MIN);

            long deliveredRevenue = 0;      // Doanh thu đơn đã hoàn tất toàn hệ thống
            long totalOrderValue = 0;       // Tổng giá trị đơn hàng hợp lệ
            long totalOrders = allOrders.size();
            long completedOrders = 0;
            long cancelledOrders = 0;
            long validOrdersCount = 0;
            long cashCod = 0;
            long vnpay = 0;

            // Thống kê riêng cho Tháng này vs Tháng trước để tính % tăng trưởng MoM
            long thisMonthDeliveredRev = 0;
            long thisMonthCompletedOrders = 0;
            long thisMonthValidOrders = 0;
            long thisMonthTotalVal = 0;

            long lastMonthDeliveredRev = 0;
            long lastMonthCompletedOrders = 0;
            long lastMonthValidOrders = 0;
            long lastMonthTotalVal = 0;

            for (Order o : allOrders) {
                OrderStatus st = o.getStatus();
                long amt = o.getFinalAmount() != null ? o.getFinalAmount().longValue() : 0;
                boolean isDelivered = (st == OrderStatus.delivered || st == OrderStatus.completed);
                boolean isCancelled = (st == OrderStatus.cancelled || st == OrderStatus.returned || st == OrderStatus.payment_failed);
                boolean isValid = !isCancelled;
                LocalDateTime createdAt = o.getCreatedAt();

                if (isDelivered) {
                    completedOrders++;
                    deliveredRevenue += amt;
                    totalOrderValue += amt;
                    validOrdersCount++;

                    Payment p = paymentRepository.findByOrderId(o.getId()).orElse(null);
                    if (p != null && p.getPaymentMethod() == Payment.PaymentMethod.vnpay) {
                        vnpay += amt;
                    } else {
                        cashCod += amt;
                    }
                } else if (isCancelled) {
                    cancelledOrders++;
                } else {
                    // pending, confirmed, shipping, processing
                    totalOrderValue += amt;
                    validOrdersCount++;
                }

                // Phân loại đơn theo kỳ Tháng này vs Tháng trước
                if (createdAt != null) {
                    if (!createdAt.isBefore(startOfThisMonth)) {
                        // Tháng này
                        if (isValid) {
                            thisMonthValidOrders++;
                            thisMonthTotalVal += amt;
                            if (isDelivered) {
                                thisMonthCompletedOrders++;
                                thisMonthDeliveredRev += amt;
                            }
                        }
                    } else if (!createdAt.isBefore(startOfLastMonth) && createdAt.isBefore(startOfThisMonth)) {
                        // Tháng trước
                        if (isValid) {
                            lastMonthValidOrders++;
                            lastMonthTotalVal += amt;
                            if (isDelivered) {
                                lastMonthCompletedOrders++;
                                lastMonthDeliveredRev += amt;
                            }
                        }
                    }
                }
            }

            // Doanh thu hiển thị: ưu tiên doanh thu hoàn tất; nếu chưa có đơn giao xong thì hiển thị tổng giá trị đơn đang xử lý
            long revenueToDisplay = deliveredRevenue > 0 ? deliveredRevenue : totalOrderValue;

            // Tính AOV chuẩn xác theo đơn hoàn tất; nếu chưa có đơn hoàn tất thì tính trên đơn hợp lệ
            long aov = completedOrders > 0
                    ? (deliveredRevenue / completedOrders)
                    : (validOrdersCount > 0 ? (totalOrderValue / validOrdersCount) : 0);

            double cancelRate = totalOrders > 0
                    ? BigDecimal.valueOf((double) cancelledOrders * 100 / totalOrders).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;

            // Tính % tăng trưởng so với tháng trước (MoM - Month over Month)
            long currentPeriodRev = thisMonthDeliveredRev > 0 ? thisMonthDeliveredRev : thisMonthTotalVal;
            long previousPeriodRev = lastMonthDeliveredRev > 0 ? lastMonthDeliveredRev : lastMonthTotalVal;
            Double revenueGrowth = calculateGrowthRate(currentPeriodRev, previousPeriodRev);
            Double orderGrowth = calculateGrowthRate(thisMonthValidOrders, lastMonthValidOrders);

            long currentPeriodAov = thisMonthCompletedOrders > 0
                    ? (thisMonthDeliveredRev / thisMonthCompletedOrders)
                    : (thisMonthValidOrders > 0 ? (thisMonthTotalVal / thisMonthValidOrders) : 0);
            long previousPeriodAov = lastMonthCompletedOrders > 0
                    ? (lastMonthDeliveredRev / lastMonthCompletedOrders)
                    : (lastMonthValidOrders > 0 ? (lastMonthTotalVal / lastMonthValidOrders) : 0);
            Double aovGrowth = calculateGrowthRate(currentPeriodAov, previousPeriodAov);

            responseBuilder.adminScorecards(AdminScorecardsDto.builder()
                    .grossRevenue(revenueToDisplay)
                    .revenueGrowthPercent(revenueGrowth)
                    .totalOrders(totalOrders)
                    .orderGrowthPercent(orderGrowth)
                    .averageOrderValue(aov)
                    .aovGrowthPercent(aovGrowth)
                    .cancellationRate(cancelRate)
                    .cashCodRevenue(cashCod)
                    .vnpayRevenue(vnpay)
                    .build());

        } else if ("STAFF".equals(roleName)) {
            // STAFF: Chỉ xem doanh số cá nhân/đội ngũ, số đơn hoàn thành, hoa hồng ước tính
            Long staffId = currentUser != null ? currentUser.getId() : null;
            long handledRevenue = 0;
            long staffCompleted = 0;
            long staffDelivering = 0;
            long staffTotal = 0;

            for (Order o : allOrders) {
                if (staffId == null || (o.getProcessedByStaff() != null && staffId.equals(o.getProcessedByStaff().getId()))) {
                    staffTotal++;
                    OrderStatus st = o.getStatus();
                    long amt = o.getFinalAmount() != null ? o.getFinalAmount().longValue() : 0;

                    if (st == OrderStatus.delivered || st == OrderStatus.completed) {
                        staffCompleted++;
                        handledRevenue += amt;
                    } else if (st == OrderStatus.shipping || st == OrderStatus.shipped || st == OrderStatus.processing || st == OrderStatus.confirmed) {
                        staffDelivering++;
                        handledRevenue += amt;
                    }
                }
            }

            double successRate = staffTotal > 0
                    ? BigDecimal.valueOf((double) staffCompleted * 100 / staffTotal).setScale(1, RoundingMode.HALF_UP).doubleValue()
                    : 100.0;

            long commission = (long) (handledRevenue * 0.02); // 2% hoa hồng
            long kpiBonus = staffCompleted >= 5 ? 500_000L : 0L;

            responseBuilder.staffScorecards(StaffScorecardsDto.builder()
                    .handledRevenue(handledRevenue)
                    .completedOrders(staffCompleted)
                    .successRate(successRate)
                    .estimatedEarnings(commission + kpiBonus)
                    .deliveringOrders(staffDelivering)
                    .build());

        } else if ("WAREHOUSE_MANAGER".equals(roleName)) {
            // WAREHOUSE: TUYỆT ĐỐI KHÔNG XEM DOANH THU TIỀN TỆ. Chỉ xem số lượng hàng hóa & vận đơn
            LocalDateTime startOfToday = now.with(LocalTime.MIN);
            LocalDateTime endOfToday = now.with(LocalTime.MAX);

            // Số lượng hàng xuất/nhập hôm nay
            Long todayOutbound = inventoryTransactionRepository.sumQuantityByTypeInPeriod(
                    TransactionType.EXPORT, startOfToday, endOfToday);
            Long todayInbound = inventoryTransactionRepository.sumQuantityByTypeInPeriod(
                    TransactionType.IMPORT, startOfToday, endOfToday);

            // Đơn hàng đã xác nhận đang chờ kho đóng gói bàn giao shipper GHN
            long pendingPacking = 0;
            for (Order o : allOrders) {
                if (o.getStatus() == OrderStatus.confirmed || o.getStatus() == OrderStatus.processing) {
                    pendingPacking++;
                }
            }

            Long outOfStockCount = productVariantRepository.countOutOfStockVariants();
            Long totalStock = productVariantRepository.sumTotalStockQuantity();

            responseBuilder.warehouseScorecards(WarehouseScorecardsDto.builder()
                    .todayOutboundQuantity(todayOutbound != null ? Math.abs(todayOutbound) : 0L)
                    .todayInboundQuantity(todayInbound != null ? todayInbound : 0L)
                    .pendingPackingOrders(pendingPacking)
                    .outOfStockVariantCount(outOfStockCount != null ? outOfStockCount : 0L)
                    .totalStockQuantity(totalStock != null ? totalStock : 0L)
                    .build());
        }
    }

    /**
     * Xây dựng Biểu đồ BI Tầng 2: Mục tiêu KPI Pace, Phễu chuyển đổi, Cohort 100% DỮ LIỆU THẬT
     */
    private void buildBiCharts(
            AdminDashboardResponse.AdminDashboardResponseBuilder responseBuilder,
            String roleName,
            User currentUser,
            List<Order> allOrders,
            LocalDateTime now
    ) {
        int daysInMonth = now.toLocalDate().lengthOfMonth();
        int currentDay = now.getDayOfMonth();

        // 1. TÍNH TOÁN KPI TARGET PACE THỰC TẾ (100% DỮ LIỆU THẬT)
        // Gom doanh thu thực tế theo ngày trong tháng hiện tại (chỉ gom đơn hợp lệ)
        Map<Integer, Long> dailyRevenueMap = new HashMap<>();
        for (int d = 1; d <= daysInMonth; d++) {
            dailyRevenueMap.put(d, 0L);
        }

        long actualRevenueSoFar = 0;
        long lastMonthDeliveredRev = 0;
        long lastMonthTotalVal = 0;
        long totalOrderValueAllTime = 0;

        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime startOfLastMonth = now.minusMonths(1).withDayOfMonth(1).with(LocalTime.MIN);

        for (Order o : allOrders) {
            long amt = o.getFinalAmount() != null ? o.getFinalAmount().longValue() : 0;
            OrderStatus st = o.getStatus();
            boolean isCancelled = (st == OrderStatus.cancelled || st == OrderStatus.returned || st == OrderStatus.payment_failed);
            boolean isValid = !isCancelled;
            boolean isDelivered = (st == OrderStatus.delivered || st == OrderStatus.completed);
            LocalDateTime createdAt = o.getCreatedAt();

            if (isValid) {
                totalOrderValueAllTime += amt;
            }

            if (createdAt != null) {
                if (!createdAt.isBefore(startOfThisMonth) && isValid) {
                    // Đơn hợp lệ trong tháng hiện tại
                    int day = createdAt.getDayOfMonth();
                    dailyRevenueMap.put(day, dailyRevenueMap.getOrDefault(day, 0L) + amt);
                    actualRevenueSoFar += amt;
                } else if (!createdAt.isBefore(startOfLastMonth) && createdAt.isBefore(startOfThisMonth) && isValid) {
                    // Đơn tháng trước
                    lastMonthTotalVal += amt;
                    if (isDelivered) {
                        lastMonthDeliveredRev += amt;
                    }
                }
            }
        }

        // Tự động hóa thiết lập mục tiêu tháng dựa trên quy mô thực tế
        long monthlyTarget;
        String rationaleNote;

        if (lastMonthDeliveredRev > 0) {
            monthlyTarget = Math.round(lastMonthDeliveredRev * 1.20);
            rationaleNote = String.format(
                    "Mục tiêu tháng %02d/%d (%s) = Doanh thu hoàn tất tháng trước (%s) x 120%% (kỳ vọng tăng trưởng 20%% MoM).",
                    now.getMonthValue(), now.getYear(), formatMoneyVND(monthlyTarget), formatMoneyVND(lastMonthDeliveredRev)
            );
        } else if (lastMonthTotalVal > 0) {
            monthlyTarget = Math.round(lastMonthTotalVal * 1.20);
            rationaleNote = String.format(
                    "Mục tiêu tháng %02d/%d (%s) = Tổng quy mô đơn tháng trước (%s) x 120%%.",
                    now.getMonthValue(), now.getYear(), formatMoneyVND(monthlyTarget), formatMoneyVND(lastMonthTotalVal)
            );
        } else if (totalOrderValueAllTime > 0) {
            monthlyTarget = Math.round(totalOrderValueAllTime * 1.15);
            rationaleNote = String.format(
                    "Mục tiêu tháng %02d/%d (%s) = Quy mô đơn tích lũy sàn (%s) x 115%%.",
                    now.getMonthValue(), now.getYear(), formatMoneyVND(monthlyTarget), formatMoneyVND(totalOrderValueAllTime)
            );
        } else {
            monthlyTarget = 5_000_000L;
            rationaleNote = "Mục tiêu cơ sở cho giai đoạn khởi tạo vận hành hệ thống.";
        }

        List<DailyPacingPointDto> pacingPoints = new ArrayList<>();
        long runningActual = 0;
        for (int d = 1; d <= daysInMonth; d++) {
            long dailyRev = dailyRevenueMap.getOrDefault(d, 0L);
            long targetCumulative = (monthlyTarget * d) / daysInMonth;

            if (d <= currentDay) {
                runningActual += dailyRev;
                pacingPoints.add(DailyPacingPointDto.builder()
                        .date(now.withDayOfMonth(d).format(DATE_FORMATTER))
                        .dayOfMonth(d)
                        .actualCumulative(runningActual)
                        .targetCumulative(targetCumulative)
                        .dailyRevenue(dailyRev)
                        .build());
            } else {
                pacingPoints.add(DailyPacingPointDto.builder()
                        .date(now.withDayOfMonth(d).format(DATE_FORMATTER))
                        .dayOfMonth(d)
                        .actualCumulative(null)
                        .targetCumulative(targetCumulative)
                        .dailyRevenue(0L)
                        .build());
            }
        }

        // Đánh giá trạng thái tiến độ Pacing
        long expectedTargetSoFar = (monthlyTarget * currentDay) / daysInMonth;
        long pacingVariance = runningActual - expectedTargetSoFar;
        String pacingStatus;
        if (pacingVariance >= 200_000L) {
            pacingStatus = "AHEAD";     // Vượt tiến độ
        } else if (pacingVariance >= -200_000L) {
            pacingStatus = "ON_TRACK";  // Đạt kế hoạch
        } else {
            pacingStatus = "BEHIND";    // Chậm tiến độ
        }

        double progressPercent = monthlyTarget > 0
                ? BigDecimal.valueOf((double) runningActual * 100 / monthlyTarget).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        responseBuilder.kpiTargetTrend(KpiTargetTrendDto.builder()
                .monthlyTargetRevenue(monthlyTarget)
                .actualRevenueSoFar(runningActual)
                .progressPercentage(progressPercent)
                .pacingStatus(pacingStatus)
                .pacingVarianceAmount(pacingVariance)
                .rationaleNote(rationaleNote)
                .dailyPacingPoints(pacingPoints)
                .build());

        // 2. PHỄU MUA HÀNG VẬN HÀNH THỰC TẾ (100% DỮ LIỆU THẬT TỪ DATABASE)
        long cartItemsTotal = cartItemRepository.count();
        long placedOrdersTotal = allOrders.size();
        long shippingOrdersTotal = 0;
        long completedOrdersTotal = 0;

        for (Order o : allOrders) {
            OrderStatus st = o.getStatus();
            if (st == OrderStatus.shipping || st == OrderStatus.shipped || st == OrderStatus.delivered || st == OrderStatus.completed) {
                shippingOrdersTotal++;
            }
            if (st == OrderStatus.delivered || st == OrderStatus.completed) {
                completedOrdersTotal++;
            }
        }

        // Tính tỷ lệ rớt hoàn toàn theo số liệu thực tế
        long cartBase = Math.max(cartItemsTotal, placedOrdersTotal);
        double cartToOrderDrop = cartBase > 0 && cartBase >= placedOrdersTotal
                ? BigDecimal.valueOf((double) (cartBase - placedOrdersTotal) * 100 / cartBase).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        double orderToShipDrop = placedOrdersTotal > 0 && placedOrdersTotal >= shippingOrdersTotal
                ? BigDecimal.valueOf((double) (placedOrdersTotal - shippingOrdersTotal) * 100 / placedOrdersTotal).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        double shipToCompleteDrop = shippingOrdersTotal > 0 && shippingOrdersTotal >= completedOrdersTotal
                ? BigDecimal.valueOf((double) (shippingOrdersTotal - completedOrdersTotal) * 100 / shippingOrdersTotal).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        double overallConversion = cartBase > 0
                ? BigDecimal.valueOf((double) completedOrdersTotal * 100 / cartBase).setScale(1, RoundingMode.HALF_UP).doubleValue()
                : (placedOrdersTotal > 0 ? BigDecimal.valueOf((double) completedOrdersTotal * 100 / placedOrdersTotal).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0);

        responseBuilder.salesFunnel(SalesFunnelDto.builder()
                .cartItemsCount(cartBase)
                .placedOrdersCount(placedOrdersTotal)
                .shippingOrdersCount(shippingOrdersTotal)
                .completedOrdersCount(completedOrdersTotal)
                .cartToOrderDropRate(cartToOrderDrop)
                .orderToShipDropRate(orderToShipDrop)
                .shipToCompleteDropRate(shipToCompleteDrop)
                .overallConversionRate(overallConversion)
                .build());

        // 3. MA TRẬN GIỮ CHÂN KHÁCH HÀNG (COHORT RETENTION 100% DỮ LIỆU THẬT TỪ BẢNG ORDERS)
        Map<Long, LocalDateTime> firstOrderDateByUser = new HashMap<>();
        Map<Long, List<LocalDateTime>> allOrderDatesByUser = new HashMap<>();

        for (Order o : allOrders) {
            if (o.getUser() != null && o.getCreatedAt() != null) {
                Long uid = o.getUser().getId();
                LocalDateTime dt = o.getCreatedAt();
                allOrderDatesByUser.computeIfAbsent(uid, k -> new ArrayList<>()).add(dt);

                if (!firstOrderDateByUser.containsKey(uid) || dt.isBefore(firstOrderDateByUser.get(uid))) {
                    firstOrderDateByUser.put(uid, dt);
                }
            }
        }

        Map<String, List<Long>> monthlyCohortMap = new TreeMap<>();
        for (Map.Entry<Long, LocalDateTime> entry : firstOrderDateByUser.entrySet()) {
            String mKey = entry.getValue().format(COHORT_MONTH_FORMATTER);
            monthlyCohortMap.computeIfAbsent(mKey, k -> new ArrayList<>()).add(entry.getKey());
        }

        List<CohortRetentionDto> realCohorts = new ArrayList<>();
        for (Map.Entry<String, List<Long>> entry : monthlyCohortMap.entrySet()) {
            String cohortMonth = entry.getKey();
            List<Long> uids = entry.getValue();
            long totalFirstTime = uids.size();

            long ret30 = 0;
            long ret60 = 0;
            long ret90 = 0;

            for (Long uid : uids) {
                LocalDateTime firstDate = firstOrderDateByUser.get(uid);
                List<LocalDateTime> allDates = allOrderDatesByUser.get(uid);

                boolean has30 = false;
                boolean has60 = false;
                boolean has90 = false;

                for (LocalDateTime d : allDates) {
                    long days = ChronoUnit.DAYS.between(firstDate, d);
                    if (days >= 1 && days <= 30) has30 = true;
                    if (days > 30 && days <= 60) has60 = true;
                    if (days > 60 && days <= 90) has90 = true;
                }

                if (has30) ret30++;
                if (has60) ret60++;
                if (has90) ret90++;
            }

            realCohorts.add(CohortRetentionDto.builder()
                    .cohortMonth(cohortMonth)
                    .totalFirstTimeCustomers(totalFirstTime)
                    .retentionDay30Percent(totalFirstTime > 0 && ret30 > 0 ? Math.round((double) ret30 * 1000.0 / totalFirstTime) / 10.0 : 0.0)
                    .retentionDay60Percent(totalFirstTime > 0 && ret60 > 0 ? Math.round((double) ret60 * 1000.0 / totalFirstTime) / 10.0 : null)
                    .retentionDay90Percent(totalFirstTime > 0 && ret90 > 0 ? Math.round((double) ret90 * 1000.0 / totalFirstTime) / 10.0 : null)
                    .build());
        }

        // Trả về danh sách Cohort thực tế (Nếu chưa có ai thì trả về danh sách rỗng, không fake số)
        responseBuilder.cohortRetention(realCohorts);
    }

    /**
     * Xây dựng các bảng Widget Tầng 3: TỐI ĐA 5 DÒNG (Top 5) kèm link điều hướng theo RBAC
     */
    private void buildQuickWidgetsByRole(
            AdminDashboardResponse.AdminDashboardResponseBuilder responseBuilder,
            String roleName,
            User currentUser
    ) {
        // 1. WIDGET: TOP 5 ĐƠN HÀNG GẦN ĐÂY
        List<Order> latestOrders = orderRepository.findAll(
                PageRequest.of(0, WIDGET_TOP_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent();

        List<RecentOrderWidgetDto> recentOrders = new ArrayList<>();
        for (Order o : latestOrders) {
            String custName = "Khách hàng";
            String custPhone = "---";
            if (o.getShippingAddress() != null) {
                if (o.getShippingAddress().getFullName() != null) {
                    custName = o.getShippingAddress().getFullName();
                }
                if (o.getShippingAddress().getPhone() != null) {
                    custPhone = o.getShippingAddress().getPhone();
                }
            } else if (o.getUser() != null) {
                custName = o.getUser().getName();
                custPhone = o.getUser().getPhoneNumber() != null ? o.getUser().getPhoneNumber() : "---";
            }

            Payment p = paymentRepository.findByOrderId(o.getId()).orElse(null);
            String pMethod = p != null && p.getPaymentMethod() != null ? p.getPaymentMethod().name().toUpperCase() : "COD";

            recentOrders.add(RecentOrderWidgetDto.builder()
                    .orderId(o.getId())
                    .orderCode("ORD-" + o.getId())
                    .customerName(custName)
                    .customerPhone(custPhone)
                    .finalAmount(o.getFinalAmount() != null ? o.getFinalAmount().longValue() : 0L)
                    .paymentMethod(pMethod)
                    .status(o.getStatus() != null ? o.getStatus().name() : "pending")
                    .createdAt(o.getCreatedAt() != null ? o.getCreatedAt().format(TIME_FORMATTER) : "---")
                    .build());
        }
        responseBuilder.recentOrders(recentOrders);

        // 2. WIDGET: TOP 5 SẢN PHẨM BÁN CHẠY (ADMIN & STAFF)
        if ("ADMIN".equals(roleName) || "STAFF".equals(roleName)) {
            List<Object[]> topRows = orderItemRepository.findTopSellingProducts(
                    null, null, PageRequest.of(0, WIDGET_TOP_LIMIT)
            );

            List<TopProductWidgetDto> topProds = new ArrayList<>();
            for (Object[] row : topRows) {
                Long pId = ((Number) row[0]).longValue();
                String pName = (String) row[1];
                String slug = (String) row[2];
                Long sold = row[3] != null ? ((Number) row[3]).longValue() : 0L;
                BigDecimal revBg = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;

                String imgUrl = productImageRepository.findFirstByProductIdAndIsPrimaryTrue(pId)
                        .map(ProductImage::getImagePath)
                        .orElseGet(() -> productImageRepository.findByProductId(pId).stream()
                                .findFirst().map(ProductImage::getImagePath).orElse(""));

                topProds.add(TopProductWidgetDto.builder()
                        .productId(pId)
                        .productName(pName)
                        .slug(slug)
                        .image(imgUrl)
                        .quantitySold(sold)
                        .revenue(revBg.longValue())
                        .build());
            }
            responseBuilder.topSellingProducts(topProds);
        }

        // 3. WIDGET: TOP 5 CẢNH BÁO TỒN KHO HẾT HÀNG (CHỈ ADMIN & WAREHOUSE_MANAGER, ẨN VỚI STAFF)
        if ("ADMIN".equals(roleName) || "WAREHOUSE_MANAGER".equals(roleName)) {
            List<ProductVariant> lowVariants = productVariantRepository.findLowStockVariants(
                    LOW_STOCK_THRESHOLD, PageRequest.of(0, WIDGET_TOP_LIMIT)
            );

            List<LowStockAlertWidgetDto> lowStockAlerts = new ArrayList<>();
            for (ProductVariant v : lowVariants) {
                int stock = v.getStockQuantity() != null ? v.getStockQuantity() : 0;
                lowStockAlerts.add(LowStockAlertWidgetDto.builder()
                        .variantId(v.getId())
                        .sku(v.getSku())
                        .productName(v.getProduct() != null ? v.getProduct().getName() : "Sản phẩm")
                        .size(v.getSize())
                        .color(v.getColor())
                        .stockQuantity(stock)
                        .price(v.getPrice() != null ? v.getPrice().longValue() : 0L)
                        .status(stock == 0 ? "OUT_OF_STOCK" : "LOW_STOCK")
                        .build());
            }
            responseBuilder.lowStockAlerts(lowStockAlerts);
        }

        // 4. WIDGET: TOP 5 ĐÁNH GIÁ MỚI NHẤT (CHỈ ADMIN & STAFF, ẨN VỚI WAREHOUSE_MANAGER)
        if ("ADMIN".equals(roleName) || "STAFF".equals(roleName)) {
            List<Review> latestReviews = reviewRepository.findAll(
                    PageRequest.of(0, WIDGET_TOP_LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"))
            ).getContent();

            List<RecentReviewWidgetDto> reviewDtos = new ArrayList<>();
            for (Review r : latestReviews) {
                reviewDtos.add(RecentReviewWidgetDto.builder()
                        .reviewId(r.getId())
                        .customerName(r.getUser() != null ? r.getUser().getName() : "Khách hàng")
                        .productName(r.getProduct() != null ? r.getProduct().getName() : "Sản phẩm")
                        .rating(r.getRating() != null ? r.getRating() : 5)
                        .comment(r.getComment())
                        .status(r.getStatus())
                        .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().format(TIME_FORMATTER) : "---")
                        .build());
            }
            responseBuilder.recentReviews(reviewDtos);
        }
    }

    /**
     * Tính toán tỷ lệ tăng trưởng phần trăm giữa 2 kỳ (Current Period vs Previous Period).
     * @param current Giá trị kỳ hiện tại
     * @param previous Giá trị kỳ trước
     * @return Tỷ lệ % tăng/giảm làm tròn 1 chữ số thập phân, hoặc null nếu không thể xác định
     */
    private Double calculateGrowthRate(double current, double previous) {
        if (previous > 0) {
            double rate = ((current - previous) / previous) * 100.0;
            return BigDecimal.valueOf(rate).setScale(1, RoundingMode.HALF_UP).doubleValue();
        } else if (current > 0) {
            return 100.0; // Kỳ trước = 0, kỳ này có số liệu -> +100%
        } else {
            return 0.0;   // Cả 2 kỳ đều = 0
        }
    }

    /**
     * Định dạng tiền tệ VND phục vụ ghi chú giải trình mục tiêu trực quan
     */
    private String formatMoneyVND(long amount) {
        return java.text.NumberFormat.getInstance(new Locale("vi", "VN")).format(amount) + " ₫";
    }
}
