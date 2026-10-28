'use client';

import React from 'react';
import { useImportRequests } from '@/hooks/useImportRequests';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ImportRequestHeader } from '@/components/admin/inventory/ImportRequestHeader';
import { ImportRequestTable } from '@/components/admin/inventory/ImportRequestTable';
import { ImportRequestPagination } from '@/components/admin/inventory/ImportRequestPagination';
import { ImportRequestDetailModal } from '@/components/admin/inventory/ImportRequestDetailModal';
import { ImportRequestApproveModal } from '@/components/admin/inventory/ImportRequestApproveModal';
import { ImportRequestRejectModal } from '@/components/admin/inventory/ImportRequestRejectModal';

/**
 * Trang Quản lý Yêu Cầu Nhập Kho cho Quản trị viên & Quản lý kho
 * Tuân thủ nghiêm ngặt Layer Architecture: Page chỉ gọi hooks và điều phối components
 * Toàn bộ logic nghiệp vụ, WebSocket realtime và state được đóng gói tại useImportRequests
 */
export default function AdminImportRequestsPage() {
  const { user } = useAdminAuth();
  const canApprove =
    user?.roleName === 'ADMIN' ||
    user?.roleName === 'WAREHOUSE_MANAGER';

  const {
    requests,
    loading,
    pendingCount,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    totalElements,
    refetch,

    // Modal Details
    detailModalOpen,
    selectedRequest,
    onOpenDetail,
    onCloseDetail,

    // Modal Approve
    approveModalOpen,
    approvingRequest,
    approveItems,
    modalApproveItems,
    totalApprovedQuantity,
    approveNote,
    setApproveNote,
    approveSupplierId,
    setApproveSupplierId,
    suppliers,
    loadingSuppliers,
    submittingApprove,
    onOpenApprove,
    onCloseApprove,
    onUpdateApproveItem,
    onSubmitApprove,

    // Modal Reject
    rejectModalOpen,
    rejectingRequest,
    rejectReason,
    setRejectReason,
    submittingReject,
    onOpenReject,
    onCloseReject,
    onSubmitReject,
  } = useImportRequests();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      {/* 1. Header & Bộ lọc Tabs, Tìm kiếm */}
      <ImportRequestHeader
        pendingCount={pendingCount}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        onRefresh={refetch}
        totalElements={totalElements}
      />

      {/* 2. Bảng Danh Sách Yêu Cầu Nhập Kho */}
      <ImportRequestTable
        requests={requests}
        loading={loading}
        canApprove={canApprove}
        onOpenDetail={onOpenDetail}
        onOpenApprove={onOpenApprove}
        onOpenReject={onOpenReject}
      />

      {/* 3. Phân trang */}
      <ImportRequestPagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
      />

      {/* 4. Modal Chi Tiết */}
      <ImportRequestDetailModal
        isOpen={detailModalOpen}
        request={selectedRequest}
        canApprove={canApprove}
        onClose={onCloseDetail}
        onOpenApprove={onOpenApprove}
        onOpenReject={onOpenReject}
      />

      {/* 5. Modal Kiểm Đếm & Duyệt Nhập Kho */}
      <ImportRequestApproveModal
        isOpen={approveModalOpen}
        request={approvingRequest}
        items={modalApproveItems}
        totalApprovedQuantity={totalApprovedQuantity}
        approveNote={approveNote}
        setApproveNote={setApproveNote}
        suppliers={suppliers}
        selectedSupplierId={approveSupplierId}
        onSelectSupplier={setApproveSupplierId}
        loadingSuppliers={loadingSuppliers}
        submitting={submittingApprove}
        onClose={onCloseApprove}
        onUpdateApproveItem={onUpdateApproveItem}
        onSubmit={onSubmitApprove}
      />

      {/* 6. Modal Từ Chối */}
      <ImportRequestRejectModal
        isOpen={rejectModalOpen}
        request={rejectingRequest}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        submitting={submittingReject}
        onClose={onCloseReject}
        onSubmit={onSubmitReject}
      />
    </div>
  );
}

