'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Truck, 
  Star, 
  AlertTriangle, 
  Info, 
  Bell,
  CheckCheck,
  Mail,
  MailOpen
} from 'lucide-react';
import { useNotificationContext } from '@/context/NotificationContext';
import { NotificationPayload } from '@/hooks/useWebSocket';

export type AdminNotificationTab = 
  | 'ALL' 
  | 'UNREAD' 
  | 'READ' 
  | 'SHIPPING' 
  | 'ORDERS' 
  | 'REVIEWS' 
  | 'INVENTORY';

export function useAdminNotifications() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
  const [activeTab, setActiveTab] = useState<AdminNotificationTab>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'DESC' | 'ASC'>('DESC');

  const resetDateFilter = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setSortOrder('DESC');
  }, []);

  const setQuickDatePreset = useCallback((preset: 'today' | '7days' | '30days') => {
    const now = new Date();
    const endStr = now.toISOString().split('T')[0];
    const start = new Date();
    if (preset === 'today') {
      // start is today
    } else if (preset === '7days') {
      start.setDate(now.getDate() - 7);
    } else if (preset === '30days') {
      start.setDate(now.getDate() - 30);
    }
    const startStr = start.toISOString().split('T')[0];
    setStartDate(startStr);
    setEndDate(endStr);
  }, []);

  const filteredNotifications = useMemo(() => {
    const list = notifications.filter((notif) => {
      const isRead = notif.isRead === true || (notif as any).read === true;
      if (activeTab === 'UNREAD') {
        if (isRead) return false;
      } else if (activeTab === 'READ') {
        if (!isRead) return false;
      } else if (activeTab === 'ORDERS') {
        const isOrder = [
          'ORDER_PLACED',
          'ORDER_STATUS_CHANGED',
          'ORDER_CANCELLED_BY_CUSTOMER',
          'ORDER_CANCELLED_BY_ADMIN',
          'ORDER_DELIVERED',
          'PAYMENT_SUCCESS',
        ].includes(notif.actionType);
        if (!isOrder) return false;
      } else if (activeTab === 'SHIPPING') {
        if (notif.actionType !== 'GHN_ORDER_UPDATE') return false;
      } else if (activeTab === 'REVIEWS') {
        if (!['NEW_REVIEW', 'REVIEW_REPLIED'].includes(notif.actionType)) return false;
      } else if (activeTab === 'INVENTORY') {
        if (!['LOW_INVENTORY', 'OUT_OF_STOCK'].includes(notif.actionType)) return false;
      }

      // Filter by Date
      if (startDate) {
        const notifDate = new Date(notif.createdAt);
        const start = new Date(`${startDate}T00:00:00`);
        if (notifDate < start) return false;
      }
      if (endDate) {
        const notifDate = new Date(notif.createdAt);
        const end = new Date(`${endDate}T23:59:59`);
        if (notifDate > end) return false;
      }

      return true;
    });

    // Sort by Date
    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'DESC' ? timeB - timeA : timeA - timeB;
    });
  }, [notifications, activeTab, startDate, endDate, sortOrder]);

  const tabCounts = useMemo(() => {
    const unreadList = notifications.filter((n) => !(n.isRead === true || (n as any).read === true));
    const readList = notifications.filter((n) => (n.isRead === true || (n as any).read === true));
    return {
      ALL: notifications.length,
      UNREAD: unreadList.length,
      READ: readList.length,
      ORDERS: notifications.filter((n) =>
        [
          'ORDER_PLACED',
          'ORDER_STATUS_CHANGED',
          'ORDER_CANCELLED_BY_CUSTOMER',
          'ORDER_CANCELLED_BY_ADMIN',
          'ORDER_DELIVERED',
          'PAYMENT_SUCCESS',
        ].includes(n.actionType)
      ).length,
      SHIPPING: notifications.filter((n) => n.actionType === 'GHN_ORDER_UPDATE').length,
      REVIEWS: notifications.filter((n) =>
        ['NEW_REVIEW', 'REVIEW_REPLIED'].includes(n.actionType)
      ).length,
      INVENTORY: notifications.filter((n) =>
        ['LOW_INVENTORY', 'OUT_OF_STOCK'].includes(n.actionType)
      ).length,
    };
  }, [notifications]);

  const tabs = useMemo(() => [
    { key: 'ALL' as AdminNotificationTab, label: 'Tất cả', icon: Bell, count: tabCounts.ALL },
    { key: 'UNREAD' as AdminNotificationTab, label: 'Chưa đọc', icon: Mail, count: tabCounts.UNREAD },
    { key: 'READ' as AdminNotificationTab, label: 'Đã đọc', icon: MailOpen, count: tabCounts.READ },
    { key: 'SHIPPING' as AdminNotificationTab, label: 'Vận chuyển GHN', icon: Truck, count: tabCounts.SHIPPING },
    { key: 'ORDERS' as AdminNotificationTab, label: 'Đơn hàng', icon: ShoppingBag, count: tabCounts.ORDERS },
    { key: 'REVIEWS' as AdminNotificationTab, label: 'Đánh giá', icon: Star, count: tabCounts.REVIEWS },
    { key: 'INVENTORY' as AdminNotificationTab, label: 'Kho hàng', icon: AlertTriangle, count: tabCounts.INVENTORY },
  ], [tabCounts]);

  const handleNotificationClick = useCallback(async (id: number, url?: string) => {
    await markAsRead(id);
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.location.href = url;
      } else {
        router.push(url);
      }
    }
  }, [markAsRead, router]);

  const getActionMeta = useCallback((actionType: string) => {
    switch (actionType) {
      case 'GHN_ORDER_UPDATE':
        return {
          icon: Truck,
          colorClass: 'text-orange-600 bg-orange-50 border-orange-200',
          badgeText: 'Vận Chuyển GHN',
          badgeClass: 'bg-orange-100 text-orange-700',
        };
      case 'ORDER_PLACED':
      case 'ORDER_STATUS_CHANGED':
      case 'ORDER_CANCELLED_BY_CUSTOMER':
      case 'ORDER_CANCELLED_BY_ADMIN':
      case 'ORDER_DELIVERED':
      case 'PAYMENT_SUCCESS':
        return {
          icon: ShoppingBag,
          colorClass: 'text-blue-600 bg-blue-50 border-blue-200',
          badgeText: 'Đơn Hàng',
          badgeClass: 'bg-blue-100 text-blue-700',
        };
      case 'NEW_REVIEW':
      case 'REVIEW_REPLIED':
        return {
          icon: Star,
          colorClass: 'text-amber-600 bg-amber-50 border-amber-200',
          badgeText: 'Đánh Giá',
          badgeClass: 'bg-amber-100 text-amber-700',
        };
      case 'LOW_INVENTORY':
      case 'OUT_OF_STOCK':
        return {
          icon: AlertTriangle,
          colorClass: 'text-rose-600 bg-rose-50 border-rose-200',
          badgeText: 'Kho Hàng',
          badgeClass: 'bg-rose-100 text-rose-700',
        };
      default:
        return {
          icon: Info,
          colorClass: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          badgeText: 'Hệ Thống',
          badgeClass: 'bg-indigo-100 text-indigo-700',
        };
    }
  }, []);

  const formatContent = useCallback((notif: NotificationPayload) => {
    let payloadObj: Record<string, any> = {};
    try {
      payloadObj = JSON.parse(notif.payload || '{}');
    } catch {
      payloadObj = {};
    }

    let title = notif.title;
    if (!title) {
      switch (notif.actionType) {
        case 'GHN_ORDER_UPDATE':
          title = `GHN cập nhật vận đơn #${payloadObj.orderCode || 'N/A'}`;
          break;
        case 'ORDER_PLACED':
          title = `Đơn hàng mới #${payloadObj.orderCode || 'N/A'}`;
          break;
        case 'ORDER_STATUS_CHANGED':
          title = `Đơn hàng #${payloadObj.orderCode || 'N/A'} cập nhật trạng thái`;
          break;
        case 'ORDER_CANCELLED_BY_CUSTOMER':
          title = `Khách hàng yêu cầu hủy đơn #${payloadObj.orderCode || 'N/A'}`;
          break;
        case 'ORDER_DELIVERED':
          title = `Đơn hàng #${payloadObj.orderCode || 'N/A'} giao thành công`;
          break;
        case 'NEW_REVIEW':
          title = `Đánh giá mới cho ${payloadObj.productName || 'sản phẩm'}`;
          break;
        case 'LOW_INVENTORY':
          title = `Cảnh báo tồn kho thấp`;
          break;
        case 'OUT_OF_STOCK':
          title = `Cảnh báo hết hàng trong kho`;
          break;
        default:
          title = 'Thông báo hệ thống AP Sports';
      }
    }

    let message = notif.message;
    if (!message || message.startsWith('{')) {
      switch (notif.actionType) {
        case 'GHN_ORDER_UPDATE':
          message = `Bưu cục / Shipper GHN đã cập nhật trạng thái đơn hàng #${payloadObj.orderCode}: [${payloadObj.newStatus || ''}].`;
          break;
        case 'ORDER_PLACED':
          message = `Khách hàng vừa đặt đơn hàng trị giá ${payloadObj.totalAmount ? Number(payloadObj.totalAmount).toLocaleString('vi-VN') : 0} VNĐ. Vui lòng xác nhận đơn.`;
          break;
        case 'ORDER_STATUS_CHANGED':
          message = `Trạng thái đơn hàng #${payloadObj.orderCode}: "${payloadObj.oldStatus || ''}" ➔ "${payloadObj.newStatus || ''}".`;
          break;
        case 'ORDER_CANCELLED_BY_CUSTOMER':
          message = `Khách hàng đã hủy đơn hàng #${payloadObj.orderCode}. Vui lòng kiểm tra và xử lý hoàn tiền nếu có.`;
          break;
        case 'NEW_REVIEW':
          message = `Khách hàng vừa gửi đánh giá ${payloadObj.rating || 0} sao. Kiểm duyệt và phản hồi ngay.`;
          break;
        case 'LOW_INVENTORY':
          message = `Sản phẩm "${payloadObj.productName || ''}" chỉ còn ${payloadObj.remaining || 0} sản phẩm trong kho.`;
          break;
        case 'OUT_OF_STOCK':
          message = `Sản phẩm "${payloadObj.productName || ''}" đã hết hàng trong kho. Vui lòng nhập thêm hàng.`;
          break;
        default:
          message = 'Nhấp vào để xem chi tiết.';
      }
    }

    let senderName = notif.senderName || 'Hệ thống AP Sports';
    let senderAvatar = notif.senderAvatar;
    if (notif.actionType === 'GHN_ORDER_UPDATE') {
      if (!senderName || senderName === 'Hệ thống AP Sports') {
        senderName = 'Giao Hàng Nhanh (GHN)';
      }
      if (!senderAvatar) {
        senderAvatar = 'https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png';
      }
    }

    return {
      title: title || 'Thông báo hệ thống AP Sports',
      message: message || 'Nhấp vào để xem chi tiết.',
      senderName,
      senderAvatar,
    };
  }, []);

  return {
    notifications,
    filteredNotifications,
    unreadCount,
    activeTab,
    setActiveTab,
    tabCounts,
    tabs,
    startDate,
    endDate,
    sortOrder,
    setStartDate,
    setEndDate,
    setSortOrder,
    resetDateFilter,
    setQuickDatePreset,
    handleNotificationClick,
    markAsRead,
    markAllAsRead,
    getActionMeta,
    formatContent,
  };
}
