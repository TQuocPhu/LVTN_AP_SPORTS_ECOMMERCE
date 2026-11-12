'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product, ProductFilterParams } from '@/types/product';
import { CategoryResponse } from '@/types/category';
import { productController } from '@/controllers/product-controller';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';

/**
 * Hàm đệ quy tìm tên danh mục theo ID trong cây danh mục để hiển thị nhãn (Badge) bộ lọc đang chọn.
 */
function findCategoryNameById(tree: CategoryResponse[], targetId: number): string | null {
  for (const node of tree) {
    if (node.id === targetId) return node.name;
    if (node.children && node.children.length > 0) {
      const found = findCategoryNameById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Custom Hook quản lý toàn bộ trạng thái lọc, tìm kiếm, phân trang và giao diện danh sách sản phẩm khách hàng.
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tự động đồng bộ tham số `categoryId` hoặc `search` từ URL (khi điều hướng từ Trang chủ sang).
 * - Gọi tới `productController.getPublicProducts()` để lấy dữ liệu sản phẩm.
 */
export function useCustomerProducts(
  initialCategoryId?: number,
  categoryTree: CategoryResponse[] = []
) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Trạng thái phân trang (Pagination State)
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(12);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Đọc và kiểm tra an toàn tham số categoryId trên URL
  const urlCategoryIdParam = searchParams?.get('categoryId');
  const parsedUrlCatId = urlCategoryIdParam ? Number(urlCategoryIdParam) : NaN;
  const validUrlCategoryId =
    Number.isInteger(parsedUrlCatId) && parsedUrlCatId > 0 ? parsedUrlCatId : null;

  const urlSearchParam = searchParams?.get('search') || '';

  // Trạng thái bộ lọc kèm Debounce 400ms cho từ khóa tìm kiếm
  const { keyword, debouncedKeyword, setKeyword } = useDebouncedSearch(urlSearchParam, 400);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    validUrlCategoryId ?? initialCategoryId ?? null
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Trạng thái sắp xếp (Sorting State)
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  // Đồng bộ khi tham số categoryId trên URL thay đổi (ví dụ khách bấm từ Trang chủ hoặc Menu)
  useEffect(() => {
    if (validUrlCategoryId !== null) {
      setSelectedCategoryId(validUrlCategoryId);
      setPage(0);
    }
  }, [validUrlCategoryId]);

  // Tự động ánh xạ tên danh mục từ cây danh mục khi có selectedCategoryId
  useEffect(() => {
    if (selectedCategoryId !== null && categoryTree.length > 0) {
      const matchedName = findCategoryNameById(categoryTree, selectedCategoryId);
      if (matchedName) {
        setSelectedCategoryName(matchedName);
      }
    } else if (selectedCategoryId === null) {
      setSelectedCategoryName(null);
    }
  }, [selectedCategoryId, categoryTree]);

  /**
   * Gọi API lấy danh sách sản phẩm đang kinh doanh (in_stock) theo bộ lọc hiện tại.
   */
  const fetchProducts = useCallback(async () => {
    // 1. Hủy request đang chạy trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const filterParams: ProductFilterParams = {
        keyword: debouncedKeyword.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
        status: 'in_stock', // Mặc định cửa hàng chỉ hiển thị sản phẩm đang còn hàng
        variantSize: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
        minPrice: minPrice !== null ? minPrice : undefined,
        maxPrice: maxPrice !== null ? maxPrice : undefined,
        page,
        size: pageSize,
        sortBy,
        sortDir,
      };

      const res = await productController.getPublicProducts(filterParams, {
        signal: controller.signal,
      });
      if (res.data) {
        setProducts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err: unknown) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError'))
      ) {
        return; // Request cũ đã bị hủy bởi bộ lọc mới, không xử lý lỗi
      }
      console.error('Lỗi khi tải danh sách sản phẩm cửa hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, selectedCategoryId, selectedSizes, minPrice, maxPrice, page, pageSize, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSelectCategory = (id: number | null, name: string | null = null) => {
    setSelectedCategoryId(id);
    setSelectedCategoryName(name);
    setPage(0);
  };

  const handleSetPriceRange = (min: number | null, max: number | null) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(0);
  };

  const handleToggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setPage(0);
  };

  const handleSetRating = (rating: number | null) => {
    setSelectedRating((prev) => (prev === rating ? null : rating));
    setPage(0);
  };

  const handleSortChange = (field: string, dir: 'ASC' | 'DESC') => {
    setSortBy(field);
    setSortDir(dir);
    setPage(0);
  };

  const resetFilters = () => {
    setKeyword('');
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedSizes([]);
    setSelectedRating(null);
    setSortBy('createdAt');
    setSortDir('DESC');
    setPage(0);
  };

  const hasActiveFilters =
    Boolean(keyword) ||
    selectedCategoryId !== null ||
    minPrice !== null ||
    maxPrice !== null ||
    selectedSizes.length > 0 ||
    selectedRating !== null;

  return {
    products,
    loading,
    page,
    pageSize,
    totalElements,
    totalPages,
    keyword,
    selectedCategoryId,
    selectedCategoryName,
    minPrice,
    maxPrice,
    selectedSizes,
    selectedRating,
    sortBy,
    sortDir,
    hasActiveFilters,
    mobileFilterOpen,
    setMobileFilterOpen,
    setPage,
    setKeyword,
    setSelectedCategory: handleSelectCategory,
    setPriceRange: handleSetPriceRange,
    setSelectedSizes: handleToggleSize,
    setSelectedRating: handleSetRating,
    handleSortChange,
    resetFilters,
    refresh: fetchProducts,
  };
}
