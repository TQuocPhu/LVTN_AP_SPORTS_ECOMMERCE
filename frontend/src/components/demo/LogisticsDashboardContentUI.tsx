'use client';

import React from 'react';
import Link from 'next/link';
import { Building, Truck, CheckCircle2, LogOut } from 'lucide-react';
import { useDemoLogisticsAuth } from '@/hooks/useDemoLogisticsAuth';
import Image from 'next/image';

export function LogisticsDashboardContentUI() {
  const { user, logout } = useDemoLogisticsAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const role = user.roleName;
  const isStation = role === 'GHN_STATION';
  const isShipper = role === 'GHN_SHIPPER';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100">
              <Image
                src={user.avatar || '/images/default-avatar.png'}
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">{user.name}</h2>
              <p className="text-sm font-medium text-orange-600">{user.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-bold rounded">
                Vai trò: {role}
              </span>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>

        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-black text-gray-900">CỔNG LOGISTICS GHN</h1>
          <p className="text-gray-500 text-sm">Vui lòng chọn phân hệ ứng dụng phù hợp với quyền hạn của bạn</p>
        </div>

        {/* Portal Links - HIDING UNAUTHORIZED BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Portal 1: GHN Station */}
          {isStation && (
            <Link
              href="/demo/ghn-station"
              className="group flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-transparent hover:border-orange-500 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4"
            >
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all">
                <Building className="w-10 h-10" />
              </div>
              <div className="text-center">
                <h3 className="font-black text-lg text-gray-900">Bưu Cục Trạm</h3>
                <p className="text-xs text-gray-500 mt-1">Tiếp nhận đơn hàng từ kho AP Sports</p>
              </div>
            </Link>
          )}

          {/* Portal 2: Carrier Hub */}
          {isStation && (
            <Link
              href="/demo/carrier-logistics"
              className="group flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-transparent hover:border-amber-500 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4"
            >
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Truck className="w-10 h-10" />
              </div>
              <div className="text-center">
                <h3 className="font-black text-lg text-gray-900">Trung Tâm Điều Vận</h3>
                <p className="text-xs text-gray-500 mt-1">Điều phối và xuất kho giao hàng</p>
              </div>
            </Link>
          )}

          {/* Portal 3: Shipper App */}
          {isShipper && (
            <Link
              href="/demo/shipper-app"
              className="group flex flex-col items-center justify-center p-8 bg-white rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all cursor-pointer space-y-4"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-center">
                <h3 className="font-black text-lg text-gray-900">App Shipper</h3>
                <p className="text-xs text-gray-500 mt-1">Giao hàng chặng cuối cho khách</p>
              </div>
            </Link>
          )}

        </div>

      </div>
    </div>
  );
}
