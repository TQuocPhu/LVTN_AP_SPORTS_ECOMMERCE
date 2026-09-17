import { apiClient, ApiResponse } from '@/services/api-client';
import {
  Product,
  ProductDetail,
  ProductFilterParams,
  PaginatedResponse,
} from '@/types/product';

export const productController = {
  /**
   * Lấy danh sách sản phẩm công khai theo bộ lọc (dành cho người dùng)
   */
  async getPublicProducts(params?: ProductFilterParams): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const searchParams = new URLSearchParams();
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.unit) searchParams.append('unit', params.unit);
    if (params?.variantSize) searchParams.append('variantSize', params.variantSize);
    if (params?.minPrice !== undefined && params?.minPrice !== null) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined && params?.maxPrice !== null) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);

    const queryString = searchParams.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ApiResponse<PaginatedResponse<Product>>>(url, { suppressErrorToast: true });
  },

  /**
   * Lấy chi tiết sản phẩm theo Slug (dành cho người dùng)
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<ProductDetail>> {
    return apiClient.get<ApiResponse<ProductDetail>>(`/products/${encodeURIComponent(slug)}`);
  },
};
