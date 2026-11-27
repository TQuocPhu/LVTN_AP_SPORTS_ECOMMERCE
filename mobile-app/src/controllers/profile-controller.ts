import { apiClient } from '../services/apiClient';
import { ApiResponse, User } from '../types';

export interface UserProfileData extends User {
  phoneNumber?: string;
  address?: string;
  role?: string;
}

export const profileController = {
  async getProfile(): Promise<ApiResponse<UserProfileData>> {
    const res = await apiClient.get<ApiResponse<UserProfileData>>('/customer/profile/me');
    return res.data;
  },

  async updateProfile(data: {
    name: string;
    phoneNumber?: string;
    address?: string;
  }): Promise<ApiResponse<UserProfileData>> {
    const res = await apiClient.put<ApiResponse<UserProfileData>>('/customer/profile/update', data);
    return res.data;
  },

  async uploadAvatar(uri: string): Promise<ApiResponse<UserProfileData>> {
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: filename,
      type,
    } as any);

    const res = await apiClient.post<ApiResponse<UserProfileData>>(
      '/customer/profile/avatar',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
    return res.data;
  },

  async changePassword(data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<void>> {
    const res = await apiClient.put<ApiResponse<void>>(
      '/customer/profile/change-password',
      data
    );
    return res.data;
  },
};
