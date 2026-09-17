import { apiClient, ApiResponse } from '@/services/api-client';
import { Product, PaginatedResponse } from '@/types/product';

export interface ProductSearchQueryParams {
  keyword: string;
  page?: number;
  size?: number;
}

/**
 * Controller gọi REST API Tìm kiếm sản phẩm theo điểm số độ phù hợp (Relevance Scoring)
 * GET /api/v1/products/search?keyword=...&page=...&size=...
 */
export async function searchProductsByRelevance(
  params: ProductSearchQueryParams
): Promise<ApiResponse<PaginatedResponse<Product>>> {
  const { keyword, page = 0, size = 10 } = params;
  const searchParams = new URLSearchParams();
  searchParams.append('keyword', keyword);
  searchParams.append('page', page.toString());
  searchParams.append('size', size.toString());

  return apiClient<PaginatedResponse<Product>>(
    `/products/search?${searchParams.toString()}`,
    { method: 'GET', suppressErrorToast: true }
  );
}
