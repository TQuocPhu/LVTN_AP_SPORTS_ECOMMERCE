import { apiClient, ApiResponse } from '@/services/api-client';
import {
  ReportFilterParams,
  RevenueOverviewReportResponse,
  StaffPerformanceReportResponse,
  TopMerchandiseReportResponse,
  WarehouseReportResponse,
} from '@/types/report';
import { UserResponse } from '@/types/auth';
import { AdminOrderDetail } from '@/types/admin-order';
import { PageResponse } from '@/types/voucher';

function buildReportQueryParams(params: ReportFilterParams): URLSearchParams {
  const q = new URLSearchParams();
  if (params.timeRange) q.append('timeRange', params.timeRange);
  if (params.startDate) q.append('startDate', params.startDate);
  if (params.endDate) q.append('endDate', params.endDate);
  if (params.staffId !== undefined && params.staffId !== null) {
    q.append('staffId', params.staffId.toString());
  }
  return q;
}

export const reportController = {
  /**
   * Lấy báo cáo tổng quan doanh thu & dòng tiền (Admin)
   */
  async getRevenueOverview(params: ReportFilterParams): Promise<ApiResponse<RevenueOverviewReportResponse>> {
    const q = buildReportQueryParams(params);
    return apiClient.get<ApiResponse<RevenueOverviewReportResponse>>(
      `/admin/reports/overview?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy báo cáo xếp hạng hiệu suất nhân viên (Admin)
   */
  async getStaffPerformance(params: ReportFilterParams): Promise<ApiResponse<StaffPerformanceReportResponse[]>> {
    const q = buildReportQueryParams(params);
    return apiClient.get<ApiResponse<StaffPerformanceReportResponse[]>>(
      `/admin/reports/staff-performance?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy báo cáo Top sản phẩm bán chạy & tỷ trọng danh mục (Admin)
   */
  async getTopMerchandise(params: ReportFilterParams, limit: number = 10): Promise<ApiResponse<TopMerchandiseReportResponse>> {
    const q = buildReportQueryParams(params);
    q.append('limit', limit.toString());
    return apiClient.get<ApiResponse<TopMerchandiseReportResponse>>(
      `/admin/reports/top-merchandise?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy báo cáo tồn kho & hàng sắp hết (Admin)
   */
  async getWarehouseReport(params: ReportFilterParams): Promise<ApiResponse<WarehouseReportResponse>> {
    const q = buildReportQueryParams(params);
    return apiClient.get<ApiResponse<WarehouseReportResponse>>(
      `/admin/reports/warehouse?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy danh sách nhân viên để phục vụ dropdown lọc drill-down (Admin)
   */
  async getStaffDropdownList(): Promise<ApiResponse<UserResponse[]>> {
    return apiClient.get<ApiResponse<UserResponse[]>>(
      '/admin/reports/staff-list',
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy báo cáo hiệu suất cá nhân của nhân viên đang đăng nhập (Staff)
   */
  async getMyStaffPerformance(params: ReportFilterParams): Promise<ApiResponse<StaffPerformanceReportResponse>> {
    const q = buildReportQueryParams(params);
    return apiClient.get<ApiResponse<StaffPerformanceReportResponse>>(
      `/staff/reports/my-performance?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy báo cáo doanh thu cá nhân của nhân viên đang đăng nhập (Staff)
   */
  async getMyStaffRevenue(params: ReportFilterParams): Promise<ApiResponse<RevenueOverviewReportResponse>> {
    const q = buildReportQueryParams(params);
    return apiClient.get<ApiResponse<RevenueOverviewReportResponse>>(
      `/staff/reports/my-revenue?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy danh sách đơn hàng do chính nhân viên phụ trách (Staff)
   */
  async getMyStaffOrders(page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<AdminOrderDetail>>> {
    return apiClient.get<ApiResponse<PageResponse<AdminOrderDetail>>>(
      `/staff/reports/my-orders?page=${page}&size=${size}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy báo cáo kho hàng cho thủ kho (Warehouse Manager)
   */
  async getWarehouseInventory(params: ReportFilterParams): Promise<ApiResponse<WarehouseReportResponse>> {
    const q = buildReportQueryParams(params);
    return apiClient.get<ApiResponse<WarehouseReportResponse>>(
      `/warehouse/reports/inventory?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },
};
