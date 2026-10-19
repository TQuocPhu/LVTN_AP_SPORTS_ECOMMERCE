'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminOrderDetail } from '@/types/admin-order';
import { warehouseFulfillmentController } from '@/controllers/warehouse-fulfillment-controller';
import { toast } from 'sonner';

export function usePendingPackingOrders() {
  const [orders, setOrders] = useState<AdminOrderDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await warehouseFulfillmentController.getOrdersPendingPacking();
      if (res && res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải đơn hàng chờ đóng gói:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderPacked = useCallback((updated: AdminOrderDetail) => {
    setOrders((prev) => prev.filter((o) => o.id !== updated.id));
    setSelectedOrder(null);
    toast.success(`Đơn hàng #${updated.orderCode} đã kiểm đếm Barcode 100% và sẵn sàng xuất kho!`);
  }, []);

  return {
    orders,
    loading,
    selectedOrder,
    setSelectedOrder,
    refreshOrders: fetchOrders,
    handleOrderPacked,
  };
}
