'use client';

import { useState, useEffect, useCallback } from 'react';
import { categoryController } from '@/controllers/category-controller';
import { CategoryResponse } from '@/types/category';

/**
 * Custom Hook quản lý dữ liệu Danh mục sản phẩm dùng chung (Cây danh mục, Danh mục phẳng, Danh mục gốc).
 * Các API bên dưới đều đã được tăng tốc qua tầng Redis Cache ở Backend (`CategoryCacheService`).
 */
export function useCategories() {
  const [categoryTree, setCategoryTree] = useState<CategoryResponse[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategoryResponse[]>([]);
  const [primaryCategories, setPrimaryCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy cấu trúc cây danh mục đa cấp kèm số lượng sản phẩm từ Backend (có hỗ trợ Redis Cache).
   */
  const fetchCategoryTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryController.getCategoryTree();
      if (res && res.data) {
        setCategoryTree(res.data);
      }
    } catch (err: unknown) {
      console.error('Lỗi khi lấy cây danh mục:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy danh sách toàn bộ danh mục dạng phẳng (Flat).
   */
  const fetchFlatCategories = useCallback(async () => {
    try {
      const res = await categoryController.getAllCategories();
      if (res && res.data) {
        setFlatCategories(res.data);
      }
    } catch (err: unknown) {
      console.error('Lỗi khi lấy danh mục phẳng:', err);
    }
  }, []);

  /**
   * Lấy danh sách các danh mục gốc Cấp 1 (Primary Categories).
   */
  const fetchPrimaryCategories = useCallback(async () => {
    try {
      const res = await categoryController.getPrimaryCategories();
      if (res && res.data) {
        setPrimaryCategories(res.data);
      }
    } catch (err: unknown) {
      console.error('Lỗi khi lấy danh mục gốc:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategoryTree();
    fetchFlatCategories();
    fetchPrimaryCategories();
  }, [fetchCategoryTree, fetchFlatCategories, fetchPrimaryCategories]);

  return {
    categoryTree,
    flatCategories,
    primaryCategories,
    loading,
    error,
    refetchCategories: fetchCategoryTree,
  };
}
