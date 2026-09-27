import { apiClient, ApiResponse } from '@/services/api-client';
import { AdminOrderDetail, UpdateOrderStatusPayload } from '@/types/admin-order';
import { PageResponse } from '@/types/voucher';

export const demoLogisticsController = {
  /**
   * Truy vấn danh sách đơn hàng cho các Demo Portals (GHN Station, Carrier Transit, Shipper App)
   */
  async getDemoOrders(status: string, page = 0, size = 10): Promise<ApiResponse<PageResponse<AdminOrderDetail>>> {
    return apiClient.get<ApiResponse<PageResponse<AdminOrderDetail>>>(
      `/demo/logistics/orders?status=${status}&page=${page}&size=${size}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Cập nhật trạng thái đơn hàng từ các Demo Portals
   */
  async updateOrderStatus(id: number, payload: UpdateOrderStatusPayload): Promise<ApiResponse<AdminOrderDetail>> {
    return apiClient.put<ApiResponse<AdminOrderDetail>>(`/demo/logistics/orders/${id}/status`, payload, {
      showSuccessToast: true,
    });
  },
};
