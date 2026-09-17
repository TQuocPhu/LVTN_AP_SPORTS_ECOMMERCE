'use client';

import React from 'react';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { CategoryFilterBar } from '@/components/admin/category/CategoryFilterBar';
import { CategoryTable } from '@/components/admin/category/CategoryTable';
import { CategoryPagination } from '@/components/admin/category/CategoryPagination';
import { CategoryFormModal } from '@/components/admin/category/CategoryFormModal';
import { CategoryDeleteModal } from '@/components/admin/category/CategoryDeleteModal';
import { FolderTree } from 'lucide-react';

export default function AdminCategoriesPage() {
  const {
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
    setKeyword,
    setParentId,
    handleSort,
    handlePageChange,
    handleSizeChange,

    // Tree View Expand State
    expandedIds,
    toggleExpand,

    // Modal States & Controls
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
    reloadCategories,
  } = useAdminCategories();

  return (
    <div className="space-y-6">
      {/* Page Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-orange-500" /> Quản Lý Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị dạng cây phân cấp đa tầng (Tối đa 3 cấp: Gốc Cấp 1 ➔ Cấp 2 ➔ Cấp 3)
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <CategoryFilterBar
        keyword={keyword}
        parentId={parentId}
        rootCategories={rootCategories}
        sortBy={sortBy}
        sortDir={sortDir}
        loading={loading}
        onKeywordChange={setKeyword}
        onParentIdChange={setParentId}
        onSortChange={handleSort}
        onOpenCreateModal={() => openCreateModal(null)}
        onReload={reloadCategories}
      />

      {/* Hierarchical Categories Tree Table */}
      <CategoryTable
        categories={categories}
        loading={loading}
        actionLoading={actionLoading}
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onAddSubcategory={(parentCatId) => openCreateModal(parentCatId)}
      />

      {/* Pagination */}
      <CategoryPagination
        page={page}
        size={size}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />

      {/* Create & Edit Modal */}
      <CategoryFormModal
        isOpen={isFormOpen}
        editingCategory={editingCategory}
        presetParentId={presetParentId}
        rootCategories={rootCategories}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <CategoryDeleteModal
        isOpen={isDeleteOpen}
        category={deletingCategory}
        actionLoading={actionLoading}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
