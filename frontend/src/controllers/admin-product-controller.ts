import { apiClient, ApiResponse } from '@/services/api-client';
import {
  Product,
  ProductDetail,
  CreateProductFormRequest,
  UpdateProductFormRequest,
  ProductFilterParams,
  PaginatedResponse,
} from '@/types/product';

export const adminProductController = {
  /**
   * Lấy danh sách sản phẩm phân trang theo bộ lọc.
   */
  async getProducts(params?: ProductFilterParams): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const searchParams = new URLSearchParams();
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.unit) searchParams.append('unit', params.unit);
    if (params?.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);

    const queryString = searchParams.toString();
    const url = `/admin/products${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ApiResponse<PaginatedResponse<Product>>>(url, { suppressErrorToast: true });
  },

  /**
   * Lấy chi tiết sản phẩm theo ID.
   */
  async getProductById(id: number): Promise<ApiResponse<ProductDetail>> {
    return apiClient.get<ApiResponse<ProductDetail>>(`/admin/products/${id}`);
  },

  /**
   * Tạo sản phẩm mới (Multi-step Stepper Form).
   */
  async createProduct(data: CreateProductFormRequest): Promise<ApiResponse<ProductDetail>> {
    return apiClient.post<ApiResponse<ProductDetail>>('/admin/products', data);
  },

  /**
   * Cập nhật sản phẩm.
   */
  async updateProduct(id: number, data: UpdateProductFormRequest): Promise<ApiResponse<ProductDetail>> {
    return apiClient.put<ApiResponse<ProductDetail>>(`/admin/products/${id}`, data);
  },

  /**
   * Đổi trạng thái nhanh trên dòng sản phẩm.
   */
  async toggleProductStatus(id: number): Promise<ApiResponse<Product>> {
    return apiClient<Product>(`/admin/products/${id}/toggle-status`, {
      method: 'PATCH',
    });
  },

  /**
   * Xóa sản phẩm.
   */
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/admin/products/${id}`);
  },
};
