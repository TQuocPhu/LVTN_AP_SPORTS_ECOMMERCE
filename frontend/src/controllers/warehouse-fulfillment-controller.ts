import { apiClient, ApiResponse } from '@/services/api-client';
import { AdminOrderDetail } from '@/types/admin-order';
import { VerifyOrderPackRequest } from '@/types/order';

/**
 * Controller gọi các API WMS Fulfillment (Kiểm đếm Barcode & Xuất kho đơn hàng)
 */
export const warehouseFulfillmentController = {
  /**
   * Xác nhận kiểm đếm Barcode 100% và đóng gói niêm phong đơn hàng
   */
  async verifyOrderPack(
    orderId: number,
    data: VerifyOrderPackRequest
  ): Promise<ApiResponse<AdminOrderDetail>> {
    return apiClient.post<ApiResponse<AdminOrderDetail>>(
      `/warehouse/fulfillment/orders/${orderId}/verify-pack`,
      data,
      {
        showSuccessToast: false,
        suppressErrorToast: true,
      }
    );
  },

  /**
   * Lấy danh sách các đơn hàng đã duyệt đang chờ kho kiểm đếm đóng gói
   */
  async getOrdersPendingPacking(): Promise<ApiResponse<AdminOrderDetail[]>> {
    return apiClient.get<ApiResponse<AdminOrderDetail[]>>(
      '/warehouse/fulfillment/orders/pending-packing'
    );
  },
};
