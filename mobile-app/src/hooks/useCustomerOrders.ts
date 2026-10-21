import { useState, useEffect, useCallback, useMemo } from 'react';
import { customerOrderController } from '../controllers/customer-order-controller';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';

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
      const res = await customerOrderController.getMyOrders(activeTab);
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
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [fetchOrders, isAuthenticated]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const getStatusBadge = useCallback((status: OrderStatus | string) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xử lý', bg: '#fef3c7', text: '#d97706' };
      case 'confirmed':
        return { label: 'Đã xác nhận', bg: '#e0f2fe', text: '#0284c7' };
      case 'processing':
        return { label: 'Đang đóng gói', bg: '#f3e8ff', text: '#7c3aed' };
      case 'shipping':
        return { label: 'Đang giao hàng', bg: '#e0e7ff', text: '#4338ca' };
      case 'delivered':
        return { label: 'Giao thành công', bg: '#dcfce7', text: '#15803d' };
      case 'completed':
        return { label: 'Hoàn tất', bg: '#dcfce7', text: '#166534' };
      case 'cancelled':
        return { label: 'Đã hủy', bg: '#fee2e2', text: '#b91c1c' };
      default:
        return { label: status, bg: '#f1f5f9', text: '#475569' };
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
    orders,
    filteredOrders,
    loading,
    refreshing,
    onRefresh,
    getStatusBadge,
  };
};
