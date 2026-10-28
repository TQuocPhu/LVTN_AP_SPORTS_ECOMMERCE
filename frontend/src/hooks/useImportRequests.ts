'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { importRequestController } from '@/controllers/import-request-controller';
import { supplierController } from '@/controllers/supplier-controller';
import { Supplier } from '@/types/inventory';
import {
  ImportRequest,
  ImportRequestStatus,
  ApproveItemPayload,
} from '@/types/import-request';
import { toast } from 'sonner';

/**
 * Custom hook quản lý toàn bộ logic nghiệp vụ màn hình Yêu Cầu Nhập Kho cho Quản lý kho
 * Tự động đồng bộ thời gian thực qua sự kiện WebSocket 'import_requests_updated'
 */
export function useImportRequests() {
  const [requests, setRequests] = useState<ImportRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<ImportRequestStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Modal Detail State
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<ImportRequest | null>(null);

  // Modal Approve State
  const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [approvingRequest, setApprovingRequest] = useState<ImportRequest | null>(null);
  const [approveItems, setApproveItems] = useState<ApproveItemPayload[]>([]);
  const [approveNote, setApproveNote] = useState<string>('');
  const [approveSupplierId, setApproveSupplierId] = useState<number | undefined>(undefined);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState<boolean>(false);
  const [submittingApprove, setSubmittingApprove] = useState<boolean>(false);

  // Modal Reject State
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectingRequest, setRejectingRequest] = useState<ImportRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [submittingReject, setSubmittingReject] = useState<boolean>(false);

  /**
   * Tải danh sách yêu cầu nhập kho từ Controller
   */
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const [pageData, pCount] = await Promise.all([
        importRequestController.getImportRequests({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: searchQuery.trim() || undefined,
          page,
          size,
          sortBy: 'createdAt',
          sortDir: 'DESC',
        }),
        importRequestController.getPendingCount(),
      ]);

      setRequests(pageData?.content || []);
      setTotalPages(pageData?.totalPages || 1);
      setTotalElements(pageData?.totalElements || 0);
      setPendingCount(pCount);
    } catch (err: any) {
      console.error('Lỗi tải danh sách yêu cầu nhập kho:', err);
      toast.error('Không thể tải danh sách yêu cầu nhập kho');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page, size]);

  // Refetch khi filter thay đổi
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Tự động reload khi nhận được sự kiện WebSocket realtime
  useEffect(() => {
    const handleRealtimeUpdate = () => {
      fetchRequests();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('import_requests_updated', handleRealtimeUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('import_requests_updated', handleRealtimeUpdate);
      }
    };
  }, [fetchRequests]);

  /**
   * Mở modal xem chi tiết
   */
  const handleOpenDetail = (request: ImportRequest) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedRequest(null);
  };

  /**
   * Tải danh sách nhà cung cấp phục vụ phê duyệt nhập kho
   */
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoadingSuppliers(true);
      const res = await supplierController.getSuppliers(undefined, 0, 100);
      if (res && res.data) {
        setSuppliers(res.data.content || []);
      }
    } catch {
      // Silent catch
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  /**
   * Mở modal phê duyệt kiểm đếm nhập kho
   */
  const handleOpenApprove = (request: ImportRequest) => {
    setApprovingRequest(request);
    // Khởi tạo số lượng duyệt mặc định bằng số lượng yêu cầu
    const initialItems: ApproveItemPayload[] = request.items.map((it) => ({
      itemId: it.id,
      approvedQuantity: it.requestedQuantity,
      actualCostPrice: it.expectedCostPrice,
    }));
    setApproveItems(initialItems);
    setApproveNote('');
    setApproveSupplierId(request.supplierId || undefined);
    setApproveModalOpen(true);
    if (suppliers.length === 0) {
      fetchSuppliers();
    }
  };

  const handleCloseApprove = () => {
    setApproveModalOpen(false);
    setApprovingRequest(null);
    setApproveItems([]);
    setApproveNote('');
    setApproveSupplierId(undefined);
  };

  const handleUpdateApproveItem = (itemId: number, field: keyof ApproveItemPayload, val: any) => {
    setApproveItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, [field]: val } : item))
    );
  };

  /**
   * Tính toán sẵn tổng số lượng thực nhận để component hiển thị trực tiếp (không tính logic trong component)
   */
  const totalApprovedQuantity = useMemo(() => {
    return approveItems.reduce((sum, it) => sum + (Number(it.approvedQuantity) || 0), 0);
  }, [approveItems]);

  /**
   * Chuẩn bị danh sách mặt hàng kèm số lượng kiểm đếm cho Modal Duyệt
   */
  const modalApproveItems = useMemo(() => {
    if (!approvingRequest) return [];
    const map = new Map(approveItems.map((a) => [a.itemId, a]));
    return approvingRequest.items.map((it) => {
      const a = map.get(it.id);
      return {
        ...it,
        approvedQuantity: a?.approvedQuantity ?? it.requestedQuantity,
        actualCostPrice: a?.actualCostPrice ?? (it.expectedCostPrice || 0),
      };
    });
  }, [approvingRequest, approveItems]);

  const handleSubmitApprove = async () => {
    if (!approvingRequest) return;
    if (!approveSupplierId) {
      toast.error('Vui lòng chọn Nhà cung cấp trước khi phê duyệt nhập kho!');
      return;
    }

    try {
      setSubmittingApprove(true);
      await importRequestController.approveImportRequest(approvingRequest.id, {
        supplierId: approveSupplierId,
        note: approveNote.trim() || undefined,
        items: approveItems,
      });

      toast.success(`Đã phê duyệt và nhập kho thành công yêu cầu ${approvingRequest.code}`);
      handleCloseApprove();
      if (detailModalOpen) handleCloseDetail();
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Lỗi khi phê duyệt nhập kho');
    } finally {
      setSubmittingApprove(false);
    }
  };

  /**
   * Mở modal từ chối yêu cầu nhập kho
   */
  const handleOpenReject = (request: ImportRequest) => {
    setRejectingRequest(request);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleCloseReject = () => {
    setRejectModalOpen(false);
    setRejectingRequest(null);
    setRejectReason('');
  };

  const handleSubmitReject = async () => {
    if (!rejectingRequest) return;
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối yêu cầu nhập kho');
      return;
    }

    try {
      setSubmittingReject(true);
      await importRequestController.rejectImportRequest(rejectingRequest.id, {
        reason: rejectReason.trim(),
      });

      toast.success(`Đã từ chối yêu cầu nhập kho ${rejectingRequest.code}`);
      handleCloseReject();
      if (detailModalOpen) handleCloseDetail();
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Lỗi khi từ chối yêu cầu nhập kho');
    } finally {
      setSubmittingReject(false);
    }
  };

  return {
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
    refetch: fetchRequests,

    // Modal Details
    detailModalOpen,
    selectedRequest,
    onOpenDetail: handleOpenDetail,
    onCloseDetail: handleCloseDetail,

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
    onOpenApprove: handleOpenApprove,
    onCloseApprove: handleCloseApprove,
    onUpdateApproveItem: handleUpdateApproveItem,
    onSubmitApprove: handleSubmitApprove,

    // Modal Reject
    rejectModalOpen,
    rejectingRequest,
    rejectReason,
    setRejectReason,
    submittingReject,
    onOpenReject: handleOpenReject,
    onCloseReject: handleCloseReject,
    onSubmitReject: handleSubmitReject,
  };
}

