import { apiClient } from './apiClient';
import { ApiResponse, CartItem, Order } from '../types';

export const orderService = {
  /**
   * Lấy danh sách đơn hàng của khách hàng hiện tại
   */
  async getMyOrders(status = 'ALL'): Promise<Order[]> {
    try {
      const res = await apiClient.get<ApiResponse<any>>('/customer/orders/my-orders', {
        params: { status, size: 50 },
      });
      const data = res.data.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.content)) return data.content;
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Lấy chi tiết đơn hàng theo Order Code hoặc ID
   */
  async getOrderDetail(orderCode: string): Promise<Order> {
    const res = await apiClient.get<ApiResponse<Order>>(`/customer/orders/${orderCode}`);
    return res.data.data;
  },

  /**
   * Đồng bộ sản phẩm từ giỏ hàng mobile và tạo đơn hàng
   */
  async syncAndCreateOrder(data: {
    items: CartItem[];
    shippingAddressId: number;
    paymentMethod: 'COD' | 'VNPAY';
    couponCode?: string;
    note?: string;
  }): Promise<Order> {
    // 1. Dọn dẹp giỏ hàng cũ trên server và thêm sản phẩm hiện tại
    try {
      await apiClient.delete('/customer/cart/items');
    } catch {
      // bỏ qua lỗi nếu giỏ hàng đã rỗng
    }

    for (const item of data.items) {
      try {
        await apiClient.post('/customer/cart/items', {
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
        });
      } catch (err) {
        console.warn('Lỗi khi thêm item vào giỏ hàng backend:', err);
      }
    }

    // 2. Gọi endpoint tạo đơn hàng
    const res = await apiClient.post<ApiResponse<Order>>('/customer/orders', {
      shippingAddressId: data.shippingAddressId,
      paymentMethod: data.paymentMethod,
      couponCode: data.couponCode || null,
      note: data.note || null,
      shippingFee: 30000,
    });
    return res.data.data;
  },

  /**
   * Gửi đánh giá sản phẩm kèm ảnh chụp thực tế
   */
  async submitReview(data: {
    productId: number;
    orderItemId: number;
    rating: number;
    comment: string;
    imageUrls?: string[];
  }): Promise<void> {
    await apiClient.post('/customer/reviews', data);
  },

  /**
   * Xác nhận hoàn tất đơn hàng
   */
  async completeOrder(orderCode: string): Promise<Order> {
    const res = await apiClient.put<ApiResponse<Order>>(`/customer/orders/${orderCode}/complete`);
    return res.data.data;
  },

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderCode: string, reason?: string): Promise<Order> {
    const res = await apiClient.put<ApiResponse<Order>>(`/customer/orders/${orderCode}/cancel`, {
      reason,
    });
    return res.data.data;
  },
};
