import { useState, useEffect, useCallback, useRef } from 'react';
import { adminOrderController } from '@/controllers/admin-order-controller';
import {
  AdminOrderDetail,
  AdminOrderFilterParams,
  AdminOrderSummary,
} from '@/types/admin-order';
import { useExcelExport } from '@/hooks/useExcelExport';
import { downloadStyledExcelWorkbook } from '@/utils/excelExportBuilder';

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

  // Export Excel State
  isExporting: boolean;
  handleExportExcel: () => void;
}

const DEFAULT_FILTERS: AdminOrderFilterParams = {
  keyword: '',
  status: 'ALL',
  paymentMethod: 'ALL',
  paymentStatus: 'ALL',
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

  // Debounce 400ms cho từ khóa tìm kiếm đơn hàng
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>(filters.keyword || '');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filters.keyword || '');
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Quản lý AbortController để hủy request cũ khi thay đổi bộ lọc / từ khóa
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Fetch Orders List có Debounce và AbortSignal
  const fetchOrders = useCallback(async () => {
    // 1. Hủy request đang bay trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoadingOrders(true);
    try {
      const queryParams: AdminOrderFilterParams = {
        ...filters,
        keyword: debouncedKeyword.trim() || undefined,
      };
      const res = await adminOrderController.getOrders(queryParams, {
        signal: controller.signal,
      });
      if (res && res.data) {
        setOrders(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setOrders([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (err: unknown) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError'))
      ) {
        return; // Request bị abort bởi từ khóa mới, bỏ qua
      }
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [
    debouncedKeyword,
    filters.status,
    filters.paymentMethod,
    filters.paymentStatus,
    filters.minPrice,
    filters.maxPrice,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.size,
    filters.sortBy,
    filters.sortDir,
  ]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchOrders();
    // Cleanup hủy request khi component bị unmount
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchOrders]);

  // Lắng nghe sự kiện WebSocket /topic/orders để tự động cập nhật danh sách, thống kê và modal chi tiết
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOrdersUpdated = async (event: Event) => {
      const detail = (event as CustomEvent<{ orderId?: number } | null>).detail;
      fetchOrders();
      fetchSummary();
      if (
        isDetailModalOpen &&
        selectedOrder?.id &&
        (!detail?.orderId || detail.orderId === selectedOrder.id)
      ) {
        try {
          const res = await adminOrderController.getOrderById(selectedOrder.id);
          if (res && res.data) {
            setSelectedOrder(res.data);
          }
        } catch {
          // Bỏ qua lỗi cập nhật ngầm
        }
      }
    };

    window.addEventListener('orders_updated', handleOrdersUpdated);
    return () => window.removeEventListener('orders_updated', handleOrdersUpdated);
  }, [fetchOrders, fetchSummary, isDetailModalOpen, selectedOrder?.id]);

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

  // Update Status modal handlers — tự động chọn trạng thái kế tiếp hợp lệ đầu tiên để tránh gửi nhầm trạng thái cũ
  const handleOpenUpdateStatusModal = (order: AdminOrderDetail) => {
    const curr = order.status?.toLowerCase() || '';
    const isUnpaidVnPay =
      order.paymentMethod?.toUpperCase() === 'VNPAY' &&
      order.paymentStatus?.toLowerCase() !== 'completed';

    let defaultNextStatus = 'confirmed';
    switch (curr) {
      case 'pending':
        defaultNextStatus = isUnpaidVnPay ? 'cancelled' : 'confirmed';
        break;
      case 'confirmed':
        defaultNextStatus = 'processing';
        break;
      case 'processing':
        defaultNextStatus = 'shipped';
        break;
      case 'shipped':
        defaultNextStatus = 'shipping';
        break;
      case 'shipping':
        defaultNextStatus = 'delivered';
        break;
      case 'delivered':
        defaultNextStatus = 'completed';
        break;
      default:
        defaultNextStatus = '';
        break;
    }

    setOrderToUpdate(order);
    setNewStatus(defaultNextStatus);
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

  const { isExporting, runExport } = useExcelExport();

  /**
   * Xuất toàn bộ danh sách đơn hàng khớp bộ lọc hiện tại (không phân trang, tối đa 5.000 dòng) ra file Excel (.xlsx).
   */
  const handleExportExcel = useCallback(() => {
    runExport(async () => {
      const res = await adminOrderController.exportOrders(filters);
      const rows = res.data || [];
      const dateStr = new Date().toISOString().slice(0, 10);
      await downloadStyledExcelWorkbook(`Danh_Sach_Don_Hang_${dateStr}.xlsx`, [
        {
          sheetName: 'Don hang chi tiet',
          title: 'DANH SÁCH ĐƠN HÀNG QUẢN TRỊ (THEO BỘ LỌC)',
          filterSummary: `Trạng thái: ${filters.status || 'ALL'} | Thanh toán: ${filters.paymentMethod || 'ALL'} | Từ ngày: ${filters.startDate || '---'} đến ${filters.endDate || '---'}`,
          columns: [
            { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, i) => i + 1 },
            { header: 'Mã đơn', key: 'orderCode', type: 'text' },
            { header: 'Ngày đặt', key: 'createdAt', type: 'datetime' },
            { header: 'Khách hàng', key: 'customerName', type: 'text' },
            { header: 'Số điện thoại', key: 'customerPhone', type: 'text' },
            { header: 'Email', key: 'customerEmail', type: 'text' },
            { header: 'Địa chỉ giao hàng', key: 'shippingAddress', type: 'text', width: 38 },
            {
              header: 'Sản phẩm & Biến thể',
              key: 'itemsSummary',
              type: 'text',
              width: 42,
              valueGetter: (o) =>
                (o.items || [])
                  .map((it: any) => `${it.productName}${it.variantInfo ? ` [${it.variantInfo}]` : ''} x${it.quantity}`)
                  .join('; ') || '---',
            },
            { header: 'Tạm tính', key: 'totalAmount', type: 'currency' },
            { header: 'Mã Voucher', key: 'voucherCode', type: 'text', valueGetter: (o) => o.voucherCode || '---' },
            { header: 'Tiền giảm', key: 'discountAmount', type: 'currency' },
            { header: 'Phí vận chuyển', key: 'shippingFee', type: 'currency' },
            { header: 'Tổng thanh toán', key: 'finalAmount', type: 'currency' },
            { header: 'Phương thức TT', key: 'paymentMethod', type: 'text' },
            { header: 'Trạng thái TT', key: 'paymentStatus', type: 'text' },
            { header: 'Trạng thái đơn', key: 'status', type: 'text' },
            { header: 'Nhân viên xử lý', key: 'processedByName', type: 'text', valueGetter: (o) => o.processedByName || '---' },
            { header: 'Ghi chú / Lý do hủy', key: 'note', type: 'text', valueGetter: (o) => o.cancelReason || o.note || '---' },
          ],
          rows,
        },
      ]);
      return rows.length;
    });
  }, [filters, runExport]);

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
    isExporting,
    handleExportExcel,
  };
}
