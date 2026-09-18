import { apiClient, ApiResponse } from '@/services/api-client';
import { Supplier, SupplierRequest } from '@/types/inventory';
import { PaginatedResponse } from '@/types/product';

/**
 * Frontend Controller xử lý API Quản lý Nhà cung cấp (/api/v1/warehouse/suppliers).
 */
export const supplierController = {
  async getSuppliers(
    keyword?: string,
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir: 'ASC' | 'DESC' = 'DESC'
  ): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    const searchParams = new URLSearchParams();
    if (keyword) searchParams.append('keyword', keyword);
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    searchParams.append('sortBy', sortBy);
    searchParams.append('sortDir', sortDir);

    return apiClient.get<ApiResponse<PaginatedResponse<Supplier>>>(
      `/warehouse/suppliers?${searchParams.toString()}`,
      { suppressErrorToast: true }
    );
  },

  async getSuppliersList(): Promise<ApiResponse<Supplier[]>> {
    return apiClient.get<ApiResponse<Supplier[]>>('/warehouse/suppliers/list', {
      suppressErrorToast: true,
    });
  },

  async getSupplierById(id: number): Promise<ApiResponse<Supplier>> {
    return apiClient.get<ApiResponse<Supplier>>(`/warehouse/suppliers/${id}`);
  },

  async createSupplier(data: SupplierRequest): Promise<ApiResponse<Supplier>> {
    return apiClient.post<ApiResponse<Supplier>>('/warehouse/suppliers', data);
  },

  async updateSupplier(id: number, data: SupplierRequest): Promise<ApiResponse<Supplier>> {
    return apiClient.put<ApiResponse<Supplier>>(`/warehouse/suppliers/${id}`, data);
  },

  async deleteSupplier(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/warehouse/suppliers/${id}`);
  },
};
