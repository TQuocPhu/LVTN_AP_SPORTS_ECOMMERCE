'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Truck, 
  Star, 
  Info, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  XCircle, 
  PackageCheck,
  AlertCircle,
  Bell,
  CheckCheck,
  Mail,
  MailOpen
} from 'lucide-react';
import { useNotificationContext } from '@/context/NotificationContext';
import { NotificationPayload } from '@/hooks/useWebSocket';

export type CustomerNotificationTab = 
  | 'ALL' 
  | 'UNREAD' 
  | 'READ' 
  | 'SHIPPING' 
  | 'ORDERS' 
  | 'REVIEWS' 
  | 'SYSTEM';

export interface ActionMeta {
  icon: React.ElementType;
  colorClass: string;
  badgeText: string;
  badgeClass: string;
  senderBadgeText: string;
  senderBadgeClass: string;
}

export function useCustomerNotifications() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
  const [activeTab, setActiveTab] = useState<CustomerNotificationTab>('ALL');
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
          'ORDER_PLACED_CUSTOMER',
          'ORDER_STATUS_CHANGED',
          'ORDER_DELIVERED',
          'ORDER_CANCELLED_BY_CUSTOMER',
          'ORDER_CANCELLED_BY_ADMIN',
          'PAYMENT_SUCCESS',
        ].includes(notif.actionType);
        if (!isOrder) return false;
      } else if (activeTab === 'SHIPPING') {
        if (notif.actionType !== 'GHN_ORDER_UPDATE') return false;
      } else if (activeTab === 'REVIEWS') {
        if (!['NEW_REVIEW', 'REVIEW_REPLIED'].includes(notif.actionType)) return false;
      } else if (activeTab === 'SYSTEM') {
        if (!['WELCOME', 'SYSTEM_ALERT', 'LOW_INVENTORY', 'OUT_OF_STOCK'].includes(notif.actionType)) return false;
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
          'ORDER_PLACED_CUSTOMER',
          'ORDER_STATUS_CHANGED',
          'ORDER_DELIVERED',
          'ORDER_CANCELLED_BY_CUSTOMER',
          'ORDER_CANCELLED_BY_ADMIN',
          'PAYMENT_SUCCESS',
        ].includes(n.actionType)
      ).length,
      SHIPPING: notifications.filter((n) => n.actionType === 'GHN_ORDER_UPDATE').length,
      REVIEWS: notifications.filter((n) =>
        ['NEW_REVIEW', 'REVIEW_REPLIED'].includes(n.actionType)
      ).length,
      SYSTEM: notifications.filter((n) =>
        ['WELCOME', 'SYSTEM_ALERT', 'LOW_INVENTORY', 'OUT_OF_STOCK'].includes(n.actionType)
      ).length,
    };
  }, [notifications]);

  const tabs = useMemo(() => [
    { key: 'ALL' as CustomerNotificationTab, label: 'Tất Cả', icon: Bell, count: tabCounts.ALL },
    { key: 'UNREAD' as CustomerNotificationTab, label: 'Chưa Đọc', icon: Mail, count: tabCounts.UNREAD },
    { key: 'READ' as CustomerNotificationTab, label: 'Đã Đọc', icon: MailOpen, count: tabCounts.READ },
    { key: 'SHIPPING' as CustomerNotificationTab, label: 'Vận Chuyển GHN', icon: Truck, count: tabCounts.SHIPPING },
    { key: 'ORDERS' as CustomerNotificationTab, label: 'Đơn Hàng', icon: ShoppingBag, count: tabCounts.ORDERS },
    { key: 'REVIEWS' as CustomerNotificationTab, label: 'Đánh Giá', icon: Star, count: tabCounts.REVIEWS },
    { key: 'SYSTEM' as CustomerNotificationTab, label: 'Hệ Thống', icon: Info, count: tabCounts.SYSTEM },
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

  const getActionMeta = useCallback((actionType: string): ActionMeta => {
    switch (actionType) {
      case 'GHN_ORDER_UPDATE':
        return {
          icon: Truck,
          colorClass: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-900',
          badgeText: 'Vận Chuyển GHN',
          badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
          senderBadgeText: 'Giao Hàng Nhanh',
          senderBadgeClass: 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        };
      case 'ORDER_PLACED':
      case 'ORDER_PLACED_CUSTOMER':
      case 'ORDER_STATUS_CHANGED':
      case 'ORDER_DELIVERED':
      case 'ORDER_CANCELLED_BY_CUSTOMER':
      case 'ORDER_CANCELLED_BY_ADMIN':
      case 'PAYMENT_SUCCESS':
        return {
          icon: ShoppingBag,
          colorClass: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900',
          badgeText: 'Đơn Hàng',
          badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
          senderBadgeText: 'Cửa hàng AP Sports',
          senderBadgeClass: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        };
      case 'NEW_REVIEW':
      case 'REVIEW_REPLIED':
        return {
          icon: Star,
          colorClass: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
          badgeText: 'Đánh Giá',
          badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
          senderBadgeText: 'Chăm sóc khách hàng',
          senderBadgeClass: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
        };
      default:
        return {
          icon: Info,
          colorClass: 'text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800',
          badgeText: 'Hệ Thống',
          badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          senderBadgeText: 'Hệ thống AP Sports',
          senderBadgeClass: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
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
          title = `Vận chuyển GHN: Đơn hàng #${payloadObj.orderCode || 'N/A'}`;
          break;
        case 'ORDER_PLACED_CUSTOMER':
          title = `Đặt hàng thành công #${payloadObj.orderCode || 'N/A'}`;
          break;
        case 'ORDER_STATUS_CHANGED':
          title = `Cập nhật trạng thái đơn hàng #${payloadObj.orderCode || 'N/A'}`;
          break;
        case 'ORDER_DELIVERED':
          title = `Đơn hàng #${payloadObj.orderCode || 'N/A'} đã giao thành công`;
          break;
        case 'ORDER_CANCELLED_BY_CUSTOMER':
        case 'ORDER_CANCELLED_BY_ADMIN':
          title = `Đơn hàng #${payloadObj.orderCode || 'N/A'} đã bị hủy`;
          break;
        case 'PAYMENT_SUCCESS':
          title = `Thanh toán thành công đơn hàng #${payloadObj.orderCode || 'N/A'}`;
          break;
        case 'REVIEW_REPLIED':
          title = `Phản hồi đánh giá: ${payloadObj.productName || 'Sản phẩm'}`;
          break;
        case 'WELCOME':
          title = payloadObj.title || 'Chào mừng bạn đến với AP Sports!';
          break;
        default:
          title = 'Thông báo từ hệ thống AP Sports';
      }
    }

    let message = notif.message;
    if (!message || message.startsWith('{')) {
      switch (notif.actionType) {
        case 'GHN_ORDER_UPDATE':
          if (payloadObj.newStatus === 'shipped') {
            message = `Bưu cục GHN đã tiếp nhận kiện hàng #${payloadObj.orderCode} từ kho AP Sports và đang phân loại trung chuyển.`;
          } else if (payloadObj.newStatus === 'shipping') {
            message = `Tài xế GHN đang trên đường giao đơn hàng #${payloadObj.orderCode} đến bạn. Quý khách vui lòng chú ý điện thoại nhận hàng nhé.`;
          } else if (payloadObj.newStatus === 'delivered') {
            message = `Đơn hàng #${payloadObj.orderCode} đã được giao thành công bởi GHN. Cảm ơn bạn đã tin tưởng mua sắm!`;
          } else {
            message = `Đơn vị vận chuyển GHN đã cập nhật trạng thái đơn hàng #${payloadObj.orderCode}.`;
          }
          break;
        case 'ORDER_PLACED_CUSTOMER':
          message = `Đơn hàng trị giá ${payloadObj.totalAmount ? Number(payloadObj.totalAmount).toLocaleString('vi-VN') : 0}đ đang được kho đóng gói chuẩn bị giao cho GHN.`;
          break;
        case 'ORDER_STATUS_CHANGED':
          message = `Đơn hàng #${payloadObj.orderCode} đã chuyển sang trạng thái mới. Vui lòng bấm để xem hành trình đơn.`;
          break;
        case 'ORDER_DELIVERED':
          message = `Đơn hàng đã được giao thành công! Bạn hãy dành ít phút đánh giá trải nghiệm sản phẩm nhé.`;
          break;
        case 'ORDER_CANCELLED_BY_CUSTOMER':
          message = `Đơn hàng đã được yêu cầu hủy thành công.`;
          break;
        case 'ORDER_CANCELLED_BY_ADMIN':
          message = `Đơn hàng đã bị hủy bởi cửa hàng. Vui lòng kiểm tra chi tiết hoặc liên hệ CSKH.`;
          break;
        case 'PAYMENT_SUCCESS':
          message = `Cổng thanh toán trực tuyến xác nhận đã thanh toán thành công cho đơn hàng #${payloadObj.orderCode}.`;
          break;
        case 'REVIEW_REPLIED':
          message = `Quản trị viên AP Sports đã gửi phản hồi cho đánh giá sản phẩm của bạn. Bấm để xem chi tiết.`;
          break;
        case 'WELCOME':
          message = payloadObj.content || 'Hệ thống thông báo thời gian thực đã sẵn sàng phục vụ bạn.';
          break;
        default:
          message = 'Nhấn vào thông báo để xem nội dung chi tiết.';
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
      title: title || 'Thông báo từ AP Sports',
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
