'use client';

import React from 'react';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { CategoryFilterBar } from '@/components/admin/category/CategoryFilterBar';
import { CategoryTable } from '@/components/admin/category/CategoryTable';
import { CategoryPagination } from '@/components/admin/category/CategoryPagination';
import { CategoryFormModal } from '@/components/admin/category/CategoryFormModal';
import { CategoryDeleteModal } from '@/components/admin/category/CategoryDeleteModal';
import { FolderTree, AlertTriangle } from 'lucide-react';

/**
 * Component hiển thị giao diện trang Quản lý Danh mục Sản phẩm của Quản trị viên (Admin Categories Content UI).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Gọi hook `useAdminCategories` để xử lý toàn bộ nghiệp vụ giao diện, lọc, phân trang và đóng/mở Modal.
 * - Không chứa useState hay useEffect trực tiếp trong Component.
 * - Giữ chuẩn giao diện sáng (Light Mode) của trang Quản trị.
 */
export function AdminCategoriesContentUI() {
  const {
    categories,
    rootCategories,
    loading,
    actionLoading,

    // Bộ lọc & Phân trang
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

    // Trạng thái đóng/mở các nhánh cây danh mục
    expandedIds,
    toggleExpand,

    // Trạng thái & điều khiển Modal Thêm/Sửa/Xóa
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
      {/* Tiêu đề trang & Ghi chú lưu ý quan trọng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-orange-500" /> Quản Lý Danh Mục Sản Phẩm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị dạng cây phân cấp đa tầng (Tối đa 3 cấp: Gốc Cấp 1 ➔ Cấp 2 ➔ Cấp 3)
          </p>
          <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Lưu ý: Thêm hoặc xóa danh mục sẽ ảnh hưởng đến khung giao diện của trang chủ hệ thống, nên cân nhắc.
            </span>
          </p>
        </div>
      </div>

      {/* Thanh công cụ tìm kiếm & lọc danh mục */}
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

      {/* Bảng hiển thị cây danh mục đa tầng */}
      <CategoryTable
        isSearching={Boolean(keyword && keyword.trim().length > 0)}
        categories={categories}
        loading={loading}
        actionLoading={actionLoading}
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onAddSubcategory={(parentCatId) => openCreateModal(parentCatId)}
      />

      {/* Thanh phân trang */}
      <CategoryPagination
        page={page}
        size={size}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        onSizeChange={handleSizeChange}
      />

      {/* Modal Thêm mới & Chỉnh sửa danh mục */}
      <CategoryFormModal
        isOpen={isFormOpen}
        editingCategory={editingCategory}
        presetParentId={presetParentId}
        rootCategories={rootCategories}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Modal Xác nhận xóa danh mục */}
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

