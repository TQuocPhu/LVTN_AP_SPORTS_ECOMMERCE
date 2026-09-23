import { apiClient, ApiResponse } from '@/services/api-client';
import { GhnProvince, GhnDistrict, GhnWard } from '@/types/address';

/**
 * Frontend Controller xử lý các lệnh gọi API dữ liệu địa lý (GHN Location Master Data).
 * Dùng để lấy danh sách Tỉnh/Thành, Quận/Huyện, Phường/Xã cho Dropdown địa chỉ giao hàng.
 */
export const locationController = {
  /**
   * Lấy danh sách tất cả Tỉnh/Thành phố.
   */
  async getProvinces(): Promise<ApiResponse<GhnProvince[]>> {
    return apiClient.get<ApiResponse<GhnProvince[]>>('/locations/provinces', {
      suppressErrorToast: true,
    });
  },

  /**
   * Lấy danh sách Quận/Huyện theo Tỉnh/Thành.
   */
  async getDistricts(provinceId: number): Promise<ApiResponse<GhnDistrict[]>> {
    return apiClient.get<ApiResponse<GhnDistrict[]>>(
      `/locations/districts?provinceId=${provinceId}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy danh sách Phường/Xã theo Quận/Huyện.
   */
  async getWards(districtId: number): Promise<ApiResponse<GhnWard[]>> {
    return apiClient.get<ApiResponse<GhnWard[]>>(
      `/locations/wards?districtId=${districtId}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Reverse Geocoding qua Backend Proxy.
   */
  async reverseGeocode(lat: number, lon: number): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/locations/reverse-geocode?lat=${lat}&lon=${lon}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Forward Geocoding qua Backend Proxy.
   */
  async forwardGeocode(query: string): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/locations/forward-geocode?query=${encodeURIComponent(query)}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Tính phí giao hàng GHN dựa trên toDistrictId và toWardCode.
   */
  async calculateShippingFee(
    toDistrictId: number,
    toWardCode: string,
    weight = 500
  ): Promise<ApiResponse<{ shippingFee: number; isFallback?: boolean; details?: unknown }>> {
    return apiClient.get<ApiResponse<{ shippingFee: number; isFallback?: boolean; details?: unknown }>>(
      `/locations/calculate-fee?toDistrictId=${toDistrictId}&toWardCode=${encodeURIComponent(toWardCode)}&weight=${weight}`,
      { suppressErrorToast: true }
    );
  },
};
