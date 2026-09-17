'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilterParams } from '@/types/product';
import { productController } from '@/controllers/product-controller';

export function useCustomerProducts(initialCategoryId?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination State
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Filter States
  const [keyword, setKeyword] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId || null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Sorting State
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filterParams: ProductFilterParams = {
        keyword: keyword.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
        status: 'in_stock', // Default customer view only shows in_stock items
        variantSize: selectedSizes.length > 0 ? selectedSizes.join(',') : undefined,
        minPrice: minPrice !== null ? minPrice : undefined,
        maxPrice: maxPrice !== null ? maxPrice : undefined,
        page,
        size: pageSize,
        sortBy,
        sortDir,
      };

      const res = await productController.getPublicProducts(filterParams);
      if (res.data) {
        setProducts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách sản phẩm cửa hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedCategoryId, selectedSizes, minPrice, maxPrice, page, pageSize, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
