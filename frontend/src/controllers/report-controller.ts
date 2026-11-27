import { apiClient, ApiResponse } from '@/services/api-client';
import {
  ReportFilterParams,
  RevenueOverviewReportResponse,
  StaffPerformanceReportResponse,
  TopMerchandiseReportResponse,
  WarehouseReportResponse,
  ReportDrilldownOrder,
  WarehouseDrilldownStock,
  WarehouseDrilldownTransaction,
  ChartDrilldownRequest,
  FinancialReconciliationResponse,
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
   * Lấy danh sách đơn hàng do chính nhân viên phụ trách (Staff) có hỗ trợ lọc theo nhóm trạng thái.
   */
  async getMyStaffOrders(
    page: number = 0,
    size: number = 10,
    statusGroup: string = 'ALL'
  ): Promise<ApiResponse<PageResponse<AdminOrderDetail>>> {
    return apiClient.get<ApiResponse<PageResponse<AdminOrderDetail>>>(
      `/staff/reports/my-orders?statusGroup=${encodeURIComponent(statusGroup)}&page=${page}&size=${size}`,
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

  /**
   * Lấy Bảng Đối Soát Tài Chính & Sổ Cái Dòng Tiền Theo Ngày / Kênh Thanh Toán (COD vs VNPay).
   */
  async getFinancialReconciliation(
    params: ReportFilterParams,
    paymentMethod: 'ALL' | 'COD' | 'VNPAY' = 'ALL'
  ): Promise<ApiResponse<FinancialReconciliationResponse>> {
    const q = buildReportQueryParams(params);
    q.append('paymentMethod', paymentMethod);
    return apiClient.get<ApiResponse<FinancialReconciliationResponse>>(
      `/admin/reports/reconciliation?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy bảng chi tiết đơn hàng & biến thể mua khi click vào bất kỳ nút giao biểu đồ Doanh thu / Sản phẩm / Dashboard.
   */
  async getDrilldownOrders(
    req: ChartDrilldownRequest,
    page: number = 0,
    size: number = 8
  ): Promise<ApiResponse<PageResponse<ReportDrilldownOrder>>> {
    const q = new URLSearchParams();
    if (req.timeRange) q.append('timeRange', req.timeRange);
    if (req.startDate) q.append('startDate', req.startDate);
    if (req.endDate) q.append('endDate', req.endDate);
    if (req.specificDate) q.append('specificDate', req.specificDate);
    if (req.statusGroup) q.append('statusGroup', req.statusGroup);
    if (req.paymentMethod) q.append('paymentMethod', req.paymentMethod);
    if (req.productId !== undefined && req.productId !== null) {
      q.append('productId', req.productId.toString());
    }
    if (req.categoryId !== undefined && req.categoryId !== null) {
      q.append('categoryId', req.categoryId.toString());
    }
    q.append('page', page.toString());
    q.append('size', size.toString());

    return apiClient.get<ApiResponse<PageResponse<ReportDrilldownOrder>>>(
      `/admin/reports/drilldown-orders?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy bảng chi tiết Biến thể Tồn kho SKU khi click vào biểu đồ Tồn kho hoặc Cơ cấu Danh mục.
   */
  async getDrilldownStocks(
    req: ChartDrilldownRequest,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PageResponse<WarehouseDrilldownStock>>> {
    const q = new URLSearchParams();
    if (req.stockFilter) q.append('stockFilter', req.stockFilter);
    if (req.categoryId !== undefined && req.categoryId !== null) {
      q.append('categoryId', req.categoryId.toString());
    }
    q.append('page', page.toString());
    q.append('size', size.toString());

    const endpoint = req.useAdminStocksEndpoint
      ? `/admin/reports/drilldown-stocks?${q.toString()}`
      : `/warehouse/reports/drilldown-stocks?${q.toString()}`;

    return apiClient.get<ApiResponse<PageResponse<WarehouseDrilldownStock>>>(endpoint, {
      suppressErrorToast: true,
    });
  },

  /**
   * Lấy bảng chi tiết Phiếu Giao dịch Nhập / Xuất kho khi click vào biểu đồ Luân chuyển kho.
   */
  async getDrilldownTransactions(
    req: ChartDrilldownRequest,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PageResponse<WarehouseDrilldownTransaction>>> {
    const q = new URLSearchParams();
    if (req.txFilter) q.append('txFilter', req.txFilter);
    if (req.timeRange) q.append('timeRange', req.timeRange);
    if (req.startDate) q.append('startDate', req.startDate);
    if (req.endDate) q.append('endDate', req.endDate);
    if (req.specificDate) q.append('specificDate', req.specificDate);
    q.append('page', page.toString());
    q.append('size', size.toString());

    return apiClient.get<ApiResponse<PageResponse<WarehouseDrilldownTransaction>>>(
      `/warehouse/reports/drilldown-transactions?${q.toString()}`,
      { suppressErrorToast: true }
    );
  },
};
