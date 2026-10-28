import { apiClient, ApiResponse } from '@/services/api-client';
import {
  RegisterRestockNotificationRequest,
  RestockNotificationResponse,
  RestockCheckResponse,
} from '@/types/restock-notification';

/**
 * Controller xử lý gọi API Đăng ký nhận thông báo hàng về kho
 */
export const restockNotificationController = {
  /**
   * Đăng ký nhận thông báo khi biến thể sản phẩm có hàng lại
   */
  async register(
    data: RegisterRestockNotificationRequest
  ): Promise<ApiResponse<RestockNotificationResponse>> {
    return apiClient.post<ApiResponse<RestockNotificationResponse>>(
      '/customer/restock-notifications',
      data,
      {
        showSuccessToast: false,
        suppressErrorToast: true,
      }
    );
  },

  /**
   * Hủy đăng ký nhận thông báo
   */
  async cancel(variantId: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      `/customer/restock-notifications/${variantId}`,
      {
        showSuccessToast: false,
        suppressErrorToast: true,
      }
    );
  },

  /**
   * Kiểm tra xem người dùng hiện tại đã đăng ký nhận tin cho biến thể này chưa
   */
  async checkSubscription(variantId: number): Promise<ApiResponse<RestockCheckResponse>> {
    return apiClient.get<ApiResponse<RestockCheckResponse>>(
      `/customer/restock-notifications/check/${variantId}`,
      { suppressErrorToast: true }
    );
  },
};
