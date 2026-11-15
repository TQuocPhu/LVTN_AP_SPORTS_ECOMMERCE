import { useState, useEffect, useCallback } from 'react';
import { demoLogisticsController } from '@/controllers/demo-logistics-controller';
import { AdminOrderDetail } from '@/types/admin-order';
import { calculateRealTimeProgress } from '@/utils/logistics-sync';
import { calculateOrderDistanceKm } from '@/utils/geo-distance';

export function useDemoLogistics(targetStatus: string) {
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bộ đếm tick mỗi 2 giây để đồng bộ tiến độ xe chạy theo thời gian thực trên Portal Giao Hàng
  const [, setProgressTick] = useState<number>(0);

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

  const handleUpdateStatus = useCallback(
    async (orderId: number, nextStatus: string, note?: string) => {
      setUpdatingId(orderId);
      try {
        const res = await demoLogisticsController.updateOrderStatus(orderId, {
          status: nextStatus,
          note: note || `Cập nhật trạng thái từ Portal Logistics sang ${nextStatus.toUpperCase()}`,
        });
        if (res && res.data) {
          await fetchOrders();
        }
      } catch (err) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng logistics:', err);
      } finally {
        setUpdatingId(null);
      }
    },
    [fetchOrders]
  );

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
    formatCurrency,
    formatDate,
  };
}
