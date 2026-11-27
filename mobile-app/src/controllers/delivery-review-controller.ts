import { apiClient } from '../services/apiClient';
import { ApiResponse, DeliveryReview } from '../types';

export const deliveryReviewController = {
  async createDeliveryReview(
    orderCode: string,
    payload: { rating: number; tags: string[]; comment?: string }
  ): Promise<ApiResponse<DeliveryReview>> {
    const res = await apiClient.post<ApiResponse<DeliveryReview>>(
      `/customer/delivery-reviews/order/${encodeURIComponent(orderCode)}`,
      payload
    );
    return res.data;
  },

  async getDeliveryReviewByOrderCode(
    orderCode: string
  ): Promise<ApiResponse<DeliveryReview | null>> {
    const res = await apiClient.get<ApiResponse<DeliveryReview | null>>(
      `/customer/delivery-reviews/order/${encodeURIComponent(orderCode)}`
    );
    return res.data;
  },
};
