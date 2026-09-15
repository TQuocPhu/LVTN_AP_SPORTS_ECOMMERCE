import { apiClient, ApiResponse } from '@/services/api-client';
import { ShippingAddress, ShippingAddressRequest } from '@/types/address';

/**
 * Frontend Controller xử lý các lệnh gọi API Địa chỉ giao hàng.
 */
export const addressController = {
  /**
   * Lấy danh sách địa chỉ giao hàng.
   */
  async getAddresses(): Promise<ApiResponse<ShippingAddress[]>> {
    return apiClient.get<ApiResponse<ShippingAddress[]>>('/customer/addresses');
  },

  /**
   * Thêm địa chỉ giao hàng mới.
   */
  async createAddress(data: ShippingAddressRequest): Promise<ApiResponse<ShippingAddress>> {
    return apiClient.post<ApiResponse<ShippingAddress>>('/customer/addresses', data);
  },

  /**
   * Cập nhật địa chỉ giao hàng hiện có.
   */
  async updateAddress(id: number, data: ShippingAddressRequest): Promise<ApiResponse<ShippingAddress>> {
    return apiClient.put<ApiResponse<ShippingAddress>>(`/customer/addresses/${id}`, data);
  },

  /**
   * Xóa địa chỉ giao hàng.
   */
  async deleteAddress(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/customer/addresses/${id}`);
  },

  /**
   * Đặt địa chỉ làm mặc định.
   */
  async setDefaultAddress(id: number): Promise<ApiResponse<ShippingAddress>> {
    return apiClient<ShippingAddress>(`/customer/addresses/${id}/default`, {
      method: 'PATCH',
    });
  },
};
