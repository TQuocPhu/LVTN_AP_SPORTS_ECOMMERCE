import { useState, useEffect, useCallback } from 'react';
import { adminOrderController } from '@/controllers/admin-order-controller';
import {
  AdminOrderDetail,
  AdminOrderFilterParams,
  AdminOrderSummary,
} from '@/types/admin-order';

export interface UseAdminOrdersReturn {
  // Filters State
  filters: AdminOrderFilterParams;
  setFilters: React.Dispatch<React.SetStateAction<AdminOrderFilterParams>>;
  handleFilterChange: (key: keyof AdminOrderFilterParams, value: any) => void;
  handleResetFilters: () => void;
  handleSearch: () => void;

  // Data State
  orders: AdminOrderDetail[];
  summary: AdminOrderSummary | null;
  totalElements: number;
  totalPages: number;
  loadingOrders: boolean;
  loadingSummary: boolean;
  refetchOrders: () => Promise<void>;
  refetchSummary: () => Promise<void>;

  // Detail Modal State
  selectedOrder: AdminOrderDetail | null;
  loadingDetail: boolean;
  isDetailModalOpen: boolean;
  handleOpenDetailModal: (id: number) => Promise<void>;
  handleCloseDetailModal: () => void;

  // Confirm Action Handler
  handleConfirmOrder: (id: number) => Promise<void>;

  // Cancel Modal State
  orderToCancel: AdminOrderDetail | null;
  isCancelModalOpen: boolean;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  isSubmittingCancel: boolean;
  handleOpenCancelModal: (order: AdminOrderDetail) => void;
  handleCloseCancelModal: () => void;
  handleConfirmCancel: () => Promise<void>;

  // Update Status Modal State
  orderToUpdate: AdminOrderDetail | null;
  isUpdateStatusModalOpen: boolean;
  newStatus: string;
  setNewStatus: (status: string) => void;
  statusNote: string;
  setStatusNote: (note: string) => void;
  isSubmittingUpdateStatus: boolean;
  handleOpenUpdateStatusModal: (order: AdminOrderDetail) => void;
  handleCloseUpdateStatusModal: () => void;
  handleConfirmUpdateStatus: () => Promise<void>;
}

const DEFAULT_FILTERS: AdminOrderFilterParams = {
  keyword: '',
  status: 'ALL',
  paymentMethod: 'ALL',
  minPrice: undefined,
  maxPrice: undefined,
  startDate: '',
  endDate: '',
  page: 0,
  size: 10,
  sortBy: 'createdAt',
  sortDir: 'DESC',
};

export function useAdminOrders(): UseAdminOrdersReturn {
  // 1. Filter state
  const [filters, setFilters] = useState<AdminOrderFilterParams>(DEFAULT_FILTERS);

  // 2. Data states
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [summary, setSummary] = useState<AdminOrderSummary | null>(null);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  // 3. Detail modal state
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // 4. Cancel modal state
  const [orderToCancel, setOrderToCancel] = useState<AdminOrderDetail | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // 5. Update Status modal state
  const [orderToUpdate, setOrderToUpdate] = useState<AdminOrderDetail | null>(null);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('confirmed');
  const [statusNote, setStatusNote] = useState<string>('');
  const [isSubmittingUpdateStatus, setIsSubmittingUpdateStatus] = useState<boolean>(false);

  // Fetch Summary statistics KPI
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await adminOrderController.getOrderSummary();
      if (res && res.data) {
        setSummary(res.data);
      }
    } catch {
      // Silent catch
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Fetch Orders List
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await adminOrderController.getOrders(filters);
      if (res && res.data) {
        setOrders(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setOrders([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter handlers
  const handleFilterChange = (key: keyof AdminOrderFilterParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 0, // Reset to page 0 when non-page filters change
    }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 0 }));
  };

  // Open detail modal
  const handleOpenDetailModal = async (id: number) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const res = await adminOrderController.getOrderById(id);
      if (res && res.data) {
        setSelectedOrder(res.data);
      }
    } catch {
      // Handled by apiClient toast
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Fast Confirm order action
  const handleConfirmOrder = async (id: number) => {
    try {
      const res = await adminOrderController.confirmOrder(id);
      if (res && res.data) {
        await Promise.all([fetchOrders(), fetchSummary()]);
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(res.data);
        }
      }
    } catch {
      // Handled by apiClient toast
    }
  };

  // Cancel order modal handlers
  const handleOpenCancelModal = (order: AdminOrderDetail) => {
    setOrderToCancel(order);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel || !cancelReason.trim()) return;
    setIsSubmittingCancel(true);
    try {
      const res = await adminOrderController.cancelOrder(orderToCancel.id, {
        reason: cancelReason.trim(),
      });
      if (res && res.data) {
        handleCloseCancelModal();
        await Promise.all([fetchOrders(), fetchSummary()]);
        if (selectedOrder && selectedOrder.id === orderToCancel.id) {
          setSelectedOrder(res.data);
        }
      }
    } catch {
      // Handled by apiClient toast
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Update Status modal handlers
  const handleOpenUpdateStatusModal = (order: AdminOrderDetail) => {
    setOrderToUpdate(order);
    setNewStatus(order.status || 'confirmed');
    setStatusNote('');
    setIsUpdateStatusModalOpen(true);
  };

  const handleCloseUpdateStatusModal = () => {
    setIsUpdateStatusModalOpen(false);
    setOrderToUpdate(null);
    setStatusNote('');
  };

  const handleConfirmUpdateStatus = async () => {
    if (!orderToUpdate || !newStatus) return;
    setIsSubmittingUpdateStatus(true);
    try {
      const res = await adminOrderController.updateOrderStatus(orderToUpdate.id, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      if (res && res.data) {
        handleCloseUpdateStatusModal();
        await Promise.all([fetchOrders(), fetchSummary()]);
        if (selectedOrder && selectedOrder.id === orderToUpdate.id) {
          setSelectedOrder(res.data);
        }
      }
    } catch {
      // Handled by apiClient toast
    } finally {
      setIsSubmittingUpdateStatus(false);
    }
  };

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleResetFilters,
    handleSearch,
    orders,
    summary,
    totalElements,
    totalPages,
    loadingOrders,
    loadingSummary,
    refetchOrders: fetchOrders,
    refetchSummary: fetchSummary,
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
  };
}
