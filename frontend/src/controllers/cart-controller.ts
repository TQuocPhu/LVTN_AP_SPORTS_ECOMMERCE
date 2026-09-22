import { apiClient, ApiResponse } from '@/services/api-client';
import { AddToCartPayload, CartItem, CartSummary, UpdateCartItemPayload } from '@/types/cart';

/**
 * Frontend Controller cho Quản lý giỏ hàng (/api/v1/customer/cart)
 */
export const cartController = {
  /**
   * Lấy thông tin giỏ hàng của người dùng hiện tại
   */
  async getCart(): Promise<ApiResponse<CartSummary>> {
    return apiClient.get<ApiResponse<CartSummary>>('/customer/cart', {
      suppressErrorToast: true,
    });
  },

  /**
   * Thêm sản phẩm (hoặc biến thể) vào giỏ hàng
   */
  async addToCart(payload: AddToCartPayload): Promise<ApiResponse<CartItem>> {
    return apiClient.post<ApiResponse<CartItem>>('/customer/cart/items', payload, {
      showSuccessToast: true,
    });
  },

  /**
   * Cập nhật số lượng của 1 dòng giỏ hàng
   */
  async updateCartItem(id: number, payload: UpdateCartItemPayload): Promise<ApiResponse<CartItem>> {
    return apiClient.put<ApiResponse<CartItem>>(`/customer/cart/items/${id}`, payload, {
      showSuccessToast: false,
    });
  },

  /**
   * Xóa 1 dòng sản phẩm khỏi giỏ hàng
   */
  async removeCartItem(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/customer/cart/items/${id}`, {
      showSuccessToast: true,
    });
  },

  /**
   * Dọn dẹp toàn bộ giỏ hàng
   */
  async clearCart(): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>('/customer/cart/items', {
      showSuccessToast: true,
    });
  },
};
