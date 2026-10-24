import { apiClient } from './apiClient';
import { ApiResponse, CustomerLoginResponse, GoogleLoginPayload, User } from '../types';

export const authService = {
  /**
   * Đăng nhập khách hàng trên Mobile bằng Email & Mật khẩu
   */
  async login(email: string, password: string): Promise<CustomerLoginResponse> {
    const res = await apiClient.post<ApiResponse<CustomerLoginResponse>>(
      '/customer/auth/login',
      { email, password }
    );
    return res.data.data;
  },

  /**
   * Đăng nhập khách hàng trên Mobile bằng Google OAuth2 (ID Token hoặc Authorization Code)
   */
  async loginWithGoogle(payload: GoogleLoginPayload): Promise<CustomerLoginResponse> {
    const res = await apiClient.post<ApiResponse<CustomerLoginResponse>>(
      '/customer/auth/google',
      payload
    );
    return res.data.data;
  },

  /**
   * Lấy Google Client ID công khai từ Backend
   */
  async getGoogleClientId(): Promise<string> {
    const res = await apiClient.get<ApiResponse<{ clientId: string }>>(
      '/customer/auth/google/client-id'
    );
    return res.data?.data?.clientId || '';
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>('/customer/auth/me');
    return res.data.data;
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<string> {
    const res = await apiClient.post<ApiResponse<void>>(
      '/customer/auth/register',
      data
    );
    return res.data.message;
  },

  /**
   * Lấy danh sách các thiết bị/phiên đang đăng nhập của tài khoản
   */
  async getActiveSessions(): Promise<import('../types').UserSession[]> {
    const res = await apiClient.get<ApiResponse<import('../types').UserSession[]>>(
      '/customer/auth/sessions'
    );
    return res.data.data || [];
  },

  /**
   * Đăng xuất khỏi một thiết bị cụ thể từ xa
   */
  async revokeSession(deviceToken: string): Promise<string> {
    const res = await apiClient.delete<ApiResponse<void>>(
      `/customer/auth/sessions/${deviceToken}`
    );
    return res.data.message;
  },

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/customer/auth/logout');
    } catch {
      // Bỏ qua lỗi server khi logout
    }
  },
};
