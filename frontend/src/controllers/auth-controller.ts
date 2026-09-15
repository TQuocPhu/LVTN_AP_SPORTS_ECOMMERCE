import { apiClient } from '@/services/api-client';
import { ApiResponse, LoginRequest, RegisterRequest, UserResponse } from '@/types/auth';

/**
 * Frontend Controller xử lý các lệnh gọi API Đăng ký, Kích hoạt, Đăng nhập, Đăng xuất qua Cookie.
 * Tuân thủ Clean Architecture Layering (Component -> Hook -> FE Controller -> REST API).
 */
export const authController = {
  /**
   * Gọi API Đăng ký tài khoản Khách hàng.
   */
  async register(data: RegisterRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/customer/auth/register', data);
  },

  /**
   * Gọi API Kích hoạt tài khoản bằng Token.
   */
  async activateAccount(token: string): Promise<ApiResponse<void>> {
    return apiClient.get<ApiResponse<void>>(`/customer/auth/activate?token=${encodeURIComponent(token)}`);
  },

  /**
   * Gọi API Đăng nhập Khách hàng -> Cấp Cookies.
   */
  async login(data: LoginRequest): Promise<ApiResponse<UserResponse>> {
    return apiClient.post<ApiResponse<UserResponse>>('/customer/auth/login', data);
  },

  /**
   * Gọi API Đăng xuất -> Xóa Cookies.
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/customer/auth/logout', {});
  },

  /**
   * Lấy thông tin User hiện tại từ Session Cookie (ẩn toast lỗi nếu chưa đăng nhập).
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<ApiResponse<UserResponse>>('/customer/auth/me', { suppressErrorToast: true });
  },
};
