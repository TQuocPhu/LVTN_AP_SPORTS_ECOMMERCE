'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminProductController } from '@/controllers/admin-product-controller';
import { Product, ProductFilterParams, PaginatedResponse } from '@/types/product';
import { isApiError } from '@/services/api-client';

export function useAdminProducts(initialParams?: ProductFilterParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
  });

  const [filters, setFilters] = useState<ProductFilterParams>({
    keyword: '',
    categoryId: undefined,
    status: '',
    unit: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'DESC',
    ...initialParams,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminProductController.getProducts(filters);
      if (res && res.data) {
        setProducts(res.data.content || []);
        setPageInfo({
          totalElements: res.data.totalElements || 0,
          totalPages: res.data.totalPages || 0,
          number: res.data.number || 0,
          size: res.data.size || 10,
        });
      }
    } catch (err: any) {
      if (!(isApiError(err) && err.status === 401)) {
        console.error('Lỗi khi tải danh sách sản phẩm:', err);
        setError(err?.message || 'Không thể tải danh sách sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (newFilters: Partial<ProductFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 0, // Reset to page 0 if filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const toggleStatus = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await adminProductController.toggleProductStatus(id);
      if (res && res.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: res.data.status } : p))
        );
      }
      return res;
    } catch (err: any) {
      console.error('Lỗi khi chuyển trạng thái sản phẩm:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await adminProductController.deleteProduct(id);
      await fetchProducts();
      return res;
    } catch (err: any) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    products,
    pageInfo,
    filters,
    loading,
    actionLoading,
    error,
    updateFilters,
    handlePageChange,
    toggleStatus,
    deleteProduct,
    refetchProducts: fetchProducts,
  };
}
