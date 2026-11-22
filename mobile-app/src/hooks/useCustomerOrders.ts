import { useState, useEffect, useCallback, useMemo } from 'react';
import { customerOrderController } from '../controllers/customer-order-controller';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { subscribeOrderRealtime } from '../services/orderRealtimeSocket';
import {
  getMobileOrderStatusBadge,
  MOBILE_PAYMENT_METHOD_FILTERS,
  MOBILE_PAYMENT_STATUS_FILTERS,
} from '../constants/order-status';

export interface StatusTab {
  key: string;
  label: string;
}

export const STATUS_TABS: StatusTab[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã nhận' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export const useCustomerOrders = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL');
  const [paymentStatus, setPaymentStatus] = useState<string>('ALL');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(isAuthenticated);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await customerOrderController.getMyOrders(
        activeTab,
        0,
        50,
        paymentMethod,
        paymentStatus
      );
      const data = res.data;
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data && Array.isArray(data.content)) {
        setOrders(data.content);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, paymentMethod, paymentStatus, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [fetchOrders, isAuthenticated]);

  // Lắng nghe WebSocket /topic/orders để tự động cập nhật danh sách đơn hàng trên Mobile App
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = subscribeOrderRealtime(() => {
      fetchOrders();
    });
    return unsubscribe;
  }, [isAuthenticated, fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== 'ALL' && o.status !== activeTab) return false;
      if (
        paymentMethod !== 'ALL' &&
        (o.paymentMethod || 'COD').toUpperCase() !== paymentMethod
      ) {
        return false;
      }
      if (
        paymentStatus !== 'ALL' &&
        (o.paymentStatus || 'pending').toLowerCase() !== paymentStatus
      ) {
        return false;
      }
      return true;
    });
  }, [orders, activeTab, paymentMethod, paymentStatus]);

  const getStatusBadge = useCallback((status: OrderStatus | string) => {
    return getMobileOrderStatusBadge(status);
  }, []);

  return {
    activeTab,
    setActiveTab,
    paymentMethod,
    setPaymentMethod,
    paymentStatus,
    setPaymentStatus,
    paymentMethodFilters: MOBILE_PAYMENT_METHOD_FILTERS,
    paymentStatusFilters: MOBILE_PAYMENT_STATUS_FILTERS,
    orders,
    filteredOrders,
    loading,
    refreshing,
    onRefresh,
    getStatusBadge,
  };
};
