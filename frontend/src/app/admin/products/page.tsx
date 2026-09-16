'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useCategories } from '@/hooks/useCategories';
import { adminProductController } from '@/controllers/admin-product-controller';
import { ProductDetail } from '@/types/product';
import { ProductFilterBar } from '@/components/admin/product/ProductFilterBar';
import { ProductTable } from '@/components/admin/product/ProductTable';
import { ProductPagination } from '@/components/admin/product/ProductPagination';
import { ProductVariantDrawer } from '@/components/admin/product/ProductVariantDrawer';
import { ProductDescriptionModal } from '@/components/admin/product/ProductDescriptionModal';
import { ProductDeleteModal } from '@/components/admin/product/ProductDeleteModal';
import { Plus, RefreshCw, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const {
    products,
    pageInfo,
    filters,
    loading,
    actionLoading,
    updateFilters,
    handlePageChange,
    toggleStatus,
    deleteProduct,
    refetchProducts,
  } = useAdminProducts();

  const { categoryTree } = useCategories();

  // Selected Detail States for Drawers & Modals
  const [selectedVariantDetail, setSelectedVariantDetail] = useState<ProductDetail | null>(null);
  const [isVariantDrawerOpen, setIsVariantDrawerOpen] = useState<boolean>(false);

  const [selectedDescriptionDetail, setSelectedDescriptionDetail] = useState<ProductDetail | null>(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState<boolean>(false);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Fetch product detail for Variant Drawer
  const handleOpenVariantDrawer = async (productId: number) => {
    try {
      const res = await adminProductController.getProductById(productId);
      if (res && res.data) {
        setSelectedVariantDetail(res.data);
        setIsVariantDrawerOpen(true);
      }
    } catch (err) {
      toast.error('Không thể tải chi tiết biến thể sản phẩm');
    }
  };

  // Fetch product detail for Description Modal
  const handleOpenDescriptionModal = async (productId: number) => {
    try {
      const res = await adminProductController.getProductById(productId);
      if (res && res.data) {
        setSelectedDescriptionDetail(res.data);
        setIsDescriptionModalOpen(true);
      }
    } catch (err) {
      toast.error('Không thể tải thông tin mô tả sản phẩm');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleStatus(id);
      toast.success('Đã cập nhật trạng thái sản phẩm!');
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại!');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteProduct(deleteTargetId);
      toast.success('Xóa sản phẩm thành công!');
      setDeleteTargetId(null);
    } catch (err) {
      toast.error('Xóa sản phẩm thất bại!');
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản Lý Sản Phẩm
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý danh mục, biến thể size/màu, giá bán, tồn kho và mô tả sản phẩm AP Sports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchProducts()}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Thêm Sản Phẩm Mới
          </Link>
        </div>
      </div>

      {/* Modular Filter Bar */}
      <ProductFilterBar
        filters={filters}
        categoryTree={categoryTree}
        loading={loading}
        onUpdateFilters={updateFilters}
        onRefresh={refetchProducts}
      />

      {/* Modular Products Table */}
      <ProductTable
        products={products}
        loading={loading}
        actionLoading={actionLoading}
        onOpenVariantDrawer={handleOpenVariantDrawer}
        onOpenDescriptionModal={handleOpenDescriptionModal}
        onToggleStatus={handleToggleStatus}
        onDeleteProduct={(id) => setDeleteTargetId(id)}
      />

      {/* Modular Pagination Footer */}
      <ProductPagination
        pageInfo={pageInfo}
        onPageChange={handlePageChange}
        onSizeChange={(size) => updateFilters({ size, page: 0 })}
      />

      {/* Modular Variant Drawer (Slide-over) */}
      <ProductVariantDrawer
        product={selectedVariantDetail}
        isOpen={isVariantDrawerOpen}
        onClose={() => setIsVariantDrawerOpen(false)}
      />

      {/* Modular Description Preview Modal */}
      <ProductDescriptionModal
        product={selectedDescriptionDetail}
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
      />

      {/* Modular Delete Confirmation Modal */}
      <ProductDeleteModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
