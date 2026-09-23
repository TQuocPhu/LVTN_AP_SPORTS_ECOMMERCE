'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminSidebar } from '@/hooks/useAdminSidebar';
import { UserCircle } from 'lucide-react';

export default function AdminSidebar() {
  const { pathname, user, visibleMenuItems, lowStockCount } = useAdminSidebar();

  const isProfileActive = pathname === '/admin/profile';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-800 flex-shrink-0 select-none">
      <div className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
        Menu Đặt Lệnh Quản Trị
      </div>

      {/* Scrollable Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.title}</span>
              </div>

              {item.href === '/admin/inventory' && lowStockCount > 0 && (
                <span
                  className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-black text-white bg-red-600 border border-red-400 rounded-full shadow-sm animate-pulse"
                  title={`Cảnh báo kho: Có ${lowStockCount} sản phẩm cần nhập hàng`}
                >
                  {lowStockCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Dedicated Bottom Profile Link (Separated by Border) */}
      <div className="px-3 py-2 border-t border-slate-800">
        <Link
          href="/admin/profile"
          id="admin-sidebar-profile-btn"
          className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            isProfileActive
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UserCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${isProfileActive ? 'text-white' : 'text-orange-400'}`} />
          <span>Hồ Sơ Cá Nhân</span>
        </Link>
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        Role: <span className="font-semibold text-slate-300">{user?.roleName || 'N/A'}</span>
      </div>
    </aside>
  );
}
