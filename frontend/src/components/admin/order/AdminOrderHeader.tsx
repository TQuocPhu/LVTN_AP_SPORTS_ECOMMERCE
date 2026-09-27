'use client';

import React from 'react';
import { ShoppingBag, RefreshCw } from 'lucide-react';

interface AdminOrderHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function AdminOrderHeader({ loading, onRefresh }: AdminOrderHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            Quản Lý Đơn Hàng AP Sports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi, duyệt đơn hàng, xử lý vận chuyển GHN và quản lý trạng thái thanh toán
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span>Làm Mới Dữ Liệu</span>
      </button>
    </div>
  );
}
