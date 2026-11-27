import { apiClient, ApiResponse } from '@/services/api-client';
import {
  AdminDeliveryReviewFilter,
  AdminDeliveryReviewItem,
  AdminDeliveryReviewSummary,
  CreateDeliveryReviewRequest,
  DeliveryReview,
} from '@/types/delivery-review';

/**
 * Frontend Controller xử lý API Đánh Giá Giao Hàng (Shipper) cho Khách hàng & Admin/Staff CSKH.
 */
export const deliveryReviewController = {
  // ======================== CUSTOMER APIs ========================

  async createDeliveryReview(
    orderCode: string,
    payload: CreateDeliveryReviewRequest
  ): Promise<ApiResponse<DeliveryReview>> {
    return apiClient.post<ApiResponse<DeliveryReview>>(
      `/customer/delivery-reviews/order/${encodeURIComponent(orderCode)}`,
      payload
    );
  },

  async getDeliveryReviewByOrderCode(
    orderCode: string
  ): Promise<ApiResponse<DeliveryReview | null>> {
    return apiClient.get<ApiResponse<DeliveryReview | null>>(
      `/customer/delivery-reviews/order/${encodeURIComponent(orderCode)}`,
      { suppressErrorToast: true }
    );
  },

  // ======================== ADMIN / STAFF APIs ========================

  async getAdminDeliveryReviews(
    filter: AdminDeliveryReviewFilter
  ): Promise<
    ApiResponse<{
      content: AdminDeliveryReviewItem[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>
  > {
    const params = new URLSearchParams();
    if (filter.keyword?.trim()) params.set('keyword', filter.keyword.trim());
    if (filter.rating) params.set('rating', String(filter.rating));
    if (filter.status) params.set('status', filter.status);
    if (filter.hasReply !== undefined) params.set('hasReply', String(filter.hasReply));
    params.set('page', String(filter.page ?? 0));
    params.set('size', String(filter.size ?? 10));

    return apiClient.get(`/admin/delivery-reviews?${params.toString()}`);
  },

  async getAdminSummary(): Promise<ApiResponse<AdminDeliveryReviewSummary>> {
    return apiClient.get<ApiResponse<AdminDeliveryReviewSummary>>(
      '/admin/delivery-reviews/summary',
      { suppressErrorToast: true }
    );
  },

  async replyDeliveryReview(
    id: number,
    replyContent: string
  ): Promise<ApiResponse<AdminDeliveryReviewItem>> {
    return apiClient.put<ApiResponse<AdminDeliveryReviewItem>>(
      `/admin/delivery-reviews/${id}/reply`,
      { replyContent }
    );
  },

  async toggleDeliveryReviewStatus(
    id: number
  ): Promise<ApiResponse<AdminDeliveryReviewItem>> {
    return apiClient.patch<ApiResponse<AdminDeliveryReviewItem>>(
      `/admin/delivery-reviews/${id}/toggle-status`
    );
  },
};
