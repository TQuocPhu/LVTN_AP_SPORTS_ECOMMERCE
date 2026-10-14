import { apiClient, ApiResponse } from '@/services/api-client';
import { AdminDashboardData } from '@/types/dashboard';

export const dashboardController = {
  /**
   * Lấy dữ liệu tổng quan Dashboard thời gian thực và phân tích BI theo vai trò người dùng (Strict RBAC)
   */
  async getDashboardData(): Promise<ApiResponse<AdminDashboardData>> {
    return apiClient.get<ApiResponse<AdminDashboardData>>('/admin/dashboard', {
      suppressErrorToast: true,
    });
  },
};
