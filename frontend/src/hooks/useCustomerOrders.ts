import { useState, useEffect, useCallback } from 'react';
import { OrderResponse } from '@/types/order';
import { customerOrderController } from '@/controllers/customer-order-controller';

export type CustomerOrderStatusTab =
  | 'ALL'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export function useCustomerOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<CustomerOrderStatusTab>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<string>('DESC');
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal xác nhận hủy / trả hàng
  const [actionModal, setActionModal] = useState<{
    type: 'cancel' | 'return' | null;
    order: OrderResponse | null;
    reason: string;
  }>({ type: null, order: null, reason: '' });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customerOrderController.getMyOrders(
        activeTab,
        keyword,
        sortBy,
        sortDir,
        page,
        10
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
  }, [activeTab, keyword, sortBy, sortDir, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
    (type: 'cancel' | 'return', order: OrderResponse) => {
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
  }, [actionModal, selectedOrder, handleCloseActionModal, fetchOrders]);

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
    refetch: fetchOrders,
    formatCurrency,
    formatDate,
  };
}
