import { apiClient } from '../services/apiClient';
import { ApiResponse, GhnDistrict, GhnProvince, GhnWard } from '../types';

/**
 * Mobile Controller gọi API địa giới hành chính & tính phí vận chuyển GHN từ Backend.
 */
export const locationController = {
  async getProvinces(): Promise<ApiResponse<GhnProvince[]>> {
    const res = await apiClient.get<ApiResponse<GhnProvince[]>>('/locations/provinces');
    return res.data;
  },

  async getDistricts(provinceId: number): Promise<ApiResponse<GhnDistrict[]>> {
    const res = await apiClient.get<ApiResponse<GhnDistrict[]>>(
      `/locations/districts?provinceId=${provinceId}`
    );
    return res.data;
  },

  async getWards(districtId: number): Promise<ApiResponse<GhnWard[]>> {
    const res = await apiClient.get<ApiResponse<GhnWard[]>>(
      `/locations/wards?districtId=${districtId}`
    );
    return res.data;
  },

  async calculateShippingFee(
    toDistrictId: number,
    toWardCode: string,
    weight = 500,
    insuranceValue?: number
  ): Promise<ApiResponse<{ shippingFee: number; isFallback?: boolean }>> {
    let url = `/locations/calculate-fee?toDistrictId=${toDistrictId}&toWardCode=${encodeURIComponent(
      toWardCode
    )}&weight=${weight}`;
    if (insuranceValue && insuranceValue > 0) {
      url += `&insuranceValue=${Math.min(Math.round(insuranceValue), 5000000)}`;
    }
    const res = await apiClient.get<ApiResponse<{ shippingFee: number; isFallback?: boolean }>>(url);
    return res.data;
  },
};
