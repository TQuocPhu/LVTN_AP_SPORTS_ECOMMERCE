package com.web.ap_sports.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO tổng hợp toàn diện cho trang Tổng Quan Dashboard & Phân Tích BI AP SPORTS.
 * Thiết kế theo kiến trúc Strict RBAC (Phân quyền bảo mật theo Role).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    // Vai trò người dùng hiện tại (ADMIN, STAFF, WAREHOUSE_MANAGER)
    private String userRole;
    private String userName;

    // TẦNG 1: 4 SCORECARDS THEO VAI TRÒ
    private AdminScorecardsDto adminScorecards;
    private StaffScorecardsDto staffScorecards;
    private WarehouseScorecardsDto warehouseScorecards;

    // TẦNG 2: BIỂU ĐỒ BI TRỰC QUAN
    private KpiTargetTrendDto kpiTargetTrend;
    private SalesFunnelDto salesFunnel;
    private List<CohortRetentionDto> cohortRetention;

    // CÁC BIỂU ĐỒ BỔ SUNG CHUẨN ENTERPRISE DASHBOARD
    private List<CategoryShareDto> categoryShares;               // Biểu đồ tròn Cơ cấu danh mục sản phẩm (Admin & Warehouse)
    private List<RevenueComparisonDto> revenueComparison;        // Biểu đồ cột kép so sánh doanh thu mặc định (Admin)
    private List<MonthlyWeeklyRevenueDto> monthlyWeeklyRevenues; // Dữ liệu doanh thu 4 tuần của các tháng cho phép chọn tùy biến so sánh (Admin)
    private List<WarehouseActivityTrendDto> warehouseActivityTrend; // Biểu đồ cột kép Nhập - Xuất kho 7 ngày (Warehouse)
    private List<StaffOrderStatusShareDto> staffOrderStatusShare;   // Biểu đồ tròn Trạng thái đơn hàng phụ trách (Staff)

    // TẦNG 3: CÁC WIDGET TOP 5 DÒNG (KÈM LINK ĐIỀU HƯỚNG THEO QUYỀN)
    private List<RecentOrderWidgetDto> recentOrders;      // Top 5 đơn hàng gần đây
    private List<TopProductWidgetDto> topSellingProducts;  // Top 5 sản phẩm bán chạy (Admin & Staff)
    private List<LowStockAlertWidgetDto> lowStockAlerts;   // Top 5 SKU hết hàng (Admin & Warehouse)
    private List<RecentReviewWidgetDto> recentReviews;     // Top 5 đánh giá mới nhất (Admin & Staff)

    // ==========================================
    // 1. DTO SCORECARDS TẦNG 1
    // ==========================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminScorecardsDto {
        private Long grossRevenue;              // Tổng doanh thu hoàn thành (VND)
        private Double revenueGrowthPercent;    // % tăng trưởng so với kỳ trước
        private Long totalOrders;               // Tổng số đơn hàng
        private Double orderGrowthPercent;      // % tăng trưởng đơn hàng
        private Long averageOrderValue;         // Giá trị đơn trung bình (AOV - VND)
        private Double aovGrowthPercent;        // % tăng trưởng AOV
        private Double cancellationRate;        // Tỷ lệ đơn bị hủy/hoàn (%)
        private Long cashCodRevenue;            // Doanh thu COD
        private Long vnpayRevenue;              // Doanh thu VNPay
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffScorecardsDto {
        private Long handledRevenue;            // Doanh số cá nhân tiếp nhận hoàn tất
        private Long completedOrders;           // Số đơn cá nhân hoàn tất
        private Double successRate;             // Tỷ lệ giao thành công cá nhân (%)
        private Long estimatedEarnings;         // Thu nhập hoa hồng & thưởng KPI ước tính
        private Long deliveringOrders;          // Đơn đang trên đường giao
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseScorecardsDto {
        private Long todayOutboundQuantity;     // Số lượng hàng xuất kho hôm nay (Cái)
        private Long todayInboundQuantity;      // Số lượng hàng nhập kho hôm nay (Cái)
        private Long pendingPackingOrders;      // Đơn hàng đã duyệt chờ xuất kho đóng gói
        private Long outOfStockVariantCount;    // Số biến thể đã hết hàng hoàn toàn (SKU)
        private Long totalStockQuantity;        // Tổng lượng hàng tồn kho toàn bộ
    }

    // ==========================================
    // 2. DTO BIỂU ĐỒ BI TẦNG 2
    // ==========================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KpiTargetTrendDto {
        private Long monthlyTargetRevenue;      // Mục tiêu doanh thu cả tháng (VND)
        private Long actualRevenueSoFar;        // Doanh thu thực tế tích lũy tính đến nay
        private Double progressPercentage;      // % hoàn thành mục tiêu tổng thể
        private String pacingStatus;            // AHEAD (Vượt tiến độ), ON_TRACK (Bám sát), BEHIND (Chậm tiến độ)
        private Long pacingVarianceAmount;      // Chênh lệch VND so với tiến độ lý thuyết của ngày hôm nay
        private String rationaleNote;           // Ghi chú giải thích căn cứ thiết lập mục tiêu
        private List<DailyPacingPointDto> dailyPacingPoints; // Các điểm vẽ đường Actual vs Target Pace
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPacingPointDto {
        private String date;                    // YYYY-MM-DD
        private Integer dayOfMonth;             // 1, 2, ..., 30
        private Long actualCumulative;          // Doanh thu thực tế lũy kế đến ngày này
        private Long targetCumulative;          // Mục tiêu lũy kế chuẩn đến ngày này
        private Long dailyRevenue;              // Doanh thu riêng ngày hôm đó
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesFunnelDto {
        private Long cartItemsCount;            // Bước 1: Sản phẩm khách đã thêm vào giỏ hàng
        private Long placedOrdersCount;         // Bước 2: Đơn hàng đã chốt đặt thành công
        private Long shippingOrdersCount;       // Bước 3: Đơn đã xuất kho và đang giao hàng GHN
        private Long completedOrdersCount;      // Bước 4: Đơn hàng giao thành công hoàn tất

        // Tỷ lệ chuyển đổi & Tỷ lệ rơi rụng giữa các bước
        private Double cartToOrderDropRate;     // Tỷ lệ bỏ rơi giỏ hàng (%)
        private Double orderToShipDropRate;     // Tỷ lệ hủy trước khi giao (%)
        private Double shipToCompleteDropRate;  // Tỷ lệ giao thất bại / bom hàng (%)
        private Double overallConversionRate;   // Tỷ lệ chốt đơn thành công toàn phễu (%)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CohortRetentionDto {
        private String cohortMonth;             // Nhóm tháng: VD "T07/2026", "T08/2026", "T09/2026"
        private Long totalFirstTimeCustomers;   // Tổng số khách hàng mới mua lần đầu trong tháng đó
        private Double retentionDay30Percent;   // Tỷ lệ quay lại mua sau 30 ngày (%)
        private Double retentionDay60Percent;   // Tỷ lệ quay lại mua sau 60 ngày (%)
        private Double retentionDay90Percent;   // Tỷ lệ quay lại mua sau 90 ngày (%)
    }

    // ==========================================
    // 3. DTO CÁC BẢNG WIDGET TẦNG 3 (TỐI ĐA 5 DÒNG)
    // ==========================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentOrderWidgetDto {
        private Long orderId;
        private String orderCode;
        private String customerName;
        private String customerPhone;
        private Long finalAmount;
        private String paymentMethod;
        private String status;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductWidgetDto {
        private Long productId;
        private String productName;
        private String slug;
        private String image;
        private Long quantitySold;
        private Long revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LowStockAlertWidgetDto {
        private Long variantId;
        private String sku;
        private String productName;
        private String size;
        private String color;
        private Integer stockQuantity;
        private Long price;
        private String status;                  // OUT_OF_STOCK (Hết sạch), LOW_STOCK (Sắp hết)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentReviewWidgetDto {
        private Long reviewId;
        private String customerName;
        private String productName;
        private Integer rating;
        private String comment;
        private String status;
        private String createdAt;
    }

    // ==========================================
    // 4. DTO CÁC BIỂU ĐỒ BỔ SUNG (BI CHARTS)
    // ==========================================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryShareDto {
        private Long categoryId;
        private String categoryName;
        private Long productCount;          // Số lượng sản phẩm thuộc danh mục
        private Long stockQuantity;         // Tổng số lượng tồn kho (cái)
        private Double percentage;          // Tỷ lệ %
        private String color;               // Mã màu hiển thị trên biểu đồ
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueComparisonDto {
        private String periodName;          // Tuần 1, Tuần 2, Tuần 3, Tuần 4
        private Long currentMonthRevenue;   // Doanh thu tháng này (T10/2026)
        private Long previousMonthRevenue;  // Doanh thu tháng trước (T09/2026)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WarehouseActivityTrendDto {
        private String date;                // DD/MM
        private Long inboundQuantity;       // Số lượng nhập kho
        private Long outboundQuantity;      // Số lượng xuất kho
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StaffOrderStatusShareDto {
        private String statusName;          // Tên trạng thái (Hoàn tất, Đang giao, Đang đóng gói...)
        private Long count;                 // Số lượng đơn
        private Double percentage;          // Tỷ lệ %
        private String color;               // Mã màu
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyWeeklyRevenueDto {
        private String monthKey;            // YYYY-MM, ví dụ "2026-10", "2026-09"
        private String monthLabel;          // "Tháng 10/2026", "Tháng 09/2026"
        private List<Long> weeklyRevenues;  // Doanh thu 4 tuần [Tuần 1, Tuần 2, Tuần 3, Tuần 4]
        private Long totalRevenue;          // Tổng doanh thu của tháng đó
    }
}
