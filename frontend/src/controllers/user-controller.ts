import { apiClient, ApiResponse } from '@/services/api-client';
import {
  UserAccount,
  UserFilterParams,
  CreateStaffFormData,
  UserPageResponse,
  UserStatus,
} from '@/types/user-management';

/**
 * Controller phụ trách gọi REST API giao tiếp với Backend cho Phân Hệ Quản lý Tài Khoản Người Dùng.
 * Phân chia minh bạch theo kiến trúc 4 tầng: pages -> components -> hooks -> controller (FE).
 */
export const userController = {
  /**
   * Lấy danh sách tài khoản phía Admin có phân trang, tìm kiếm từ khóa và lọc đa tiêu chí.
   */
  async getAdminUsers(params: UserFilterParams): Promise<ApiResponse<UserPageResponse<UserAccount>>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    queryParams.append('page', (params.page ?? 0).toString());
    queryParams.append('size', (params.size ?? 10).toString());

    return apiClient.get<ApiResponse<UserPageResponse<UserAccount>>>(
      `/admin/users?${queryParams.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Lấy thông tin chi tiết cá nhân và danh sách địa chỉ giao hàng của tài khoản.
   */
  async getAdminUserDetail(id: number): Promise<ApiResponse<UserAccount>> {
    return apiClient.get<ApiResponse<UserAccount>>(`/admin/users/${id}`);
  },

  /**
   * Cập nhật trạng thái kích hoạt / khóa tài khoản (active, banned, pending, deleted).
   */
  async updateUserStatus(id: number, status: UserStatus | string): Promise<ApiResponse<UserAccount>> {
    return apiClient.patch<ApiResponse<UserAccount>>(`/admin/users/${id}/status`, { status });
  },

  /**
   * Tạo mới tài khoản Nhân viên (STAFF hoặc WAREHOUSE_MANAGER) với mật khẩu mặc định.
   */
  async createStaffAccount(data: CreateStaffFormData): Promise<ApiResponse<UserAccount>> {
    return apiClient.post<ApiResponse<UserAccount>>('/admin/users/staff', data);
  },

  /**
   * Compatibility method for legacy hooks.
   */
  async getAllUsers(): Promise<any> {
    const res = await this.getAdminUsers({});
    return res.data?.content || [];
  },

  /**
   * Compatibility method for legacy hooks.
   */
  async createUser(payload: any): Promise<any> {
    const res = await this.createStaffAccount(payload);
    return res.data;
  },
};
