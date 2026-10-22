import { apiClient, ApiResponse } from '@/services/api-client';
import { AdminOrderDetail, UpdateOrderStatusPayload } from '@/types/admin-order';
import { PageResponse } from '@/types/voucher';

/**
 * Khóa truy cập Portal mô phỏng (phải khớp `app.demo.logistics.key` ở Backend).
 * Portal demo không có đăng nhập nên dùng khóa riêng thay cho JWT.
 */
const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_KEY || 'ap-sports-demo-logistics-key';
const DEMO_HEADERS = { 'X-Demo-Key': DEMO_KEY };

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
