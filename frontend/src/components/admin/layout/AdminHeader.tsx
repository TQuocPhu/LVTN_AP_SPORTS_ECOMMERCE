'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { LogOut, User, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const { user, logout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const getRoleBadgeColor = (roleName?: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'STAFF':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WAREHOUSE_MANAGER':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (roleName?: string) => {
    switch (roleName) {
      case 'ADMIN':
        return 'Quản Trị Viên';
      case 'STAFF':
        return 'Nhân Viên Bán Hàng';
      case 'WAREHOUSE_MANAGER':
        return 'Quản Lý Kho';
      default:
        return roleName || 'Quản Trị';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Brand & Title */}
      <Link href="/admin/dashboard" className="flex items-center space-x-3 group">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <Image
            src="/images/ap-sports_logo_no-back.png"
            alt="AP Sports Logo"
            width={64}
            height={64}
            className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-orange-500">
            AP SPORTS
          </span>
          <span className="text-[11px] font-bold text-orange-500 uppercase tracking-widest -mt-1">
            PORTAL QUẢN TRỊ
          </span>
        </div>
      </Link>

      {/* User info & Actions */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 leading-tight">
                {user.name}
              </span>
              <span
                className={`text-[11px] font-medium border px-1.5 py-0.5 rounded-full inline-flex items-center w-fit mt-0.5 ${getRoleBadgeColor(
                  user.roleName
                )}`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {getRoleDisplayName(user.roleName)}
              </span>
            </div>
          </div>
        )}

        <button
          id="admin-header-logout-btn"
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 text-sm font-medium transition"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
}
