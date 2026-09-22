'use client';

import React from 'react';
import { Users, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserFilterBar } from './UserFilterBar';
import { UserTable } from './UserTable';
import { UserDetailModal } from './UserDetailModal';
import { CreateStaffModal } from './CreateStaffModal';

export function AdminUsersContentUI() {
  const {
    filters,
    pageData,
    isLoading,
    isSubmitting,
    isDetailModalOpen,
    isCreateStaffModalOpen,
    selectedUser,
    detailLoading,
    handleKeywordChange,
    handleRoleChange,
    handleStatusChange,
    handlePageChange,
    handleOpenDetailModal,
    handleOpenCreateStaffModal,
    handleCloseModals,
    handleStatusToggle,
    handleCreateStaffSubmit,
    refresh,
  } = useAdminUsers();

  const handleResetFilters = () => {
    handleKeywordChange('');
    handleRoleChange('ALL');
    handleStatusChange('ALL');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* Page Header chuẩn Admin Portal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Quản Lý Tài Khoản Người Dùng & Phân Quyền
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi danh sách tài khoản Khách hàng, Nhân viên, Quản lý kho, xem chi tiết địa chỉ nhận hàng và cấu hình trạng thái hoạt động.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Tổng số tài khoản: <strong>{pageData.totalElements || 0}</strong></span>
          </div>

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

      {/* Thanh Tìm Kiếm & Lọc */}
      <UserFilterBar
        filters={filters}
        onKeywordChange={handleKeywordChange}
        onRoleChange={handleRoleChange}
        onStatusChange={handleStatusChange}
        onOpenCreateStaffModal={handleOpenCreateStaffModal}
        onResetFilters={handleResetFilters}
      />

      {/* Bảng Dữ Liệu Người Dùng & Phân Trang */}
      <UserTable
        pageData={pageData}
        isLoading={isLoading}
        onOpenDetailModal={handleOpenDetailModal}
        onStatusToggle={handleStatusToggle}
        onPageChange={handlePageChange}
      />

      {/* Modal Xem Chi Tiết Thông Tin Cá Nhân & Địa Chỉ */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        user={selectedUser}
        isLoading={detailLoading}
        onClose={handleCloseModals}
      />

      {/* Modal Tạo Tài Khoản Nhân Viên Mới */}
      <CreateStaffModal
        isOpen={isCreateStaffModalOpen}
        isSubmitting={isSubmitting}
        onClose={handleCloseModals}
        onSubmit={handleCreateStaffSubmit}
      />
    </div>
  );
}

