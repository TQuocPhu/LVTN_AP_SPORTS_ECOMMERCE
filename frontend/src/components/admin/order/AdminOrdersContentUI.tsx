'use client';

import React from 'react';
import { ShoppingBag, RefreshCw } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { AdminOrderSummaryCards } from './AdminOrderSummaryCards';
import { AdminOrderFilterBar } from './AdminOrderFilterBar';
import { AdminOrderTable } from './AdminOrderTable';
import { AdminOrderDetailModal } from './AdminOrderDetailModal';
import { AdminOrderCancelModal } from './AdminOrderCancelModal';
import { AdminOrderUpdateStatusModal } from './AdminOrderUpdateStatusModal';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ShieldAlert } from 'lucide-react';

/**
 * Component AdminOrdersContentUI: Giao diện quản lý Đơn Hàng phía Admin (Giao diện chuẩn Admin thống nhất).
 * Tuân thủ quy chuẩn Layer Architecture của dự án.
 */
export const AdminOrdersContentUI: React.FC = () => {
  const { user } = useAdminAuth();
  const {
    filters,
    handleFilterChange,
    handleResetFilters,
    handleSearch,
    orders,
    summary,
    totalElements,
    totalPages,
    loadingOrders,
    loadingSummary,
    refetchOrders,
    refetchSummary,
    selectedOrder,
    loadingDetail,
    isDetailModalOpen,
    handleOpenDetailModal,
    handleCloseDetailModal,
    handleConfirmOrder,
    orderToCancel,
    isCancelModalOpen,
    cancelReason,
    setCancelReason,
    isSubmittingCancel,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
    orderToUpdate,
    isUpdateStatusModalOpen,
    newStatus,
    setNewStatus,
    statusNote,
    setStatusNote,
    isSubmittingUpdateStatus,
    handleOpenUpdateStatusModal,
    handleCloseUpdateStatusModal,
    handleConfirmUpdateStatus,
  } = useAdminOrders();

  // Chặn vai trò Quản lý kho (Warehouse Manager / Staff) không được truy cập Quản lý đơn hàng
  if (user && user.roleName !== 'ADMIN' && user.roleName !== 'STAFF') {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto my-12 p-8 space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-slate-500 text-sm mt-1">
            Trang Quản lý Đơn Hàng chỉ dành cho Quản trị viên hệ thống (ADMIN) và Nhân viên bán hàng (STAFF).
            Tài khoản vai trò <span className="font-bold text-slate-800">{user.roleName}</span> không có quyền truy cập tính năng này.
          </p>
        </div>
      </div>
    );
  }

  const handleRefreshAll = () => {
    refetchOrders();
    refetchSummary();
  };

  const isLoading = loadingOrders || loadingSummary;

  return (
    <div className="space-y-6">
      {/* Page Header (Chuẩn Admin) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản Lý Đơn Hàng AP Sports
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi danh sách đơn hàng, duyệt đơn, vận chuyển GHN và quản lý trạng thái thanh toán.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Tải lại dữ liệu đơn hàng"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. KPI Metric Summary Cards */}
      <AdminOrderSummaryCards summary={summary} loading={loadingSummary} />

      {/* 2. Thanh Tìm Kiếm, Lọc & Sắp Xếp */}
      <AdminOrderFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onSearch={handleSearch}
      />

      {/* 3. Bảng Dữ Liệu Đơn Hàng & Phân Trang */}
      <AdminOrderTable
        orders={orders}
        loading={loadingOrders}
        currentPage={filters.page || 0}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={filters.size || 10}
        onPageChange={(page) => handleFilterChange('page', page)}
        onOpenDetail={handleOpenDetailModal}
        onConfirmOrder={handleConfirmOrder}
        onOpenUpdateStatus={handleOpenUpdateStatusModal}
        onOpenCancel={handleOpenCancelModal}
      />

      {/* 4. Modal Chi Tiết Đơn Hàng */}
      <AdminOrderDetailModal
        isOpen={isDetailModalOpen}
        order={selectedOrder}
        loading={loadingDetail}
        onClose={handleCloseDetailModal}
      />

      {/* 5. Modal Xác Nhận Hủy Đơn */}
      <AdminOrderCancelModal
        isOpen={isCancelModalOpen}
        order={orderToCancel}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        isSubmitting={isSubmittingCancel}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />

      {/* 6. Modal Cập Nhật Trạng Thái */}
      <AdminOrderUpdateStatusModal
        isOpen={isUpdateStatusModalOpen}
        order={orderToUpdate}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        note={statusNote}
        onNoteChange={setStatusNote}
        isSubmitting={isSubmittingUpdateStatus}
        onClose={handleCloseUpdateStatusModal}
        onConfirm={handleConfirmUpdateStatus}
      />
    </div>
  );
};
