import { UserResponse } from './auth';

export type TimeRangePreset =
  | 'TODAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_QUARTER'
  | 'ALL_TIME'
  | 'CUSTOM';

export interface ReportFilterParams {
  timeRange: TimeRangePreset;
  startDate?: string;
  endDate?: string;
  staffId?: number | null;
}

export interface TimeSeriesPointResponse {
  date: string;
  label: string;
  revenue: number;
  orderCount: number;
  completedCount: number;
  cancelledCount: number;
}

export interface RevenueOverviewReportResponse {
  totalGrossRevenue: number;
  totalNetRevenue: number;
  totalDeliveredRevenue: number;
  totalDiscountAmount: number;
  totalShippingFee: number;
  totalCostOfGoodsSold?: number;
  grossProfit?: number;
  grossMarginPercent?: number;
  revenueGrowthPercent?: number | null;
  ordersGrowthPercent?: number | null;
  aovGrowthPercent?: number | null;
  totalOrders: number;
  completedOrders: number;
  deliveringOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  successRate: number;
  cancellationRate: number;
  averageOrderValue: number;
  cashPaymentRevenue: number;
  vnpayPaymentRevenue: number;
  timeSeries: TimeSeriesPointResponse[];
}

export interface StaffPerformanceReportResponse {
  staffId: number;
  staffName: string;
  staffEmail: string;
  staffRole: string;
  staffAvatar?: string;
  employeeCode: string;
  totalHandledOrders: number;
  completedOrders: number;
  deliveringOrders: number;
  cancelledOrders: number;
  successRate: number;
  cancellationRate: number;
  deliveredRevenue: number;
  averageOrderValue: number;
  commissionRate: number;
  estimatedCommission: number;
  kpiBonus: number;
  totalEstimatedEarnings: number;
  performanceBadge: 'EXCELLENT' | 'GOOD' | 'STANDARD' | 'NEEDS_IMPROVEMENT' | string;
}

export interface TopProductItemResponse {
  productId: number;
  productName: string;
  slug: string;
  categoryName?: string;
  rootCategoryName?: string;
  image?: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface CategoryRevenueItemResponse {
  categoryId: number;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  percentage: number;
}

export interface TopMerchandiseReportResponse {
  topProducts: TopProductItemResponse[];
  categoryBreakdown: CategoryRevenueItemResponse[];
  rootCategoryBreakdown?: CategoryRevenueItemResponse[];
}

export interface LowStockVariantItemResponse {
  variantId: number;
  productId?: number;
  productName: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  costPrice?: number;
  stockQuantity: number;
  image?: string;
}

export interface WarehouseReportResponse {
  totalInventoryValue: number;
  totalStockQuantity: number;
  lowStockVariantCount: number;
  outOfStockVariantCount: number;
  inboundQuantityInPeriod: number;
  outboundQuantityInPeriod: number;
  orderOutboundQuantity?: number;
  manualOutboundQuantity?: number;
  lowStockVariants: LowStockVariantItemResponse[];
}

export type ReportTabType = 'overview' | 'staff' | 'warehouse' | 'merchandise';

// =========================================================================
// KIỂU DỮ LIỆU CHO MODAL BẢNG THỐNG KÊ CHI TIẾT KHI CLICK BIỂU ĐỒ (DRILL-DOWN)
// =========================================================================

export interface DrilldownOrderItem {
  productId?: number;
  productName: string;
  sku?: string;
  variantLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  matchedFilter?: boolean;
}

export interface ReportDrilldownOrder {
  orderId: number;
  orderCode: string;
  createdAt: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  processedByStaffName?: string | null;
  totalQuantity: number;
  items: DrilldownOrderItem[];
}

export interface WarehouseDrilldownStock {
  variantId: number;
  productId?: number;
  productName: string;
  categoryName: string;
  sku: string;
  barcode?: string;
  variantLabel: string;
  costPrice: number;
  price: number;
  stockQuantity: number;
  inventoryValue: number;
  stockStatus: 'SAFE' | 'LOW' | 'OUT' | string;
}

export interface WarehouseDrilldownTransaction {
  transactionId: number;
  ticketCode: string;
  transactionType: 'IMPORT' | 'EXPORT' | string;
  productName: string;
  sku?: string;
  variantLabel: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  supplierName?: string | null;
  createdByName?: string;
  note?: string;
  createdAt: string;
}

export type ChartDrilldownMode = 'ORDERS' | 'STOCKS' | 'TRANSACTIONS';

export interface ChartDrilldownRequest {
  mode: ChartDrilldownMode;
  title: string;
  subtitle?: string;
  // Bộ lọc cho ORDERS & TRANSACTIONS
  timeRange?: TimeRangePreset;
  startDate?: string;
  endDate?: string;
  specificDate?: string;
  // Bộ lọc chuyên biệt cho ORDERS
  statusGroup?: string;
  paymentMethod?: string;
  productId?: number;
  categoryId?: number;
  // Bộ lọc chuyên biệt cho STOCKS
  stockFilter?: 'ALL' | 'SAFE' | 'LOW' | 'LOW_ALL' | 'OUT' | string;
  useAdminStocksEndpoint?: boolean;
  // Bộ lọc chuyên biệt cho TRANSACTIONS
  txFilter?: 'ALL' | 'IMPORT' | 'EXPORT' | 'ORDER_EXPORT' | 'MANUAL_EXPORT' | string;
}

export interface DailyReconciliationRow {
  date: string;
  label: string;
  orderCount: number;
  grossRevenue: number;
  discountAmount: number;
  shippingFee: number;
  vnpayCollectedRevenue: number;
  codCollectedRevenue: number;
  netCollectedRevenue: number;
  vnpayPrepaidPendingRevenue: number;
  pendingReconciliationRevenue: number;
  cancelledUnpaidRevenue: number;
  pendingRefundRevenue: number;
  refundedRevenue: number;
  lostCancelledRevenue: number;
  collectionRate: number;
}

export interface ReconciliationExceptionItem {
  orderId: number;
  orderCode: string;
  customerName: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  amount: number;
  issueDescription: string;
  createdAt: string;
}

export interface FinancialReconciliationResponse {
  totalOrders: number;
  grossRevenue: number;
  totalDiscountAmount: number;
  totalShippingFee: number;
  vnpayCollectedRevenue: number;
  codCollectedRevenue: number;
  netCollectedRevenue: number;
  vnpayPrepaidPendingRevenue: number;
  pendingReconciliationRevenue: number;
  lostCancelledRevenue: number;
  cancelledUnpaidRevenue: number;
  paymentFailedRevenue: number;
  pendingRefundRevenue: number;
  pendingRefundCount: number;
  refundedRevenue: number;
  refundedCount: number;
  collectionRate: number;
  dailyRows: DailyReconciliationRow[];
  exceptions: ReconciliationExceptionItem[];
}
