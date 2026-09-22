import React from 'react';
import { Tag, RefreshCw } from 'lucide-react';
import { useAdminVouchers } from '@/hooks/useAdminVouchers';
import { VoucherFilterBar } from './VoucherFilterBar';
import { VoucherTable } from './VoucherTable';
import { VoucherFormModal } from './VoucherFormModal';
import { VoucherDeleteModal } from './VoucherDeleteModal';

/**
 * Component AdminVouchersContentUI: Giao diện quản lý Voucher phía Admin (Giao diện chuẩn Admin cố định).
 * Tuân thủ quy chuẩn 4 tầng của dự án, sử dụng useAdminVouchers hook để lấy dữ liệu & điều khiển modal.
 */
export const AdminVouchersContentUI: React.FC = () => {
  const {
    filters,
    pageData,
    isLoading,
    isFormModalOpen,
    isDeleteModalOpen,
    editingVoucher,
    deletingVoucher,
    isSubmitting,
    handleKeywordChange,
    handleTypeChange,
    handleStatusChange,
    handleCategoryScopeChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleCloseModals,
    handleSubmitForm,
    handleToggleStatus,
    handleDeleteConfirm,
    refresh,
  } = useAdminVouchers();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Tag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản Lý Mã Giảm Giá & Voucher
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập chương trình khuyến mãi, mã giảm tiền cố định, giảm % hoặc miễn phí vận chuyển cho hệ thống AP Sports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refresh()}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thanh Tìm Kiếm, Lọc & Sắp Xếp */}
      <VoucherFilterBar
        filters={filters}
        onKeywordChange={handleKeywordChange}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onCategoryScopeChange={handleCategoryScopeChange}
        onSortChange={handleSortChange}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Bảng Dữ Liệu Voucher & Phân Trang */}
      <VoucherTable
        pageData={pageData}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteModal}
        onToggleStatus={handleToggleStatus}
        onPageChange={handlePageChange}
      />

      {/* Modal Thêm mới / Chỉnh sửa */}
      <VoucherFormModal
        isOpen={isFormModalOpen}
        editingVoucher={editingVoucher}
        isSubmitting={isSubmitting}
        onClose={handleCloseModals}
        onSubmit={handleSubmitForm}
      />

      {/* Modal Xác Nhận Xóa */}
      <VoucherDeleteModal
        isOpen={isDeleteModalOpen}
        deletingVoucher={deletingVoucher}
        isSubmitting={isSubmitting}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
