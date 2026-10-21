import { apiClient } from './apiClient';
import { ApiResponse, Category, Product } from '../types';

export interface ProductFilterParams {
  categorySlug?: string;
  brandSlug?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export const productService = {
  /**
   * Lấy danh sách danh mục thể thao
   */
  async getCategories(): Promise<Category[]> {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data || [];
  },

  /**
   * Lấy danh sách sản phẩm có phân trang & bộ lọc
   */
  async getProducts(params?: ProductFilterParams): Promise<PaginatedResponse<Product>> {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      '/products',
      { params }
    );
    return res.data.data;
  },

  /**
   * Lấy chi tiết sản phẩm theo Slug hoặc ID
   */
  async getProductBySlug(slug: string): Promise<Product> {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${slug}`);
    return res.data.data;
  },

  /**
   * Lấy danh sách sản phẩm nổi bật / bán chạy
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products/featured');
    return res.data.data || [];
  },

  /**
   * Đăng ký nhận thông báo Restock khi biến thể có hàng
   */
  async subscribeRestock(variantId: number, note?: string): Promise<string> {
    const res = await apiClient.post<ApiResponse<void>>(
      '/customer/restock-notifications/subscribe',
      { variantId, note }
    );
    return res.data.message || 'Đăng ký nhận thông báo thành công!';
  },
};
