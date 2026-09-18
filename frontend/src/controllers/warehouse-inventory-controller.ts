import { apiClient, ApiResponse } from '@/services/api-client';
import {
  InventoryTransaction,
  InventoryOverviewStats,
  LowStockItem,
  CreateInventoryTransactionRequest,
  InventoryAuditRequest,
  TransactionType,
} from '@/types/inventory';
import { PaginatedResponse } from '@/types/product';

/**
 * Frontend Controller xử lý API Quản lý Tồn kho & Nhập/Xuất (/api/v1/warehouse/inventory).
 */
export const warehouseInventoryController = {
  async getOverviewStats(): Promise<ApiResponse<InventoryOverviewStats>> {
    return apiClient.get<ApiResponse<InventoryOverviewStats>>('/warehouse/inventory/overview', {
      suppressErrorToast: true,
    });
  },

  async searchTransactions(
    type?: TransactionType,
    supplierId?: number,
    keyword?: string,
    fromDate?: string,
    toDate?: string,
    page = 0,
    size = 10,
    sortBy = 'createdAt',
    sortDir: 'ASC' | 'DESC' = 'DESC'
  ): Promise<ApiResponse<PaginatedResponse<InventoryTransaction>>> {
    const searchParams = new URLSearchParams();
    if (type) searchParams.append('type', type);
    if (supplierId) searchParams.append('supplierId', supplierId.toString());
    if (keyword) searchParams.append('keyword', keyword);
    if (fromDate) searchParams.append('fromDate', fromDate);
    if (toDate) searchParams.append('toDate', toDate);
    searchParams.append('page', page.toString());
    searchParams.append('size', size.toString());
    searchParams.append('sortBy', sortBy);
    searchParams.append('sortDir', sortDir);

    return apiClient.get<ApiResponse<PaginatedResponse<InventoryTransaction>>>(
      `/warehouse/inventory/transactions?${searchParams.toString()}`,
      { suppressErrorToast: true }
    );
  },

  async getTransactionById(id: number): Promise<ApiResponse<InventoryTransaction>> {
    return apiClient.get<ApiResponse<InventoryTransaction>>(`/warehouse/inventory/transactions/${id}`);
  },

  async createImport(data: CreateInventoryTransactionRequest): Promise<ApiResponse<InventoryTransaction>> {
    return apiClient.post<ApiResponse<InventoryTransaction>>('/warehouse/inventory/import', data);
  },

  async createExport(data: CreateInventoryTransactionRequest): Promise<ApiResponse<InventoryTransaction>> {
    return apiClient.post<ApiResponse<InventoryTransaction>>('/warehouse/inventory/export', data);
  },

  async adjustStock(data: InventoryAuditRequest): Promise<ApiResponse<InventoryTransaction>> {
    return apiClient.post<ApiResponse<InventoryTransaction>>('/warehouse/inventory/adjust', data);
  },

  async getLowStockVariants(
    threshold = 5,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PaginatedResponse<LowStockItem>>> {
    return apiClient.get<ApiResponse<PaginatedResponse<LowStockItem>>>(
      `/warehouse/inventory/low-stock?threshold=${threshold}&page=${page}&size=${size}`,
      { suppressErrorToast: true }
    );
  },
};
