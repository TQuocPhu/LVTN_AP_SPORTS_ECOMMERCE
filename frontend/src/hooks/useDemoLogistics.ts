import { useState, useEffect, useCallback } from 'react';
import { demoLogisticsController } from '@/controllers/demo-logistics-controller';
import { AdminOrderDetail, DemoShipperOption } from '@/types/admin-order';
import { calculateRealTimeProgress } from '@/utils/logistics-sync';
import { calculateOrderDistanceKm } from '@/utils/geo-distance';

export function useDemoLogistics(targetStatus: string) {
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bộ đếm tick mỗi 2 giây để đồng bộ tiến độ xe chạy theo thời gian thực trên Portal Giao Hàng
  const [, setProgressTick] = useState<number>(0);
  // Danh sách shipper và modal phân công shipper ở Portal 2 (shipped -> shipping)
  const [shippers, setShippers] = useState<DemoShipperOption[]>([]);
  const [loadingShippers, setLoadingShippers] = useState<boolean>(false);
  const [orderToAssign, setOrderToAssign] = useState<AdminOrderDetail | null>(null);
  const [selectedShipperId, setSelectedShipperId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await demoLogisticsController.getDemoOrders(targetStatus);
      if (res && res.data) {
        setOrders(res.data.content || []);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      setOrders([]);
      const errMsg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách đơn hàng.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [targetStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Nạp danh sách tài xế giao hàng (GHN_SHIPPER) khi ở Portal 2 (shipped)
  const fetchShippers = useCallback(async () => {
    if (targetStatus !== 'shipped') return;
    setLoadingShippers(true);
    try {
      const res = await demoLogisticsController.getAvailableShippers();
      if (res && res.data) {
        setShippers(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi nạp danh sách tài xế giao hàng:', err);
    } finally {
      setLoadingShippers(false);
    }
  }, [targetStatus]);

  useEffect(() => {
    fetchShippers();
  }, [fetchShippers]);

  const handleUpdateStatus = useCallback(
    async (orderId: number, nextStatus: string, note?: string, shipperId?: number) => {
      setUpdatingId(orderId);
      try {
        const res = await demoLogisticsController.updateOrderStatus(orderId, {
          status: nextStatus,
          note: note || `Cập nhật trạng thái từ Portal Logistics sang ${nextStatus.toUpperCase()}`,
          shipperId,
        });
        if (res && res.data) {
          await fetchOrders();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng logistics:', err);
        return false;
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchOrders]
  );

  const handleOpenAssignModal = useCallback(
    (order: AdminOrderDetail) => {
      setOrderToAssign(order);
      setSelectedShipperId((prev) => {
        if (prev && shippers.some((s) => s.id === prev)) return prev;
        return shippers[0]?.id ?? null;
      });
    },
    [shippers]
  );

  const handleCloseAssignModal = useCallback(() => {
    setOrderToAssign(null);
    setSelectedShipperId(null);
  }, []);

  const handleConfirmAssignAndShip = useCallback(async () => {
    if (!orderToAssign || !selectedShipperId) return;
    const assigned = shippers.find((s) => s.id === selectedShipperId);
    const note = assigned
      ? `Xe tải vận chuyển GHN đã xuất kho bàn giao cho tài xế ${assigned.name}${assigned.phoneNumber ? ` (${assigned.phoneNumber})` : ''} đi phát hàng`
      : 'Xe tải vận chuyển liên tỉnh GHN đã xuất kho bàn giao cho Shipper phát hàng';
    const ok = await handleUpdateStatus(orderToAssign.id, 'shipping', note, selectedShipperId);
    if (ok) {
      handleCloseAssignModal();
    }
  }, [orderToAssign, selectedShipperId, shippers, handleUpdateStatus, handleCloseAssignModal]);

  const formatCurrency = useCallback((val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
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

  // Tự động cập nhật tiến độ xe di chuyển mỗi 2 giây khi đang ở màn hình giao hàng (shipping)
  useEffect(() => {
    if (targetStatus !== 'shipping' || orders.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setProgressTick((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(timer);
  }, [targetStatus, orders.length]);

  // Lắng nghe sự kiện WebSocket /topic/orders để tự động đồng bộ danh sách đơn trên Cổng Logistics
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOrdersUpdated = () => {
      fetchOrders();
    };
    window.addEventListener('orders_updated', handleOrdersUpdated);
    return () => window.removeEventListener('orders_updated', handleOrdersUpdated);
  }, [fetchOrders]);

  /**
   * Tính toán phần trăm tiến độ di chuyển thực tế của một đơn hàng dựa trên tọa độ thật
   */
  const getOrderProgress = useCallback((order: AdminOrderDetail): number => {
    const distKm = calculateOrderDistanceKm(
      order.gpsLatitude || order.shippingAddress?.latitude,
      order.gpsLongitude || order.shippingAddress?.longitude
    );
    return calculateRealTimeProgress(order.status, order.updatedAt, distKm);
  }, []);

  return {
    orders,
    loading,
    updatingId,
    error,
    refetch: fetchOrders,
    handleUpdateStatus,
    getOrderProgress,
    shippers,
    loadingShippers,
    orderToAssign,
    selectedShipperId,
    setSelectedShipperId,
    handleOpenAssignModal,
    handleCloseAssignModal,
    handleConfirmAssignAndShip,
    formatCurrency,
    formatDate,
  };
}
