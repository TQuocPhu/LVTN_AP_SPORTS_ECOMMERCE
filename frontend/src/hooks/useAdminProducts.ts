'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminProductController } from '@/controllers/admin-product-controller';
import { Product, ProductFilterParams, PaginatedResponse } from '@/types/product';
import { isApiError } from '@/services/api-client';
import { useExcelExport } from '@/hooks/useExcelExport';
import { downloadStyledExcelWorkbook } from '@/utils/excelExportBuilder';

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

  // Debounce 400ms cho từ khóa tìm kiếm để chống spam request
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>(filters.keyword || '');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filters.keyword || '');
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Quản lý AbortController để hủy request cũ khi người dùng đổi bộ lọc / từ khóa
  const abortControllerRef = useRef<AbortController | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    // 1. Hủy request đang bay trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      const queryParams: ProductFilterParams = {
        ...filters,
        keyword: debouncedKeyword.trim() || undefined,
      };
      const res = await adminProductController.getProducts(queryParams, {
        signal: controller.signal,
      });
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
      // Bỏ qua lỗi Abort khi người dùng gõ từ khóa mới hoặc unmount
      if (
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError'))
      ) {
        return;
      }
      if (!(isApiError(err) && err.status === 401)) {
        console.error('Lỗi khi tải danh sách sản phẩm:', err);
        setError(err?.message || 'Không thể tải danh sách sản phẩm');
      }
    } finally {
      setLoading(false);
    }
  }, [
    debouncedKeyword,
    filters.categoryId,
    filters.status,
    filters.unit,
    filters.page,
    filters.size,
    filters.sortBy,
    filters.sortDir,
    filters.minPrice,
    filters.maxPrice,
  ]);

  useEffect(() => {
    fetchProducts();
    // Cleanup hủy request khi component bị unmount
    return () => {
      abortControllerRef.current?.abort();
    };
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

  const { isExporting, runExport } = useExcelExport();

  /**
   * Xuất toàn bộ sản phẩm khớp bộ lọc hiện tại (không phân trang, tối đa 5.000 dòng) ra file Excel (.xlsx).
   */
  const handleExportExcel = useCallback(() => {
    runExport(async () => {
      const res = await adminProductController.exportProducts({
        ...filters,
        keyword: debouncedKeyword,
      });
      const rows = res.data || [];
      const dateStr = new Date().toISOString().slice(0, 10);
      await downloadStyledExcelWorkbook(`Danh_Sach_San_Pham_${dateStr}.xlsx`, [
        {
          sheetName: 'San pham',
          title: 'DANH SÁCH SẢN PHẨM QUẢN TRỊ (THEO BỘ LỌC)',
          filterSummary: `Từ khóa: ${debouncedKeyword || 'Tất cả'} | Trạng thái: ${filters.status || 'Tất cả'}`,
          columns: [
            { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, i) => i + 1 },
            { header: 'Mã SP', key: 'id', type: 'number', width: 10 },
            { header: 'Tên sản phẩm', key: 'name', type: 'text', width: 34 },
            { header: 'Slug', key: 'slug', type: 'text' },
            { header: 'Danh mục', key: 'primaryCategoryName', type: 'text', valueGetter: (p: any) => p.primaryCategoryName || '' },
            { header: 'Đơn vị', key: 'unit', type: 'text', valueGetter: (p: any) => p.unit || 'Cái' },
            { header: 'Giá niêm yết', key: 'price', type: 'currency' },
            { header: 'Số biến thể', key: 'variantCount', type: 'number', valueGetter: (p: any) => p.variantCount ?? 0 },
            { header: 'Tổng tồn kho', key: 'totalStock', type: 'number', valueGetter: (p: any) => p.totalStock ?? 0 },
            { header: 'Lượt đánh giá', key: 'reviewsCount', type: 'number', valueGetter: (p: any) => p.reviewsCount ?? 0 },
            { header: 'Đánh giá TB', key: 'rating', type: 'number', valueGetter: (p: any) => p.rating ?? 0 },
            { header: 'Trạng thái', key: 'status', type: 'text' },
          ],
          rows,
        },
      ]);
      return rows.length;
    });
  }, [filters, debouncedKeyword, runExport]);

  return {
    products,
    pageInfo,
    filters,
    loading,
    actionLoading,
    error,
    isExporting,
    handleExportExcel,
    updateFilters,
    handlePageChange,
    toggleStatus,
    deleteProduct,
    refetchProducts: fetchProducts,
  };
}
