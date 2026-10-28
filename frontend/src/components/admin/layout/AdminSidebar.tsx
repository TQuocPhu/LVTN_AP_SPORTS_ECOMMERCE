'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminSidebar } from '@/hooks/useAdminSidebar';
import { UserCircle, ChevronDown } from 'lucide-react';

export default function AdminSidebar() {
  const {
    pathname,
    user,
    dashboardItem,
    visibleGroups,
    toggleGroup,
    isGroupOpen,
    isGroupActive,
    isItemActive,
    lowStockCount,
    waitingSupportCount,
    pendingImportCount,
  } = useAdminSidebar();

  const isProfileActive = pathname === '/admin/profile';
  const DashboardIcon = dashboardItem.icon;
  const isDashboardActive = isItemActive(dashboardItem.href);

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản Trị Viên';
      case 'STAFF':
        return 'Nhân Viên Bán Hàng';
      case 'WAREHOUSE_MANAGER':
        return 'Quản Lý Kho';
      default:
        return role || 'Chưa xác định';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-full border-r border-slate-800/90 flex-shrink-0 select-none overflow-hidden z-20">
      {/* Sidebar Header */}
      <div className="px-4 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
        <span>Menu Quản Trị</span>
        {/* <span className="text-[10px] font-semibold text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded-full border border-orange-500/30">
          Enterprise
        </span> */}
      </div>

      {/* Main Navigation - Hidden Scrollbar / Fixed Height */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Mục Tổng Quan (Standalone Dashboard) */}
        <div>
          <Link
            href={dashboardItem.href}
            className={`flex items-center px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
              isDashboardActive
                ? 'bg-orange-600 text-white font-semibold shadow-sm shadow-orange-900/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <DashboardIcon
              className={`w-[18px] h-[18px] mr-2.5 flex-shrink-0 ${
                isDashboardActive ? 'text-white' : 'text-slate-400'
              }`}
            />
            <span className="truncate">{dashboardItem.title}</span>
          </Link>
        </div>

        {/* Các cụm chức năng Dropdown chuẩn Enterprise */}
        {visibleGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = isGroupOpen(group.id);
          const groupActive = isGroupActive(group);
          const hasLowStockInGroup = group.items.some(
            (i) => i.badge === 'lowStock' && lowStockCount > 0
          );
          const hasWaitingSupportInGroup = group.items.some(
            (i) => i.badge === 'supportQueue' && waitingSupportCount > 0
          );
          const hasPendingImportInGroup = group.items.some(
            (i) => i.badge === 'importRequests' && pendingImportCount > 0
          );

          return (
            <div key={group.id} className="pt-1">
              {/* Dropdown Header Trigger */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 group cursor-pointer ${
                  groupActive
                    ? 'text-white bg-slate-800/70 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center min-w-0">
                  <GroupIcon
                    className={`w-[18px] h-[18px] mr-2.5 flex-shrink-0 transition-colors ${
                      groupActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{group.title}</span>
                </div>

                <div className="flex items-center ml-2 space-x-1.5 flex-shrink-0">
                  {hasLowStockInGroup && (
                    <span
                      className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-red-600 border border-red-400 rounded-full animate-pulse shadow-sm"
                      title={`Cảnh báo kho: Có ${lowStockCount} sản phẩm cần nhập hàng`}
                    >
                      {lowStockCount}
                    </span>
                  )}
                  {hasWaitingSupportInGroup && (
                    <span
                      className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-indigo-600 border border-indigo-400 rounded-full animate-pulse shadow-sm"
                      title={`Hàng đợi tư vấn: Có ${waitingSupportCount} khách hàng đang chờ`}
                    >
                      {waitingSupportCount}
                    </span>
                  )}
                  {hasPendingImportInGroup && (
                    <span
                      className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-500 border border-amber-300 rounded-full animate-pulse shadow-sm"
                      title={`Yêu cầu nhập kho: Có ${pendingImportCount} yêu cầu chờ duyệt`}
                    >
                      {pendingImportCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-orange-400' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown Sub-menu Items */}
              {isOpen && (
                <div className="ml-3 pl-2.5 my-1 space-y-1 border-l border-slate-800 transition-all duration-200">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = isItemActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                          isActive
                            ? 'bg-orange-600 text-white font-semibold shadow-sm shadow-orange-900/30'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center min-w-0">
                          <ItemIcon
                            className={`w-4 h-4 mr-2.5 flex-shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.title}</span>
                        </div>

                        {item.badge === 'lowStock' && lowStockCount > 0 && (
                          <span
                            className="ml-2 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-red-600 border border-red-400 rounded-full shadow-sm animate-pulse"
                            title={`Cảnh báo kho: Có ${lowStockCount} sản phẩm cần nhập hàng`}
                          >
                            {lowStockCount}
                          </span>
                        )}
                        {item.badge === 'supportQueue' && waitingSupportCount > 0 && (
                          <span
                            className="ml-2 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-indigo-600 border border-indigo-400 rounded-full shadow-sm animate-pulse"
                            title={`Hỗ trợ trực tuyến: Có ${waitingSupportCount} khách hàng đang chờ`}
                          >
                            {waitingSupportCount}
                          </span>
                        )}
                        {item.badge === 'importRequests' && pendingImportCount > 0 && (
                          <span
                            className="ml-2 inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-500 border border-amber-300 rounded-full shadow-sm animate-pulse"
                            title={`Yêu cầu nhập kho: Có ${pendingImportCount} yêu cầu chờ duyệt`}
                          >
                            {pendingImportCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Dedicated Bottom Profile Link */}
      <div className="px-3 py-2 border-t border-slate-800">
        <Link
          href="/admin/profile"
          id="admin-sidebar-profile-btn"
          className={`flex items-center px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
            isProfileActive
              ? 'bg-orange-600 text-white font-semibold shadow-sm shadow-orange-900/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <UserCircle
            className={`w-[18px] h-[18px] mr-2.5 flex-shrink-0 ${
              isProfileActive ? 'text-white' : 'text-orange-400'
            }`}
          />
          <span>Hồ Sơ Cá Nhân</span>
        </Link>
      </div>

      {/* Sidebar Footer Info */}
      <div className="px-4 py-2.5 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between bg-slate-950/40">
        <span>Vai trò:</span>
        <span className="font-semibold text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/20">
          {getRoleDisplayName(user?.roleName)}
        </span>
      </div>
    </aside>
  );
}
