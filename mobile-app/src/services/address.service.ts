import { apiClient } from './apiClient';
import { ApiResponse, ShippingAddress } from '../types';

export const addressService = {
  /**
   * Lấy danh sách địa chỉ giao hàng của khách
   */
  async getAddresses(): Promise<ShippingAddress[]> {
    try {
      const res = await apiClient.get<ApiResponse<ShippingAddress[]>>('/customer/addresses');
      return res.data.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Tạo địa chỉ mới
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
  }): Promise<ShippingAddress> {
    const res = await apiClient.post<ApiResponse<ShippingAddress>>('/customer/addresses', data);
    return res.data.data;
  },

  /**
   * Đặt địa chỉ làm mặc định
   */
  async setDefault(id: number): Promise<void> {
    await apiClient.patch(`/customer/addresses/${id}/default`);
  },
};
