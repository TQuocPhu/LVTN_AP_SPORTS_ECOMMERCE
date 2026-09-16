'use client';

import { useState, useEffect, useCallback } from 'react';
import { categoryController } from '@/controllers/category-controller';
import { CategoryResponse } from '@/types/category';

export function useCategories() {
  const [categoryTree, setCategoryTree] = useState<CategoryResponse[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryController.getCategoryTree();
      if (res && res.data) {
        setCategoryTree(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy cây danh mục:', err);
      setError(err?.message || 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFlatCategories = useCallback(async () => {
    try {
      const res = await categoryController.getAllCategories();
      if (res && res.data) {
        setFlatCategories(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi khi lấy danh mục phẳng:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategoryTree();
    fetchFlatCategories();
  }, [fetchCategoryTree, fetchFlatCategories]);

  return {
    categoryTree,
    flatCategories,
    loading,
    error,
    refetchCategories: fetchCategoryTree,
  };
}
