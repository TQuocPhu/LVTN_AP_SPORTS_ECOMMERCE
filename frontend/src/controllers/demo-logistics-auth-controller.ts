import { apiClient } from '@/services/api-client';
import { AdminLoginRequest, ApiResponse, UserResponse } from '@/types/auth';

export const demoLogisticsAuthController = {
  async login(data: AdminLoginRequest): Promise<ApiResponse<UserResponse>> {
    return apiClient.post<ApiResponse<UserResponse>>('/demo/logistics/auth/login', data);
  },

  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<ApiResponse<UserResponse>>('/demo/logistics/auth/me', { suppressErrorToast: true, timeoutMs: 4000 });
  },

  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/demo/logistics/auth/logout', {});
  },
};
