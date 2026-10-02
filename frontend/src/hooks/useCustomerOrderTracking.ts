import { useState, useEffect, useCallback } from 'react';
import { orderController } from '@/controllers/order-controller';
import { OrderResponse } from '@/types/order';
import { calculateRealTimeProgress } from '@/utils/logistics-sync';
import { calculateOrderDistanceKm } from '@/utils/geo-distance';

export function useCustomerOrderTracking(orderCode: string) {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingVNPay, setRetryingVNPay] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0);

  const fetchOrder = useCallback(async () => {
    if (!orderCode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderController.getOrderByCode(orderCode);
      if (res && res.data) {
        setOrder(res.data);
        const distKm = calculateOrderDistanceKm(
          res.data.gpsLatitude || res.data.shippingAddress?.latitude,
          res.data.gpsLongitude || res.data.shippingAddress?.longitude
        );
        const target = calculateRealTimeProgress(
          res.data.status,
          res.data.updatedAt,
          distKm
        );
        setSimProgress(target);
      } else {
        setError('Không tìm thấy thông tin đơn hàng');
      }
    } catch (err: any) {
      setError(err?.message || 'Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [orderCode]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Auto tick real-time progress every 2 seconds for smooth live map movement
  useEffect(() => {
    if (!order) return;

    const updateProgress = () => {
      const distKm = calculateOrderDistanceKm(
        order.gpsLatitude || order.shippingAddress?.latitude,
        order.gpsLongitude || order.shippingAddress?.longitude
      );
      const target = calculateRealTimeProgress(
        order.status,
        order.updatedAt,
        distKm
      );
      setSimProgress(target);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 2000);
    return () => clearInterval(interval);
  }, [order?.status, order?.updatedAt]);

  const handleRetryVNPay = useCallback(async () => {
    if (!orderCode) return;
    setRetryingVNPay(true);
    try {
      const res = await orderController.retryVNPayPayment(orderCode);
      if (res && res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err: any) {
      console.error('Lỗi khi thử lại thanh toán VNPay:', err);
    } finally {
      setRetryingVNPay(false);
    }
  }, [orderCode]);

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
    order,
    loading,
    error,
    retryingVNPay,
    simProgress,
    setSimProgress,
    refetch: fetchOrder,
    handleRetryVNPay,
    formatCurrency,
    formatDate,
  };
}
