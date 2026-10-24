import { apiClient } from '@/services/api-client';
import {
  ApiResponse,
  CustomerLoginResponse,
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
  UserSessionResponse,
} from '@/types/auth';

/**
 * Frontend Controller xử lý các lệnh gọi API Đăng ký, Kích hoạt, Đăng nhập, Đăng nhập Google,
 * Đăng xuất, Quản lý phiên thiết bị, Quên & Đặt lại mật khẩu.
 * Tuân thủ Clean Architecture Layering (Page -> Component -> Hook -> FE Controller -> REST API).
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
   * Gọi API Đăng nhập Khách hàng truyền thống -> Cấp HttpOnly Cookies.
   */
  async login(data: LoginRequest): Promise<ApiResponse<CustomerLoginResponse | UserResponse>> {
    return apiClient.post<ApiResponse<CustomerLoginResponse | UserResponse>>('/customer/auth/login', data);
  },

  /**
   * Gọi API Đăng nhập bằng Google OAuth2 (Google Identity Services idToken) -> Cấp HttpOnly Cookies.
   */
  async loginWithGoogle(idToken: string): Promise<ApiResponse<CustomerLoginResponse | UserResponse>> {
    const payload: GoogleLoginRequest = { idToken };
    return apiClient.post<ApiResponse<CustomerLoginResponse | UserResponse>>('/customer/auth/google', payload);
  },

  /**
   * Lấy Google Client ID công khai từ cấu hình Backend.
   */
  async getGoogleClientId(): Promise<ApiResponse<{ clientId: string }>> {
    return apiClient.get<ApiResponse<{ clientId: string }>>('/customer/auth/google/client-id', {
      suppressErrorToast: true,
    });
  },

  /**
   * Gọi API Đăng xuất -> Xóa Cookies (timeout 4s để không bao giờ treo giao diện).
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      '/customer/auth/logout',
      {},
      { timeoutMs: 4000, suppressErrorToast: true }
    );
  },

  /**
   * Lấy danh sách các thiết bị/phiên đang hoạt động của khách hàng.
   */
  async getActiveSessions(): Promise<ApiResponse<UserSessionResponse[]>> {
    return apiClient.get<ApiResponse<UserSessionResponse[]>>('/customer/auth/sessions');
  },

  /**
   * Đăng xuất khỏi một thiết bị cụ thể từ xa.
   */
  async revokeSession(deviceToken: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/customer/auth/sessions/${encodeURIComponent(deviceToken)}`);
  },

  /**
   * Lấy thông tin User hiện tại từ Session Cookie (ẩn toast lỗi nếu chưa đăng nhập, timeout 4s).
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<ApiResponse<UserResponse>>('/customer/auth/me', { suppressErrorToast: true, timeoutMs: 4000 });
  },

  /**
   * Gửi yêu cầu Quên Mật Khẩu qua Email.
   */
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/customer/auth/forgot-password', { email } as ForgotPasswordRequest);
  },

  /**
   * Gửi yêu cầu Đặt Lại Mật Khẩu mới với Token xác nhận.
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>('/customer/auth/reset-password', data);
  },
};
