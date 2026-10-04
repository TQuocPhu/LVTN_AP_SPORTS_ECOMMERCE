'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useNotificationContext } from '@/context/NotificationContext';
import { warehouseInventoryController } from '@/controllers/warehouse-inventory-controller';
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
} from 'lucide-react';

export interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  allowedRoles?: string[];
}

export function useAdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [lowStockCount, setLowStockCount] = useState<number>(0);

  const { notifications } = useNotificationContext();

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

  useEffect(() => {
    let isMounted = true;
    loadLowStockAlerts(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const latest = notifications[0];
      // Nếu có thông báo báo hiệu tồn kho thấp hoặc cập nhật kho -> Load lại
      if (latest.actionType === 'LOW_INVENTORY' || latest.actionType === 'ORDER_PLACED' || latest.actionType === 'ORDER_CANCELLED_BY_CUSTOMER' || latest.actionType === 'ORDER_STATUS_CHANGED') {
         loadLowStockAlerts();
      }
    }
  }, [notifications]);

  const menuItems: MenuItem[] = [
    {
      title: 'Tổng Quan',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
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
    {
      title: 'Quản Lý Đơn Hàng',
      href: '/admin/orders',
      icon: ShoppingCart,
      permission: 'MANAGE_ORDERS',
      allowedRoles: ['ADMIN', 'STAFF'],
    },
    {
      title: 'Quản Lý Liên Hệ',
      href: '/admin/contacts',
      icon: Mail,
      permission: 'MANAGE_CONTACTS',
      allowedRoles: ['ADMIN', 'STAFF'],
    },
    {
      title: 'Quản Lý Đánh Giá',
      href: '/admin/reviews',
      icon: MessageSquare,
      permission: 'MANAGE_PRODUCTS',
      allowedRoles: ['ADMIN', 'STAFF'],
    },
    {
      title: 'Quản Lý Kho',
      href: '/admin/inventory',
      icon: Warehouse,
      permission: 'MANAGE_INVENTORY',
      allowedRoles: ['ADMIN', 'WAREHOUSE_MANAGER'],
    },
    {
      title: 'Nhà Cung Cấp',
      href: '/admin/suppliers',
      icon: Building2,
      permission: 'MANAGE_INVENTORY',
      allowedRoles: ['ADMIN', 'WAREHOUSE_MANAGER'],
    },
    {
      title: 'Quản Lý Người Dùng',
      href: '/admin/users',
      icon: Users,
      permission: 'MANAGE_USERS',
      allowedRoles: ['ADMIN'],
    },
    {
      title: 'Báo Cáo & Thống Kê',
      href: '/admin/reports',
      icon: BarChart3,
      permission: 'VIEW_REPORTS',
      allowedRoles: ['ADMIN', 'STAFF'],
    },
  ];

  const hasAccessToMenuItem = (item: MenuItem): boolean => {
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
  };

  const visibleMenuItems = menuItems.filter(hasAccessToMenuItem);

  return {
    pathname,
    user,
    visibleMenuItems,
    lowStockCount,
  };
}
