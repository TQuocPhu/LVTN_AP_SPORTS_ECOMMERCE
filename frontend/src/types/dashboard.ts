/**
 * Types cho Bảng Điều Khiển Tổng Quan (Dashboard) & Phân Tích BI AP SPORTS
 */

export interface AdminScorecards {
  grossRevenue: number;              // Tổng doanh thu hoàn tất (VND)
  revenueGrowthPercent: number;      // % tăng trưởng so với kỳ trước
  totalOrders: number;               // Tổng số đơn hàng
  orderGrowthPercent: number;        // % tăng trưởng đơn hàng
  averageOrderValue: number;         // AOV (VND)
  aovGrowthPercent: number;          // % tăng trưởng AOV
  cancellationRate: number;          // Tỷ lệ hủy đơn (%)
  cashCodRevenue: number;            // Doanh thu COD
  vnpayRevenue: number;              // Doanh thu VNPay
}

export interface StaffScorecards {
  handledRevenue: number;            // Doanh số cá nhân tiếp nhận hoàn tất
  completedOrders: number;           // Đơn cá nhân hoàn tất
  successRate: number;               // Tỷ lệ thành công (%)
  estimatedEarnings: number;         // Thu nhập hoa hồng & thưởng KPI ước tính
  deliveringOrders: number;          // Đơn đang giao
}

export interface WarehouseScorecards {
  todayOutboundQuantity: number;     // Lượng hàng xuất hôm nay (Cái)
  todayInboundQuantity: number;      // Lượng hàng nhập hôm nay (Cái)
  pendingPackingOrders: number;      // Đơn đã duyệt chờ đóng gói
  outOfStockVariantCount: number;    // Số biến thể hết hàng (= 0)
  totalStockQuantity: number;        // Tổng lượng hàng tồn kho
}

export interface DailyPacingPoint {
  date: string;                      // YYYY-MM-DD
  dayOfMonth: number;                // 1 -> 30
  actualCumulative: number | null;   // Doanh thu thực tế lũy kế
  targetCumulative: number;          // Mục tiêu lũy kế chuẩn
  dailyRevenue: number;              // Doanh thu riêng ngày đó
}

export interface KpiTargetTrend {
  monthlyTargetRevenue: number;      // Mục tiêu doanh thu tháng (VND)
  actualRevenueSoFar: number;        // Doanh thu thực tế đạt được đến nay
  progressPercentage: number;        // % hoàn thành mục tiêu tổng thể
  pacingStatus: 'AHEAD' | 'ON_TRACK' | 'BEHIND'; // Vượt / Đạt / Chậm tiến độ
  pacingVarianceAmount: number;      // Chênh lệch so với tiến độ ngày
  rationaleNote: string;             // Căn cứ xác lập mục tiêu
  dailyPacingPoints: DailyPacingPoint[];
}

export interface SalesFunnel {
  cartItemsCount: number;            // B1: Thêm vào giỏ
  placedOrdersCount: number;         // B2: Chốt đặt đơn
  shippingOrdersCount: number;       // B3: Đang giao GHN
  completedOrdersCount: number;      // B4: Giao thành công hoàn tất

  cartToOrderDropRate: number;       // Tỷ lệ bỏ quên giỏ (%)
  orderToShipDropRate: number;       // Tỷ lệ hủy trước khi giao (%)
  shipToCompleteDropRate: number;    // Tỷ lệ giao thất bại (%)
  overallConversionRate: number;     // Tỷ lệ chốt đơn thành công toàn phễu (%)
}

export interface CohortRetentionItem {
  cohortMonth: string;               // VD "T07/2026"
  totalFirstTimeCustomers: number;   // Số khách mới mua lần đầu
  retentionDay30Percent: number | null;
  retentionDay60Percent: number | null;
  retentionDay90Percent: number | null;
}

export interface RecentOrderWidget {
  orderId: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  finalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface TopProductWidget {
  productId: number;
  productName: string;
  slug: string;
  image?: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockAlertWidget {
  variantId: number;
  sku: string;
  productName: string;
  size?: string;
  color?: string;
  stockQuantity: number;
  price: number;
  status: 'OUT_OF_STOCK' | 'LOW_STOCK';
}

export interface RecentReviewWidget {
  reviewId: number;
  customerName: string;
  productName: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
}

export interface AdminDashboardData {
  userRole: 'ADMIN' | 'STAFF' | 'WAREHOUSE_MANAGER' | string;
  userName: string;

  adminScorecards?: AdminScorecards;
  staffScorecards?: StaffScorecards;
  warehouseScorecards?: WarehouseScorecards;

  kpiTargetTrend: KpiTargetTrend;
  salesFunnel: SalesFunnel;
  cohortRetention: CohortRetentionItem[];

  recentOrders: RecentOrderWidget[];
  topSellingProducts?: TopProductWidget[];
  lowStockAlerts?: LowStockAlertWidget[];
  recentReviews?: RecentReviewWidget[];
}
