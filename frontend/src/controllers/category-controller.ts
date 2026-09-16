import { apiClient, ApiResponse } from '@/services/api-client';
import { CategoryResponse } from '@/types/category';

export const categoryController = {
  /**
   * Lấy danh sách danh mục theo cấu trúc cây (Tree).
   */
  async getCategoryTree(): Promise<ApiResponse<CategoryResponse[]>> {
    return apiClient.get<ApiResponse<CategoryResponse[]>>('/categories/tree', { suppressErrorToast: true });
  },

  /**
   * Lấy danh sách danh mục phẳng (Flat).
   */
  async getAllCategories(): Promise<ApiResponse<CategoryResponse[]>> {
    return apiClient.get<ApiResponse<CategoryResponse[]>>('/categories', { suppressErrorToast: true });
  },
};
