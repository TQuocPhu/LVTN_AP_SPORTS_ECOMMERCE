import { apiClient, ApiResponse } from '@/services/api-client';
import {
  AdminOrderDetail,
  AdminOrderFilterParams,
  AdminOrderSummary,
  CancelOrderPayload,
  UpdateOrderStatusPayload,
} from '@/types/admin-order';
import { PageResponse } from '@/types/voucher';

export const adminOrderController = {
  /**
   * Lấy danh sách đơn hàng cho Admin/Staff có lọc, tìm kiếm và phân trang
   */
  async getOrders(params: AdminOrderFilterParams): Promise<ApiResponse<PageResponse<AdminOrderDetail>>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
    if (params.paymentMethod && params.paymentMethod !== 'ALL') queryParams.append('paymentMethod', params.paymentMethod);
    if (params.minPrice !== undefined && params.minPrice !== null) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined && params.maxPrice !== null) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    queryParams.append('page', (params.page ?? 0).toString());
    queryParams.append('size', (params.size ?? 10).toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    return apiClient.get<ApiResponse<PageResponse<AdminOrderDetail>>>(
      `/admin/orders?${queryParams.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy báo cáo thống kê KPI tổng quan đơn hàng
   */
  async getOrderSummary(): Promise<ApiResponse<AdminOrderSummary>> {
    return apiClient.get<ApiResponse<AdminOrderSummary>>('/admin/orders/summary', {
      suppressErrorToast: true,
    });
  },

  /**
   * Xem chi tiết đơn hàng theo ID
   */
  async getOrderById(id: number): Promise<ApiResponse<AdminOrderDetail>> {
    return apiClient.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}`);
  },

  /**
   * Xem chi tiết đơn hàng theo Mã đơn (orderCode)
   */
  async getOrderByCode(orderCode: string): Promise<ApiResponse<AdminOrderDetail>> {
    return apiClient.get<ApiResponse<AdminOrderDetail>>(`/admin/orders/code/${orderCode}`);
  },

  /**
   * Xác nhận đơn hàng (chuyển sang confirmed)
   */
  async confirmOrder(id: number): Promise<ApiResponse<AdminOrderDetail>> {
    return apiClient.put<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}/confirm`, {}, {
      showSuccessToast: true,
    });
  },

  /**
   * Cập nhật trạng thái đơn hàng (processing, shipping, delivered...)
   */
  async updateOrderStatus(id: number, payload: UpdateOrderStatusPayload): Promise<ApiResponse<AdminOrderDetail>> {
    return apiClient.put<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}/status`, payload, {
      showSuccessToast: true,
    });
  },

  /**
   * Hủy đơn hàng kèm lý do
   */
  async cancelOrder(id: number, payload: CancelOrderPayload): Promise<ApiResponse<AdminOrderDetail>> {
    return apiClient.put<ApiResponse<AdminOrderDetail>>(`/admin/orders/${id}/cancel`, payload, {
      showSuccessToast: true,
    });
  },
};
