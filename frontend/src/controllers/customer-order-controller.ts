import { apiClient } from '@/services/api/client';
import { ApiResponse } from '@/types/api';
import { OrderResponse } from '@/types/order';

export interface PaginatedOrdersResponse {
  content: OrderResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const customerOrderController = {
  /**
   * Lấy danh sách đơn hàng của khách hàng theo bộ lọc trạng thái & phân trang
   */
  async getMyOrders(
    status: string = 'ALL',
    keyword: string = '',
    sortBy: string = 'createdAt',
    sortDir: string = 'DESC',
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PaginatedOrdersResponse>> {
    let url = `/customer/orders/my-orders?status=${encodeURIComponent(
      status
    )}&page=${page}&size=${size}`;
    if (keyword && keyword.trim()) {
      url += `&keyword=${encodeURIComponent(keyword.trim())}`;
    }
    if (sortBy) {
      url += `&sortBy=${encodeURIComponent(sortBy)}`;
    }
    if (sortDir) {
      url += `&sortDir=${encodeURIComponent(sortDir)}`;
    }
    return apiClient.get<ApiResponse<PaginatedOrdersResponse>>(url);
  },

  /**
   * Lấy thông tin chi tiết đơn hàng theo mã đơn
   */
  async getOrderByCode(orderCode: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.get<ApiResponse<OrderResponse>>(`/customer/orders/${encodeURIComponent(orderCode)}`);
  },

  /**
   * Hủy đơn hàng bởi khách hàng (Chỉ hủy được khi đơn chưa gửi/bàn giao bưu cục GHN)
   */
  async cancelMyOrder(
    orderCode: string,
    reason?: string
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.put<ApiResponse<OrderResponse>>(
      `/customer/orders/${encodeURIComponent(orderCode)}/cancel`,
      { reason: reason || 'Khách hàng hủy đơn qua giao diện cá nhân' }
    );
  },

  /**
   * Gửi yêu cầu Trả Hàng / Hoàn Tiền bởi khách hàng (Chỉ khi đơn đã giao thành công)
   */
  async returnMyOrder(
    orderCode: string,
    reason?: string
  ): Promise<ApiResponse<OrderResponse>> {
    return apiClient.put<ApiResponse<OrderResponse>>(
      `/customer/orders/${encodeURIComponent(orderCode)}/return`,
      { reason: reason || 'Khách hàng gửi yêu cầu Trả Hàng / Hoàn Tiền' }
    );
  },
};
