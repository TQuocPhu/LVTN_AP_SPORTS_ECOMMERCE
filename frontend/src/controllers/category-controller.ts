import { apiClient, ApiResponse } from '@/services/api-client';
import {
  CategoryResponse,
  CategoryFilterParams,
  PaginatedCategoriesResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';

export const categoryController = {
  /**
   * Lấy danh sách danh mục theo cấu trúc cây (Tree) - dùng chung
   */
  async getCategoryTree(): Promise<ApiResponse<CategoryResponse[]>> {
    return apiClient.get<ApiResponse<CategoryResponse[]>>('/categories/tree', { suppressErrorToast: true });
  },

  /**
   * Lấy danh sách danh mục phẳng (Flat) - dùng chung
   */
  async getAllCategories(): Promise<ApiResponse<CategoryResponse[]>> {
    return apiClient.get<ApiResponse<CategoryResponse[]>>('/categories', { suppressErrorToast: true });
  },

  /**
   * [ADMIN] Lấy danh sách danh mục phân trang & lọc
   */
  async getCategoriesAdmin(params: CategoryFilterParams): Promise<ApiResponse<PaginatedCategoriesResponse>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.parentId !== undefined && params.parentId !== null) {
      queryParams.append('parentId', params.parentId.toString());
    }
    queryParams.append('page', (params.page || 0).toString());
    queryParams.append('size', (params.size || 10).toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    return apiClient.get<ApiResponse<PaginatedCategoriesResponse>>(
      `/admin/categories?${queryParams.toString()}`
    );
  },

  /**
   * [ADMIN] Lấy danh sách danh mục gốc (parent == null)
   */
  async getRootCategoriesAdmin(): Promise<ApiResponse<CategoryResponse[]>> {
    return apiClient.get<ApiResponse<CategoryResponse[]>>('/admin/categories/roots');
  },

  /**
   * [ADMIN] Chi tiết danh mục
   */
  async getCategoryByIdAdmin(id: number): Promise<ApiResponse<CategoryResponse>> {
    return apiClient.get<ApiResponse<CategoryResponse>>(`/admin/categories/${id}`);
  },

  /**
   * [ADMIN] Tạo mới danh mục
   */
  async createCategoryAdmin(data: CreateCategoryRequest): Promise<ApiResponse<CategoryResponse>> {
    return apiClient.post<ApiResponse<CategoryResponse>>('/admin/categories', data, { timeoutMs: 60000 });
  },

  /**
   * [ADMIN] Cập nhật danh mục
   */
  async updateCategoryAdmin(id: number, data: UpdateCategoryRequest): Promise<ApiResponse<CategoryResponse>> {
    return apiClient.put<ApiResponse<CategoryResponse>>(`/admin/categories/${id}`, data, { timeoutMs: 60000 });
  },

  /**
   * [ADMIN] Xóa danh mục
   */
  async deleteCategoryAdmin(id: number): Promise<ApiResponse<VoidFunction>> {
    return apiClient.delete<ApiResponse<VoidFunction>>(`/admin/categories/${id}`);
  },
};
