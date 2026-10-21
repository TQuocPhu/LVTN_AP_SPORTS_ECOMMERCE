import { apiClient } from '../services/apiClient';
import { ApiResponse, Category, Product } from '../types';

export const productController = {
  /**
   * Lấy danh sách danh mục thể thao công khai
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const res = await apiClient.get<ApiResponse<Category[]>>('/categories');
    return res.data;
  },

  /**
   * Lấy danh sách sản phẩm với bộ lọc & phân trang
   */
  async getProducts(params?: {
    keyword?: string;
    categoryId?: number;
    categorySlug?: string;
    brandSlug?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>('/products', {
      params: {
        page: 0,
        size: 20,
        ...params,
      },
    });

    const rawData = res.data?.data;
    const items = rawData?.content || rawData || [];
    const normalizedItems = items.map((p: any) => ({
      ...p,
      basePrice: p.basePrice ?? p.price ?? 0,
      thumbnail: p.thumbnail || p.mainImage || (p.images && p.images[0]) || '',
    }));

    return {
      ...res.data,
      data: rawData?.content ? { ...rawData, content: normalizedItems } : normalizedItems,
    };
  },

  /**
   * Lấy chi tiết sản phẩm theo Slug
   */
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    const res = await apiClient.get<ApiResponse<any>>(`/products/${encodeURIComponent(slug)}`);
    const p = res.data?.data;
    const normalized: Product = p
      ? {
          ...p,
          basePrice: p.basePrice ?? p.price ?? 0,
          thumbnail: p.thumbnail || p.mainImage || (p.images && p.images[0]) || '',
        }
      : p;

    return {
      ...res.data,
      data: normalized,
    };
  },

  /**
   * Lấy danh sách sản phẩm nổi bật cho trang chủ
   */
  async getFeaturedProducts(limit = 8): Promise<ApiResponse<Product[]>> {
    const res = await apiClient.get<ApiResponse<any>>('/products', {
      params: { size: limit, page: 0 },
    });
    const items = res.data?.data?.content || res.data?.data || [];
    const normalized = items.map((p: any) => ({
      ...p,
      basePrice: p.basePrice ?? p.price ?? 0,
      thumbnail: p.thumbnail || p.mainImage || (p.images && p.images[0]) || '',
    }));

    return {
      ...res.data,
      data: normalized,
    };
  },

  /**
   * Đăng ký nhận thông báo Restock khi size giày/dụng cụ hết hàng
   */
  async subscribeRestock(variantId: number, email?: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>('/customer/restock-notifications', {
      variantId,
      email,
    });
    return res.data;
  },
};
