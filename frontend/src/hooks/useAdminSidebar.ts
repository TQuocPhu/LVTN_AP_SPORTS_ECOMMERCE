'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNotificationContext } from '@/context/NotificationContext';
import { warehouseInventoryController } from '@/controllers/warehouse-inventory-controller';
import { supportChatController } from '@/controllers/support-chat-controller';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Warehouse,
  Users,
  BarChart3,
  Building2,
  Mail,
  Tag,
  MessageSquare,
  Headphones,
  ShoppingBag,
  Boxes,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  allowedRoles?: string[];
  badge?: 'lowStock' | 'supportQueue';
}

export interface MenuGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

export function useAdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [waitingSupportCount, setWaitingSupportCount] = useState<number>(0);
  const [openGroupIds, setOpenGroupIds] = useState<string[]>([]);

  const { notifications } = useNotificationContext();

  const canAccessSupport = Boolean(
    user?.roleName === 'ADMIN' ||
    user?.permissions?.includes('SUPPORT_LIVE_CHAT')
  );

  const loadLowStockAlerts = async (isMounted = true) => {
    try {
      const res = await warehouseInventoryController.getLowStockVariants(5, 0, 50);
      if (isMounted && res.data) {
        setLowStockCount(res.data.totalElements || res.data.content?.length || 0);
      }
    } catch {
      // Silent catch
    }
  };

  const loadWaitingSupportCount = useCallback(async (isMounted = true) => {
    if (!canAccessSupport) return;
    try {
      const res = await supportChatController.getWaitingQueue();
      if (isMounted && res.data) {
        setWaitingSupportCount(res.data.length);
      }
    } catch {
      // Silent catch
    }
  }, [canAccessSupport]);

  useEffect(() => {
    let isMounted = true;
    loadLowStockAlerts(isMounted);
    loadWaitingSupportCount(isMounted);

    // Lắng nghe các sự kiện cập nhật realtime từ WebSocket
    const handleSupportUpdated = () => {
      loadWaitingSupportCount(true);
    };

    const handleInventoryUpdated = () => {
      loadLowStockAlerts(true);
    };

    window.addEventListener('support_queue_updated', handleSupportUpdated);
    window.addEventListener('inventory_updated', handleInventoryUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('support_queue_updated', handleSupportUpdated);
      window.removeEventListener('inventory_updated', handleInventoryUpdated);
    };
  }, [loadWaitingSupportCount]);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latest = notifications[0];
      if (
        latest.actionType === 'LOW_INVENTORY' ||
        latest.actionType === 'OUT_OF_STOCK' ||
        latest.actionType === 'ORDER_PLACED' ||
        latest.actionType === 'ORDER_CANCELLED_BY_CUSTOMER' ||
        latest.actionType === 'ORDER_STATUS_CHANGED'
      ) {
        loadLowStockAlerts();
      }

      if (latest.actionType === 'NEW_SUPPORT_REQUEST') {
        loadWaitingSupportCount();
      }
    }
  }, [notifications, loadWaitingSupportCount]);

  // Mục đơn lập (Standalone)
  const dashboardItem: MenuItem = useMemo(
    () => ({
      title: 'Tổng Quan',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    }),
    []
  );

  // Định nghĩa các cụm chức năng (Groups) chuẩn Enterprise
  const rawGroups: MenuGroup[] = useMemo(
    () => [
      {
        id: 'commerce',
        title: 'Bán Hàng & Sản Phẩm',
        icon: ShoppingBag,
        items: [
          {
            title: 'Quản Lý Đơn Hàng',
            href: '/admin/orders',
            icon: ShoppingCart,
            permission: 'MANAGE_ORDERS',
            allowedRoles: ['ADMIN', 'STAFF'],
          },
          {
            title: 'Quản Lý Sản Phẩm',
            href: '/admin/products',
            icon: Package,
            permission: 'MANAGE_PRODUCTS',
            allowedRoles: ['ADMIN', 'STAFF', 'WAREHOUSE_MANAGER'],
          },
          {
            title: 'Quản Lý Danh Mục',
            href: '/admin/categories',
            icon: FolderTree,
            permission: 'MANAGE_CATEGORIES',
            allowedRoles: ['ADMIN'],
          },
          {
            title: 'Quản Lý Mã Giảm Giá',
            href: '/admin/vouchers',
            icon: Tag,
            permission: 'MANAGE_VOUCHERS',
            allowedRoles: ['ADMIN', 'STAFF'],
          },
        ],
      },
      {
        id: 'logistics',
        title: 'Kho Vận',
        icon: Boxes,
        items: [
          {
            title: 'Quản Lý Kho',
            href: '/admin/inventory',
            icon: Warehouse,
            permission: 'MANAGE_INVENTORY',
            allowedRoles: ['ADMIN', 'WAREHOUSE_MANAGER'],
            badge: 'lowStock',
          },
          {
            title: 'Nhà Cung Cấp',
            href: '/admin/suppliers',
            icon: Building2,
            permission: 'MANAGE_INVENTORY',
            allowedRoles: ['ADMIN', 'WAREHOUSE_MANAGER'],
          },
        ],
      },
      {
        id: 'support',
        title: 'Chăm Sóc Khách Hàng',
        icon: Headphones,
        items: [
          {
            title: 'Tư Vấn Trực Tiếp',
            href: '/admin/support-chat',
            icon: Headphones,
            permission: 'SUPPORT_LIVE_CHAT',
            allowedRoles: ['ADMIN', 'STAFF'],
            badge: 'supportQueue',
          },
          {
            title: 'Quản Lý Đánh Giá',
            href: '/admin/reviews',
            icon: MessageSquare,
            permission: 'MANAGE_PRODUCTS',
            allowedRoles: ['ADMIN', 'STAFF'],
          },
          {
            title: 'Quản Lý Liên Hệ',
            href: '/admin/contacts',
            icon: Mail,
            permission: 'MANAGE_CONTACTS',
            allowedRoles: ['ADMIN', 'STAFF'],
          },
        ],
      },
      {
        id: 'analytics',
        title: 'Hệ Thống & Báo Cáo',
        icon: BarChart3,
        items: [
          {
            title: 'Báo Cáo & Thống Kê',
            href: '/admin/reports',
            icon: BarChart3,
            permission: 'VIEW_REPORTS',
            allowedRoles: ['ADMIN', 'STAFF', 'WAREHOUSE_MANAGER'],
          },
          {
            title: 'Quản Lý Người Dùng',
            href: '/admin/users',
            icon: Users,
            permission: 'MANAGE_USERS',
            allowedRoles: ['ADMIN'],
          },
        ],
      },
    ],
    []
  );

  // Kiểm tra phân quyền truy cập menu
  const hasAccessToMenuItem = useCallback(
    (item: MenuItem): boolean => {
      if (!user) return false;
      if (user.roleName === 'ADMIN') return true;
      if (!item.permission && !item.allowedRoles) return true;

      if (item.permission && user.permissions && user.permissions.includes(item.permission)) {
        return true;
      }

      if (item.allowedRoles && item.allowedRoles.includes(user.roleName)) {
        return true;
      }

      return false;
    },
    [user]
  );

  // Lọc các cụm và các menu con theo quyền
  const visibleGroups = useMemo<MenuGroup[]>(() => {
    return rawGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(hasAccessToMenuItem),
      }))
      .filter((group) => group.items.length > 0);
  }, [rawGroups, hasAccessToMenuItem]);

  // Kiểm tra route active
  const isItemActive = useCallback(
    (href: string): boolean => {
      if (href === '/admin/dashboard') {
        return pathname === '/admin/dashboard';
      }
      return pathname === href || pathname.startsWith(href + '/');
    },
    [pathname]
  );

  const isGroupActive = useCallback(
    (group: MenuGroup): boolean => {
      return group.items.some((item) => isItemActive(item.href));
    },
    [isItemActive]
  );

  // Tự động mở cụm chứa menu active khi pathname thay đổi
  useEffect(() => {
    const activeGroup = visibleGroups.find((g) => isGroupActive(g));
    if (activeGroup) {
      setOpenGroupIds((prev) => (prev.includes(activeGroup.id) ? prev : [...prev, activeGroup.id]));
    }
  }, [pathname, visibleGroups, isGroupActive]);

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  }, []);

  const isGroupOpen = useCallback(
    (groupId: string): boolean => {
      return openGroupIds.includes(groupId);
    },
    [openGroupIds]
  );

  // Danh sách phẳng cho tính tương thích ngược
  const visibleMenuItems = useMemo<MenuItem[]>(() => {
    const flat: MenuItem[] = [dashboardItem];
    visibleGroups.forEach((g) => flat.push(...g.items));
    return flat;
  }, [dashboardItem, visibleGroups]);

  return {
    pathname,
    user,
    dashboardItem,
    visibleGroups,
    openGroupIds,
    toggleGroup,
    isGroupOpen,
    isGroupActive,
    isItemActive,
    visibleMenuItems,
    lowStockCount,
    waitingSupportCount,
  };
}
