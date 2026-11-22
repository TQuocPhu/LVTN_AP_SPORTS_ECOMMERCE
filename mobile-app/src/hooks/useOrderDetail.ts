import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { customerOrderController } from '../controllers/customer-order-controller';
import { Order } from '../types';
import { subscribeOrderRealtime } from '../services/orderRealtimeSocket';
import {
  getMobileOrderStatusBadge,
  getMobilePaymentMethodLabel,
  getMobilePaymentStatusBadge,
} from '../constants/order-status';

export const useOrderDetail = (orderIdentifier: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchOrderDetail = useCallback(() => {
    setLoading(true);
    customerOrderController
      .getOrderByCode(orderIdentifier)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết đơn hàng:', err);
      })
      .finally(() => setLoading(false));
  }, [orderIdentifier]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Lắng nghe WebSocket /topic/orders để tự động cập nhật chi tiết đơn hàng trên Mobile App
  useEffect(() => {
    if (!orderIdentifier) return;
    const unsubscribe = subscribeOrderRealtime((event) => {
      if (!event.orderCode || event.orderCode === orderIdentifier) {
        customerOrderController
          .getOrderByCode(orderIdentifier)
          .then((res) => {
            setOrder(res.data);
          })
          .catch(() => {
            // Bỏ qua lỗi cập nhật ngầm
          });
      }
    });
    return unsubscribe;
  }, [orderIdentifier]);

  const handleCompleteOrder = useCallback(() => {
    if (!order) return;
    Alert.alert(
      'Xác nhận đã nhận hàng',
      'Bạn đã nhận được toàn bộ kiện hàng và hài lòng với chất lượng sản phẩm?',
      [
        { text: 'Chưa', style: 'cancel' },
        {
          text: 'Xác nhận hoàn tất',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await customerOrderController.completeOrder(order.orderCode);
              setOrder(res.data);
              Alert.alert('Thành công', 'Đơn hàng đã được xác nhận hoàn tất!');
            } catch (err: any) {
              Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể cập nhật đơn hàng.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }, [order]);

  const handleCancelOrder = useCallback(() => {
    if (!order) return;
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const res = await customerOrderController.cancelOrder(
                order.orderCode,
                'Khách hàng yêu cầu hủy trên mobile'
              );
              setOrder(res.data);
              Alert.alert('Đã hủy', 'Đơn hàng đã được hủy thành công.');
            } catch (err: any) {
              Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể hủy đơn hàng.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  }, [order]);

  const canReview = !!(order && (order.status === 'delivered' || order.status === 'completed'));
  const canComplete = !!(order && order.status === 'delivered');
  const canCancel = !!(order && (order.status === 'pending' || order.status === 'confirmed'));
  const orderStatusBadge = getMobileOrderStatusBadge(order?.status);
  const paymentStatusBadge = getMobilePaymentStatusBadge(order?.paymentStatus);
  const paymentMethodLabel = getMobilePaymentMethodLabel(order?.paymentMethod);

  return {
    order,
    loading,
    actionLoading,
    canReview,
    canComplete,
    canCancel,
    orderStatusBadge,
    paymentStatusBadge,
    paymentMethodLabel,
    fetchOrderDetail,
    handleCompleteOrder,
    handleCancelOrder,
  };
};
