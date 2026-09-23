import { apiClient, ApiResponse } from '@/services/api-client';
import { UserResponse } from '@/types/auth';
import { UpdateAdminProfileRequest, ChangeAdminPasswordRequest } from '@/types/admin-profile';

/**
 * Frontend Controller xử lý các lệnh gọi REST API Hồ sơ tài khoản Admin.
 */
export const adminProfileController = {
  /**
   * Lấy thông tin hồ sơ tài khoản Admin đang đăng nhập.
   */
  async getProfile(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<ApiResponse<UserResponse>>('/admin/profile/me', { suppressErrorToast: true });
  },

  /**
   * Cập nhật thông tin cá nhân Admin (Họ tên, SĐT, Địa chỉ).
   */
  async updateProfile(data: UpdateAdminProfileRequest): Promise<ApiResponse<UserResponse>> {
    return apiClient.put<ApiResponse<UserResponse>>('/admin/profile/update', data);
  },

  /**
   * Upload ảnh đại diện Avatar qua Cloudinary (folder "ap-sports-e-commerce/avatars").
   */
  async uploadAvatar(file: File): Promise<ApiResponse<UserResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<UserResponse>('/admin/profile/avatar', {
      method: 'POST',
      body: formData,
      timeoutMs: 60000,
    });
  },

  /**
   * Thay đổi mật khẩu tài khoản Admin.
   */
  async changePassword(data: ChangeAdminPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>('/admin/profile/change-password', data);
  },
};
