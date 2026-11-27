import { apiClient } from '../services/apiClient';
import { ApiResponse, CartItem, Order } from '../types';

export const customerOrderController = {
  /**
   * Lấy danh sách đơn hàng của khách hàng theo trạng thái, phương thức & trạng thái thanh toán
   */
  async getMyOrders(
    status: string = 'ALL',
    page: number = 0,
    size: number = 50,
    paymentMethod: string = 'ALL',
    paymentStatus: string = 'ALL'
  ): Promise<ApiResponse<any>> {
    const params: Record<string, string | number> = { status, page, size };
    if (paymentMethod && paymentMethod !== 'ALL') {
      params.paymentMethod = paymentMethod;
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      params.paymentStatus = paymentStatus;
    }
    const res = await apiClient.get<ApiResponse<any>>('/customer/orders/my-orders', {
      params,
    });
    return res.data;
  },

  /**
   * Lấy chi tiết đơn hàng theo Order Code hoặc ID
   */
  async getOrderByCode(orderCode: string): Promise<ApiResponse<Order>> {
    const res = await apiClient.get<ApiResponse<Order>>(`/customer/orders/${orderCode}`);
    return res.data;
  },

  /**
   * Đồng bộ giỏ hàng và tạo đơn hàng
   */
  async syncAndCreateOrder(data: {
    items: CartItem[];
    shippingAddressId: number;
    paymentMethod: 'COD' | 'VNPAY';
    couponCode?: string;
    note?: string;
    shippingFee?: number;
  }): Promise<ApiResponse<Order>> {
    // 1. Dọn giỏ hàng cũ & thêm sản phẩm mới vào backend cart
    try {
      await apiClient.delete('/customer/cart/items');
    } catch {
      // bỏ qua lỗi nếu giỏ hàng rỗng
    }

    for (const item of data.items) {
      try {
        await apiClient.post('/customer/cart/items', {
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        });
      } catch (err) {
        console.warn('Lỗi khi sync item vào backend cart:', err);
      }
    }

    // 2. Tạo đơn hàng
    const res = await apiClient.post<ApiResponse<Order>>('/customer/orders', {
      shippingAddressId: data.shippingAddressId,
      paymentMethod: data.paymentMethod,
      couponCode: data.couponCode || null,
      note: data.note || null,
      shippingFee: data.shippingFee ?? 30000,
    });
    return res.data;
  },

  /**
   * Xác nhận hoàn tất đơn hàng (Chuyển sang completed)
   */
  async completeOrder(orderCode: string): Promise<ApiResponse<Order>> {
    const res = await apiClient.put<ApiResponse<Order>>(`/customer/orders/${orderCode}/complete`);
    return res.data;
  },

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderCode: string, reason?: string): Promise<ApiResponse<Order>> {
    const res = await apiClient.put<ApiResponse<Order>>(`/customer/orders/${orderCode}/cancel`, {
      reason,
    });
    return res.data;
  },
};
