'use client';

import { useState, useEffect, useCallback } from 'react';
import { categoryController } from '@/controllers/category-controller';
import { CategoryResponse, CategoryFilterParams } from '@/types/category';

export function useAdminCategories() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [rootCategories, setRootCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Filter & Pagination State
  const [keyword, setKeyword] = useState<string>('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('DESC');

  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [presetParentId, setPresetParentId] = useState<number | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);

  // Tree View Expand/Collapse States
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Fetch paginated categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const params: CategoryFilterParams = {
        keyword,
        parentId,
        page,
        size,
        sortBy,
        sortDir,
      };
      const res = await categoryController.getCategoriesAdmin(params);
      if (res && res.data) {
        setCategories(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);

        // Auto expand root categories initially
        if (res.data.content) {
          const initialExpanded = new Set<number>();
          res.data.content.forEach((cat) => initialExpanded.add(cat.id));
          setExpandedIds(initialExpanded);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách danh mục:', err);
    } finally {
      setLoading(false);
    }
  }, [keyword, parentId, page, size, sortBy, sortDir]);

  // Fetch root categories for parent dropdown selector
  const fetchRootCategories = useCallback(async () => {
    try {
      const res = await categoryController.getRootCategoriesAdmin();
      if (res && res.data) {
        setRootCategories(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh mục gốc:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchRootCategories();
  }, [fetchRootCategories]);

  // Handlers
  const handleKeywordChange = (val: string) => {
    setKeyword(val);
    setPage(0);
  };

  const handleParentIdChange = (id: number | null) => {
    setParentId(id);
    setPage(0);
  };

  const handleSortChange = (newSortBy: string, newSortDir: string) => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  // Tree View Expand Toggle
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Modal Handlers
  const openCreateModal = (parentCatId?: number | null) => {
    setEditingCategory(null);
    setPresetParentId(parentCatId !== undefined ? parentCatId : null);
    setIsFormOpen(true);
  };

  const openEditModal = (category: CategoryResponse) => {
    setEditingCategory(category);
    setPresetParentId(null);
    setIsFormOpen(true);
  };

  const openDeleteModal = (category: CategoryResponse) => {
    setDeletingCategory(category);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      setActionLoading(true);
      await categoryController.deleteCategoryAdmin(deletingCategory.id);
      setIsDeleteOpen(false);
      setDeletingCategory(null);
      fetchCategories();
      fetchRootCategories();
    } catch (err) {
      console.error('Lỗi khi xóa danh mục:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSuccess = () => {
    fetchCategories();
    fetchRootCategories();
  };

  return {
    categories,
    rootCategories,
    loading,
    actionLoading,

    // Filter & Pagination
    keyword,
    parentId,
    page,
    size,
    sortBy,
    sortDir,
    totalPages,
    totalElements,
    setKeyword: handleKeywordChange,
    setParentId: handleParentIdChange,
    handleSort: handleSortChange,
    handlePageChange,
    handleSizeChange,

    // Tree View Expand State
    expandedIds,
    toggleExpand,

    // Modal States
    isFormOpen,
    setIsFormOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    editingCategory,
    presetParentId,
    deletingCategory,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    confirmDelete,
    handleFormSuccess,
    reloadCategories: fetchCategories,
  };
}
