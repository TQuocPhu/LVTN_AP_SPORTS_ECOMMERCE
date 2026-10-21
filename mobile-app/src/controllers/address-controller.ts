import { apiClient } from '../services/apiClient';
import { ApiResponse, ShippingAddress } from '../types';

export const addressController = {
  /**
   * Lấy danh sách địa chỉ giao hàng
   */
  async getAddresses(): Promise<ApiResponse<ShippingAddress[]>> {
    const res = await apiClient.get<ApiResponse<ShippingAddress[]>>('/customer/addresses');
    return res.data;
  },

  /**
   * Thêm địa chỉ mới
   */
  async createAddress(data: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<ShippingAddress>> {
    const res = await apiClient.post<ApiResponse<ShippingAddress>>('/customer/addresses', data);
    return res.data;
  },

  /**
   * Đặt địa chỉ làm mặc định
   */
  async setDefault(id: number): Promise<ApiResponse<ShippingAddress>> {
    const res = await apiClient.patch<ApiResponse<ShippingAddress>>(`/customer/addresses/${id}/default`);
    return res.data;
  },

  /**
   * Xóa địa chỉ giao hàng
   */
  async deleteAddress(id: number): Promise<ApiResponse<void>> {
    const res = await apiClient.delete<ApiResponse<void>>(`/customer/addresses/${id}`);
    return res.data;
  },
};
