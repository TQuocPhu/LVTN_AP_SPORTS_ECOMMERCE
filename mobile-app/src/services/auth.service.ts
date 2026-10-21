import { apiClient } from './apiClient';
import { ApiResponse, CustomerLoginResponse, User } from '../types';

export const authService = {
  /**
   * Đăng nhập khách hàng trên Mobile
   */
  async login(email: string, password: string): Promise<CustomerLoginResponse> {
    const res = await apiClient.post<ApiResponse<CustomerLoginResponse>>(
      '/customer/auth/login',
      { email, password }
    );
    return res.data.data;
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
