import { apiClient } from '../services/apiClient';
import { ApiResponse, CustomerLoginResponse, GoogleLoginPayload, User } from '../types';

/**
 * Controller (FE Mobile) điều phối các yêu cầu xác thực khách hàng tới Backend Controller.
 */
export const authController = {
  /**
   * Đăng nhập khách hàng trên mobile bằng Email & Mật khẩu
   */
  async login(email: string, password: string): Promise<ApiResponse<CustomerLoginResponse>> {
    const res = await apiClient.post<ApiResponse<CustomerLoginResponse>>('/customer/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  /**
   * Đăng nhập khách hàng trên mobile bằng Google OAuth2 (Authorization Code hoặc ID Token)
   */
  async loginWithGoogle(
    payload: GoogleLoginPayload
  ): Promise<ApiResponse<CustomerLoginResponse>> {
    const res = await apiClient.post<ApiResponse<CustomerLoginResponse>>(
      '/customer/auth/google',
      payload
    );
    return res.data;
  },

  /**
   * Lấy Google Client ID cấu hình từ Backend
   */
  async getGoogleClientId(): Promise<ApiResponse<{ clientId: string }>> {
    const res = await apiClient.get<ApiResponse<{ clientId: string }>>(
      '/customer/auth/google/client-id'
    );
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
    confirmPassword: string;
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
