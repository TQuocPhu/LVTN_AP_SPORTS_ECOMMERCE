'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchProductsByRelevance } from '@/controllers/product-search-controller';
import { Product } from '@/types/product';

export interface UseProductSearchReturn {
  keyword: string;
  products: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  validationError: string | null;
  handlePageChange: (newPage: number) => void;
  refetch: () => void;
}

/**
 * Custom Hook quản lý toàn bộ logic Tìm kiếm Sản phẩm:
 * - Đọc query parameter `keyword` & `page` từ URL (`useSearchParams`)
 * - Kiểm tra Validation dữ liệu từ khóa trước khi gọi API
 * - Quản lý State phân trang & nạp dữ liệu từ FE Controller
 */
export function useProductSearch(pageSize: number = 10): UseProductSearchReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawKeyword = searchParams.get('keyword') || searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const currentPage = isNaN(pageParam) ? 0 : Math.max(0, pageParam);

  const [keyword, setKeyword] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validation hàm kiểm tra độ hợp lệ của từ khóa
  const validateKeyword = (kw: string): string | null => {
    const trimmed = kw.trim();
    if (!trimmed) {
      return 'Vui lòng nhập từ khóa để tìm kiếm sản phẩm.';
    }
    if (trimmed.length < 2) {
      return 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự.';
    }
    if (trimmed.length > 100) {
      return 'Từ khóa tìm kiếm quá dài (tối đa 100 ký tự).';
    }
    return null;
  };

  const fetchSearchResults = useCallback(async () => {
    const trimmedKw = rawKeyword.trim();
    setKeyword(trimmedKw);

    const error = validateKeyword(rawKeyword);
    if (error) {
      setValidationError(error);
      setProducts([]);
      setTotalElements(0);
      setTotalPages(0);
      setIsLoading(false);
      return;
    }

    setValidationError(null);
    setIsLoading(true);

    try {
      const res = await searchProductsByRelevance({
        keyword: trimmedKw,
        page: currentPage,
        size: pageSize,
      });

      if (res.data) {
        setProducts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setProducts([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch {
      setProducts([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [rawKeyword, currentPage, pageSize]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/search?${params.toString()}`);
  };

  return {
    keyword,
    products,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    validationError,
    handlePageChange,
    refetch: fetchSearchResults,
  };
}
