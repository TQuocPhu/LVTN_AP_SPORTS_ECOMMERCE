import { useState, useEffect, useCallback } from 'react';
import { OrderResponse } from '@/types/order';
import { customerOrderController } from '@/controllers/customer-order-controller';
import { orderController } from '@/controllers/order-controller';
import { useCart } from '@/context/CartContext';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { calculateRealTimeProgress } from '@/utils/logistics-sync';
import { calculateOrderDistanceKm } from '@/utils/geo-distance';
import { canRetryVNPayOrder } from '@/utils/vnpay-retry';

export type CustomerOrderStatusTab =
  | 'ALL'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'shipping'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'returned';

export function useCustomerOrders() {
  const { refreshCart } = useCart();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<CustomerOrderStatusTab>('ALL');
  const { keyword, debouncedKeyword, setKeyword } = useDebouncedSearch('', 400);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('DESC');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [selectedOrderProgress, setSelectedOrderProgress] = useState<number>(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  // Mã đơn hàng đang khởi tạo lại liên kết thanh toán VNPay (chống bấm trùng)
  const [retryingCode, setRetryingCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal xác nhận hủy / trả hàng / hoàn tất đơn
  const [actionModal, setActionModal] = useState<{
    type: 'cancel' | 'return' | 'complete' | null;
    order: OrderResponse | null;
    reason: string;
  }>({ type: null, order: null, reason: '' });

  // Cập nhật tiến trình xe giao hàng mỗi 2 giây khi đang mở modal chi tiết đơn hàng
  useEffect(() => {
    if (!isDetailModalOpen || !selectedOrder) {
      setSelectedOrderProgress(0);
      return;
    }

    const updateProgress = () => {
      const distKm = calculateOrderDistanceKm(
        selectedOrder.gpsLatitude || selectedOrder.shippingAddress?.latitude,
        selectedOrder.gpsLongitude || selectedOrder.shippingAddress?.longitude
      );
      setSelectedOrderProgress(
        calculateRealTimeProgress(selectedOrder.status, selectedOrder.updatedAt, distKm)
      );
    };

    updateProgress();
    if (selectedOrder.status?.toLowerCase() !== 'shipping') {
      return;
    }

    const interval = setInterval(updateProgress, 2000);
    return () => clearInterval(interval);
  }, [isDetailModalOpen, selectedOrder]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerOrderController.getMyOrders(
        activeTab,
        debouncedKeyword,
        sortBy,
        sortDir,
        page,
        10,
        startDate,
        endDate
      );
      if (res && res.data) {
        setOrders(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Lỗi nạp danh sách đơn hàng khách hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, debouncedKeyword, sortBy, sortDir, page, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Lắng nghe sự kiện WebSocket /topic/orders để tự động cập nhật danh sách và modal chi tiết đơn hàng
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOrdersUpdated = async (event: Event) => {
      const detail = (event as CustomEvent<{ orderId?: number; orderCode?: string } | null>).detail;
      fetchOrders();
      if (
        isDetailModalOpen &&
        selectedOrder?.orderCode &&
        (!detail?.orderCode || detail.orderCode === selectedOrder.orderCode)
      ) {
        try {
          const res = await customerOrderController.getOrderByCode(selectedOrder.orderCode);
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
  }, [fetchOrders, isDetailModalOpen, selectedOrder?.orderCode]);

  const handleTabChange = useCallback((tab: CustomerOrderStatusTab) => {
    setActiveTab(tab);
    setPage(0);
  }, []);

  const handleOpenDetailModal = useCallback((order: OrderResponse) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const handleOpenActionModal = useCallback(
    (type: 'cancel' | 'return' | 'complete', order: OrderResponse) => {
      setActionModal({ type, order, reason: '' });
    },
    []
  );

  const handleCloseActionModal = useCallback(() => {
    setActionModal({ type: null, order: null, reason: '' });
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!actionModal.type || !actionModal.order) return;
    const { type, order, reason } = actionModal;
    try {
      setUpdatingCode(order.orderCode);
      let res;
      if (type === 'cancel') {
        res = await customerOrderController.cancelMyOrder(order.orderCode, reason);
        setToastMessage(`Đã hủy thành công đơn hàng #${order.orderCode}`);
        await refreshCart(); // Gọi refresh để update số lượng trên icon giỏ hàng
      } else if (type === 'complete') {
        res = await customerOrderController.completeMyOrder(order.orderCode);
        setToastMessage(`Đã xác nhận nhận hàng và hoàn tất đơn hàng #${order.orderCode}`);
      } else {
        res = await customerOrderController.returnMyOrder(order.orderCode, reason);
        setToastMessage(`Đã gửi yêu cầu Trả Hàng / Hoàn Tiền cho đơn #${order.orderCode}`);
      }

      if (res && res.data) {
        // Cập nhật mảng orders cục bộ
        setOrders((prev) =>
          prev.map((o) => (o.orderCode === order.orderCode ? res.data : o))
        );
        if (selectedOrder?.orderCode === order.orderCode) {
          setSelectedOrder(res.data);
        }
      }
      handleCloseActionModal();
      fetchOrders();
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error(`Lỗi thực hiện thao tác ${type}:`, err);
    } finally {
      setUpdatingCode(null);
    }
  }, [actionModal, selectedOrder, handleCloseActionModal, fetchOrders, refreshCart]);

  /**
   * Kiểm tra đơn hàng có đủ điều kiện hiển thị nút "Thanh Toán Lại VNPay" hay không
   * (Dùng chung helper canRetryVNPayOrder đồng bộ với Backend: đúng VNPAY, chưa paid, trong hạn 24h từ payments.created_at)
   */
  const canRetryVNPay = useCallback((order: OrderResponse): boolean => {
    return canRetryVNPayOrder(order);
  }, []);

  /**
   * Khởi tạo lại liên kết thanh toán VNPay cho đơn hàng chưa thanh toán thành công
   */
  const handleRetryVNPay = useCallback(
    async (orderCode: string) => {
      if (!orderCode || retryingCode) return;
      try {
        setRetryingCode(orderCode);
        const res = await orderController.retryVNPayPayment(orderCode);
        if (res?.data?.paymentUrl && typeof window !== 'undefined') {
          window.location.href = res.data.paymentUrl;
          return;
        }
        setToastMessage('Không thể khởi tạo liên kết thanh toán VNPay. Vui lòng thử lại.');
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể khởi tạo lại thanh toán VNPay cho đơn hàng này.';
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
        fetchOrders();
      } finally {
        setRetryingCode(null);
      }
    },
    [retryingCode, fetchOrders]
  );

  const formatCurrency = useCallback((val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  }, []);

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  return {
    orders,
    loading,
    activeTab,
    keyword,
    setKeyword,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    page,
    totalPages,
    setPage,
    selectedOrder,
    isDetailModalOpen,
    updatingCode,
    retryingCode,
    toastMessage,
    setToastMessage,
    actionModal,
    setActionModal,
    handleTabChange,
    handleOpenDetailModal,
    handleCloseDetailModal,
    handleOpenActionModal,
    handleCloseActionModal,
    handleConfirmAction,
    canRetryVNPay,
    handleRetryVNPay,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleResetDates: () => {
      setStartDate('');
      setEndDate('');
      setPage(0);
    },
    refetch: fetchOrders,
    selectedOrderProgress,
    formatCurrency,
    formatDate,
  };
}
