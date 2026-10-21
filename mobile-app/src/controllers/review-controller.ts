import { apiClient } from '../services/apiClient';
import { ApiResponse, Review } from '../types';

export const reviewController = {
  /**
   * Gửi đánh giá sản phẩm kèm ảnh chụp thực tế
   */
  async submitReview(data: {
    productId: number;
    orderItemId: number;
    rating: number;
    comment: string;
    imageUrls?: string[];
  }): Promise<ApiResponse<Review>> {
    const res = await apiClient.post<ApiResponse<Review>>('/customer/reviews', data);
    return res.data;
  },

  /**
   * Lấy danh sách đánh giá của một sản phẩm
   */
  async getProductReviews(productId: number, page: number = 0, size: number = 10): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>(`/reviews/product/${productId}`, {
      params: { page, size },
    });
    return res.data;
  },

  /**
   * Lấy thống kê số sao và đánh giá tổng quan của sản phẩm
   */
  async getProductReviewSummary(productId: number): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>(`/reviews/summary/${productId}`);
    return res.data;
  },
};
