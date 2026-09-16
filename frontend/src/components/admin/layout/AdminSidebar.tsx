'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  BarChart3,
} from 'lucide-react';

interface MenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  allowedRoles?: string[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();

  const menuItems: MenuItem[] = [
    {
      title: 'Tổng Quan',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      // Dashboard visible to all management roles
    },
    {
      title: 'Quản Lý Sản Phẩm',
      href: '/admin/products',
      icon: Package,
      permission: 'MANAGE_PRODUCTS',
      allowedRoles: ['ADMIN', 'STAFF', 'WAREHOUSE_MANAGER'],
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

  // Kiểm tra quyền hiển thị menu item
  const hasAccessToMenuItem = (item: MenuItem): boolean => {
    if (!user) return false;
    // ADMIN có toàn quyền
    if (user.roleName === 'ADMIN') return true;
    // Không yêu cầu permission -> Cho phép
    if (!item.permission && !item.allowedRoles) return true;

    // Kiểm tra theo danh sách permissions từ backend
    if (item.permission && user.permissions && user.permissions.includes(item.permission)) {
      return true;
    }

    // Kiểm tra dự phòng theo allowedRoles
    if (item.allowedRoles && item.allowedRoles.includes(user.roleName)) {
      return true;
    }

    return false;
  };

  const visibleMenuItems = menuItems.filter(hasAccessToMenuItem);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-[calc(100vh-4rem)] border-r border-slate-200 dark:border-slate-800 select-none">
      <div className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
        Menu Đặt Lệnh Quản Trị
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        Role: <span className="font-semibold text-slate-300">{user?.roleName || 'N/A'}</span>
      </div>
    </aside>
  );
}
