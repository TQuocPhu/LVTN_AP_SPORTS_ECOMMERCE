import { apiClient, ApiResponse, ApiClientOptions } from '@/services/api-client';
import { AdminReviewDetail, AdminReviewFilterRequest } from '@/types/review';
import { PaginatedResponse } from '@/types/product';

export const adminReviewController = {
  /**
   * Lấy danh sách đánh giá phân trang với các bộ lọc dành cho Admin (Hỗ trợ AbortSignal)
   */
  async getAdminReviews(
    params?: AdminReviewFilterRequest,
    options?: ApiClientOptions
  ): Promise<ApiResponse<PaginatedResponse<AdminReviewDetail>>> {
    const searchParams = new URLSearchParams();
    if (params?.rating) searchParams.append('rating', params.rating.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());

    const queryString = searchParams.toString();
    const url = `/admin/reviews${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ApiResponse<PaginatedResponse<AdminReviewDetail>>>(url, {
      suppressErrorToast: true,
      ...options,
    });
  },

  /**
   * Gửi Phản hồi chính thức 1-1 đại diện Shop
   */
  async replyReview(reviewId: number, replyContent: string): Promise<ApiResponse<AdminReviewDetail>> {
    return apiClient.put<ApiResponse<AdminReviewDetail>>(`/admin/reviews/${reviewId}/reply`, { replyContent });
  },

  /**
   * Ẩn hoặc Phê duyệt lại bài đánh giá
   */
  async toggleReviewStatus(reviewId: number): Promise<ApiResponse<AdminReviewDetail>> {
    return apiClient.patch<ApiResponse<AdminReviewDetail>>(`/admin/reviews/${reviewId}/toggle-status`, {});
  },
};
