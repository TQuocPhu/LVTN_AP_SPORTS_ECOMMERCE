import { apiClient, ApiResponse } from '@/services/api-client';
import { CreateOrderRequest, OrderResponse } from '@/types/order';

export const orderController = {
  /**
   * Tạo đơn hàng mới (COD hoặc VNPay)
   */
  async createOrder(payload: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>('/customer/orders', payload, {
      showSuccessToast: false,
    });
  },

  /**
   * Xử lý callback trả về từ cổng VNPay Sandbox
   */
  async processVNPayReturn(queryParams: Record<string, string>): Promise<ApiResponse<OrderResponse>> {
    const params = new URLSearchParams(queryParams).toString();
    return apiClient.get<ApiResponse<OrderResponse>>(`/customer/orders/vnpay-return?${params}`, {
      suppressErrorToast: true,
    });
  },

  /**
   * Sinh lại liên kết thanh toán VNPay khi thanh toán thất bại
   */
  async retryVNPayPayment(orderCode: String): Promise<ApiResponse<OrderResponse>> {
    return apiClient.post<ApiResponse<OrderResponse>>(`/customer/orders/${orderCode}/retry-vnpay`, {}, {
      showSuccessToast: true,
    });
  },

  /**
   * Lấy danh sách đơn hàng cá nhân của người dùng
   */
  async getMyOrders(page = 0, size = 10): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/customer/orders/my-orders?page=${page}&size=${size}`);
  },

  /**
   * Lấy chi tiết đơn hàng theo mã đơn hàng
   */
  async getOrderByCode(orderCode: string): Promise<ApiResponse<OrderResponse>> {
    return apiClient.get<ApiResponse<OrderResponse>>(`/customer/orders/${orderCode}`);
  },
};
