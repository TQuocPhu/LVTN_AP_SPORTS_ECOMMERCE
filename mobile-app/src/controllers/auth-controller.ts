import { apiClient } from '../services/apiClient';
import { ApiResponse, CustomerLoginResponse, User } from '../types';

export const authController = {
  /**
   * Đăng nhập khách hàng trên mobile
   */
  async login(email: string, password: string): Promise<ApiResponse<CustomerLoginResponse>> {
    const res = await apiClient.post<ApiResponse<CustomerLoginResponse>>('/customer/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  /**
   * Lấy thông tin tài khoản hiện tại
   */
  async getMe(): Promise<ApiResponse<User>> {
    const res = await apiClient.get<ApiResponse<User>>('/customer/auth/me');
    return res.data;
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse<User>> {
    const res = await apiClient.post<ApiResponse<User>>('/customer/auth/register', data);
    return res.data;
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/customer/auth/logout');
    } catch {
      // bỏ qua lỗi nếu token đã hết hạn
    }
  },
};
