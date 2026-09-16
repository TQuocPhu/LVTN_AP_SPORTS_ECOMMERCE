import { apiClient } from '@/services/api-client';
import { AdminLoginRequest, ApiResponse, UserResponse } from '@/types/auth';

/**
 * Frontend Controller xử lý các lệnh gọi API Đăng nhập, Lấy thông tin & Đăng xuất cho Admin Portal.
 * Tuân thủ Clean Architecture Layering (Component -> Hook -> FE Controller -> REST API).
 */
export const adminAuthController = {
  /**
   * Gọi API Đăng nhập Admin Portal.
   */
  async login(data: AdminLoginRequest): Promise<ApiResponse<UserResponse>> {
    return apiClient.post<ApiResponse<UserResponse>>('/admin/auth/login', data);
  },

  /**
   * Lấy thông tin Admin/Staff hiện tại đang đăng nhập.
   */
  async getCurrentAdmin(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<ApiResponse<UserResponse>>('/admin/auth/me', { suppressErrorToast: true, timeoutMs: 4000 });
  },

  /**
   * Gọi API Đăng xuất Admin Portal -> Xóa Session Cookie.
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/admin/auth/logout', {});
  },
};
