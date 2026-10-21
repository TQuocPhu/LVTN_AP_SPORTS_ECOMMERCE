import { apiClient } from '../services/apiClient';
import { ApiResponse } from '../types';

export const cartController = {
  /**
   * Lấy giỏ hàng trên máy chủ
   */
  async getCart(): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>('/customer/cart');
    return res.data;
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(productId: number, variantId?: number, quantity: number = 1): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>('/customer/cart/items', {
      productId,
      variantId: variantId || null,
      quantity,
    });
    return res.data;
  },

  /**
   * Xóa toàn bộ giỏ hàng trên server
   */
  async clearCart(): Promise<ApiResponse<void>> {
    const res = await apiClient.delete<ApiResponse<void>>('/customer/cart/items');
    return res.data;
  },
};
