'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
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

  useEffect(() => {
    let isMounted = true;
    const loadLowStockAlerts = async () => {
      try {
        const res = await warehouseInventoryController.getLowStockVariants(5, 0, 50);
        if (isMounted && res.data) {
          setLowStockCount(res.data.totalElements || res.data.content?.length || 0);
        }
      } catch {
        // Silent catch
      }
    };

    loadLowStockAlerts();
    return () => {
      isMounted = false;
    };
  }, []);

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
      title: 'Quản Lý Đơn Hàng',
      href: '/admin/orders',
      icon: ShoppingCart,
      permission: 'MANAGE_ORDERS',
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
