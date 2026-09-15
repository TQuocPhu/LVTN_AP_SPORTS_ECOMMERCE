import { apiClient, ApiResponse } from '@/services/api-client';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '@/types/profile';

/**
 * Frontend Controller xử lý các lệnh gọi API Hồ sơ cá nhân.
 */
export const profileController = {
  /**
   * Lấy thông tin hồ sơ cá nhân.
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<ApiResponse<UserProfile>>('/customer/profile/me', { suppressErrorToast: true });
  },

  /**
   * Cập nhật thông tin cá nhân.
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<ApiResponse<UserProfile>>('/customer/profile/update', data);
  },

  /**
   * Upload ảnh đại diện qua Cloudinary (folder "ap-sports-e-commerce/avatars").
   */
  async uploadAvatar(file: File): Promise<ApiResponse<UserProfile>> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient<UserProfile>('/customer/profile/avatar', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * Thay đổi mật khẩu.
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.put<ApiResponse<void>>('/customer/profile/change-password', data);
  },
};
