import { useState, useEffect, useCallback } from 'react';
import { AdminOrderDetail } from '@/types/admin-order';
import { OrderStatus } from '@/types/order';
import { adminOrderController } from '@/controllers/admin-order-controller';
import { calculateRealTimeProgress } from '@/utils/logistics-sync';
import { calculateOrderDistanceKm } from '@/utils/geo-distance';

interface UseAdminOrderDetailModalParams {
  order: AdminOrderDetail | null;
  onStatusUpdated?: () => void;
}

export function useAdminOrderDetailModal({
  order,
  onStatusUpdated,
}: UseAdminOrderDetailModalParams) {
  const [einvoiceSent, setEinvoiceSent] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [localOrder, setLocalOrder] = useState<AdminOrderDetail | null>(order);
  const [simProgress, setSimProgress] = useState<number>(0);

  // Synchronize localOrder when prop order changes
  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  const currentOrder = localOrder || order;

  // Calculate real-time progress based on backend updatedAt timestamp and auto-tick every 2 seconds
  useEffect(() => {
    if (!currentOrder) {
      setSimProgress(0);
      return;
    }

    const updateProgress = () => {
      const distKm = calculateOrderDistanceKm(
        currentOrder.gpsLatitude || currentOrder.shippingAddress?.latitude,
        currentOrder.gpsLongitude || currentOrder.shippingAddress?.longitude
      );
      const prog = calculateRealTimeProgress(
        currentOrder.status,
        currentOrder.updatedAt,
        distKm
      );
      setSimProgress(prog);
    };

    updateProgress();

    // Auto tick real-time progress every 2 seconds for live smooth vehicle animation
    const interval = setInterval(updateProgress, 2000);
    return () => clearInterval(interval);
  }, [currentOrder?.status, currentOrder?.updatedAt]);

  const handleSendEinvoice = useCallback(() => {
    setEinvoiceSent(true);
    setToastMessage(
      `Đã phát hóa đơn điện tử E-Invoice cho đơn #${currentOrder?.orderCode} gửi tới ${
        currentOrder?.customerEmail || 'email khách hàng'
      }.`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, [currentOrder]);

  const handleUpdateStatus = useCallback(
    async (newStatus: OrderStatus, note?: string) => {
      if (!currentOrder?.id) return;
      try {
        setUpdatingStatus(true);
        let res;
        if (newStatus === 'confirmed') {
          res = await adminOrderController.confirmOrder(currentOrder.id);
        } else {
          res = await adminOrderController.updateOrderStatus(currentOrder.id, {
            status: newStatus,
            note: note || `Cập nhật trạng thái sang ${newStatus.toUpperCase()}`,
          });
        }

        if (res && res.data) {
          setLocalOrder(res.data);
          setToastMessage(`Đã cập nhật trạng thái đơn sang "${newStatus.toUpperCase()}"`);
          setTimeout(() => setToastMessage(null), 3000);
          onStatusUpdated?.();
        }
      } catch (err: any) {
        console.error('Lỗi cập nhật trạng thái đơn:', err);
      } finally {
        setUpdatingStatus(false);
      }
    },
    [currentOrder, onStatusUpdated]
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
      second: '2-digit',
    });
  }, []);

  return {
    currentOrder,
    einvoiceSent,
    toastMessage,
    setToastMessage,
    updatingStatus,
    simProgress,
    setSimProgress,
    handleSendEinvoice,
    handleUpdateStatus,
    formatCurrency,
    formatDate,
  };
}
