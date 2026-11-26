import { apiClient, ApiResponse } from '@/services/api-client';
import { ApiClientOptions } from '@/services/api/types';
import {
  Product,
  ProductDetail,
  ProductFilterParams,
  PaginatedResponse,
  AvailableVariantSizeResponse,
} from '@/types/product';

export const productController = {
  /**
   * Lấy danh sách sản phẩm công khai theo bộ lọc (dành cho người dùng)
   */
  async getPublicProducts(params?: ProductFilterParams, options?: ApiClientOptions): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const searchParams = new URLSearchParams();
    if (params?.keyword) searchParams.append('keyword', params.keyword);
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.unit) searchParams.append('unit', params.unit);
    if (params?.variantSize) searchParams.append('variantSize', params.variantSize);
    if (params?.rating !== undefined && params?.rating !== null) searchParams.append('rating', params.rating.toString());
    if (params?.minPrice !== undefined && params?.minPrice !== null) searchParams.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined && params?.maxPrice !== null) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params?.page !== undefined) searchParams.append('page', params.page.toString());
    if (params?.size !== undefined) searchParams.append('size', params.size.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDir) searchParams.append('sortDir', params.sortDir);

    const queryString = searchParams.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ApiResponse<PaginatedResponse<Product>>>(url, { suppressErrorToast: true, ...options });
  },

  /**
   * Lấy danh sách kích thước / quy cách biến thể khả dụng theo ngữ cảnh danh mục và từ khóa hiện tại.
   */
  async getAvailableVariantSizes(
    categoryId?: number | null,
    keyword?: string,
    options?: ApiClientOptions
  ): Promise<ApiResponse<AvailableVariantSizeResponse>> {
    const searchParams = new URLSearchParams();
    if (categoryId !== undefined && categoryId !== null) {
      searchParams.append('categoryId', categoryId.toString());
    }
    if (keyword && keyword.trim()) {
      searchParams.append('keyword', keyword.trim());
    }
    const qs = searchParams.toString();
    return apiClient.get<ApiResponse<AvailableVariantSizeResponse>>(
      `/products/available-sizes${qs ? `?${qs}` : ''}`,
      { suppressErrorToast: true, ...options }
    );
  },

  /**
   * Lấy danh sách sản phẩm được đánh giá cao nhất (dành cho khối Sản Phẩm Đánh Giá Cao)
   */
  async getTopRatedProducts(limit = 2, options?: ApiClientOptions): Promise<ApiResponse<Product[]>> {
    return apiClient.get<ApiResponse<Product[]>>(`/products/top-rated?limit=${limit}`, {
      suppressErrorToast: true,
      ...options,
    });
  },

  /**
   * Lấy danh sách trang thiết bị nổi bật (nhiều đơn hàng + đánh giá tốt, bù mới nhất nếu chưa đủ)
   */
  async getFeaturedProducts(limit = 8, options?: ApiClientOptions): Promise<ApiResponse<Product[]>> {
    return apiClient.get<ApiResponse<Product[]>>(`/products/featured?limit=${limit}`, {
      suppressErrorToast: true,
      ...options,
    });
  },

  /**
   * Lấy chi tiết sản phẩm theo Slug (dành cho người dùng)
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<ProductDetail>> {
    return apiClient.get<ApiResponse<ProductDetail>>(`/products/${encodeURIComponent(slug)}`);
  },
};
