import { useState, useEffect, useCallback } from 'react';
import { demoLogisticsController } from '@/controllers/demo-logistics-controller';
import { AdminOrderDetail } from '@/types/admin-order';

export function useDemoLogistics(targetStatus: string) {
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await demoLogisticsController.getDemoOrders(targetStatus);
      if (res && res.data) {
        setOrders(res.data.content || []);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
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

  return {
    orders,
    loading,
    updatingId,
    refetch: fetchOrders,
    handleUpdateStatus,
    formatCurrency,
    formatDate,
  };
}
