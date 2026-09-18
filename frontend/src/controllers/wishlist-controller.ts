import { apiClient, ApiResponse } from '@/services/api-client';
import { WishlistResponse, WishlistStatusResponse } from '@/types/wishlist';

export interface PaginatedWishlist {
  content: WishlistResponse[];
  totalElements: number;
  totalPages: number;
}

/**
 * Frontend Controller xử lý các lệnh gọi API Danh sách yêu thích (/api/v1/customer/wishlist).
 * Đã cấu hình { showSuccessToast: false } để tránh lặp trùng Toastr notification với WishlistContext.
 */
export const wishlistController = {
  /**
   * Lấy danh sách sản phẩm yêu thích (phân trang).
   */
  async getWishlist(page = 0, size = 12): Promise<ApiResponse<PaginatedWishlist>> {
    return apiClient.get<ApiResponse<PaginatedWishlist>>(`/customer/wishlist?page=${page}&size=${size}`, {
      suppressErrorToast: true,
    });
  },

  /**
   * Toggle Bật / Tắt trạng thái yêu thích sản phẩm.
   */
  async toggleWishlist(productId: number): Promise<ApiResponse<WishlistStatusResponse>> {
    return apiClient.post<ApiResponse<WishlistStatusResponse>>(
      `/customer/wishlist/toggle/${productId}`,
      undefined,
      { showSuccessToast: false }
    );
  },

  /**
   * Thêm sản phẩm vào danh sách yêu thích.
   */
  async addToWishlist(productId: number): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      `/customer/wishlist/${productId}`,
      undefined,
      { showSuccessToast: false }
    );
  },

  /**
   * Xóa sản phẩm khỏi danh sách yêu thích.
   */
  async removeFromWishlist(productId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/customer/wishlist/${productId}`,
      { showSuccessToast: false }
    );
  },

  /**
   * Lấy danh sách Product IDs đã thả tim của người dùng hiện tại.
   */
  async getWishlistProductIds(): Promise<ApiResponse<number[]>> {
    return apiClient.get<ApiResponse<number[]>>('/customer/wishlist/ids', { suppressErrorToast: true });
  },
};
