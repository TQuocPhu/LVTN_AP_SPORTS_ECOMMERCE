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
  lowStockVariants: LowStockVariantItemResponse[];
}

export type ReportTabType = 'overview' | 'staff' | 'warehouse' | 'merchandise';
