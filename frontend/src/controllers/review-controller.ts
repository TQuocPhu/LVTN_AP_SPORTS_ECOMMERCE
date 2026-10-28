import { apiClient, ApiResponse } from '@/services/api-client';
import { Review, ProductReviewSummary, CreateReviewRequest } from '@/types/review';
import { PaginatedResponse } from '@/types/product';

export const reviewController = {
  /**
   * Lấy danh sách đánh giá sản phẩm công khai
   */
  async getProductReviews(
    productId: number,
    rating?: number,
    withImagesOnly?: boolean,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Review>>> {
    const searchParams = new URLSearchParams();
    if (rating) searchParams.append('rating', rating.toString());
    if (withImagesOnly) searchParams.append('withImagesOnly', 'true');
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());

    const url = `/reviews/product/${productId}?${searchParams.toString()}`;
    return apiClient.get<ApiResponse<PaginatedResponse<Review>>>(url, { suppressErrorToast: true });
  },

  /**
   * Lấy tổng quan điểm sao trung bình & phân bổ sao của sản phẩm
   */
  async getProductReviewSummary(productId: number): Promise<ApiResponse<ProductReviewSummary>> {
    return apiClient.get<ApiResponse<ProductReviewSummary>>(`/reviews/summary/${productId}`, { suppressErrorToast: true });
  },

  /**
   * Khách hàng gửi bài đánh giá sản phẩm trong đơn hàng đã giao thành công
   */
  async createReview(request: CreateReviewRequest): Promise<ApiResponse<Review>> {
    return apiClient.post<ApiResponse<Review>>('/customer/reviews', request, {
      showSuccessToast: false,
      suppressErrorToast: true,
    });
  },

  /**
   * Kiểm tra danh sách OrderItem IDs đã được đánh giá chưa
   */
  async checkReviewedOrderItems(orderItemIds: number[]): Promise<ApiResponse<number[]>> {
    return apiClient.post<ApiResponse<number[]>>('/customer/reviews/check-reviewed', orderItemIds, { suppressErrorToast: true });
  },
};
