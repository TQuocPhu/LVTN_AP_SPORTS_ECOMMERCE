'use client';

import React from 'react';
import { Package, DollarSign, ArrowDownLeft, AlertTriangle } from 'lucide-react';
import { InventoryOverviewStats } from '@/types/inventory';

interface InventoryOverviewCardsProps {
  stats: InventoryOverviewStats | null;
}

export function InventoryOverviewCards({ stats }: InventoryOverviewCardsProps) {
  const formattedInventoryValue = stats?.totalInventoryValue
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalInventoryValue)
    : '0 ₫';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Total Inventory Value */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-3.5 hover:border-orange-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wide">
            Giá Trị Tồn Kho
          </span>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {formattedInventoryValue}
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Tổng giá trị vốn đang lưu kho
        </div>
      </div>

      {/* 2. Total In-Stock Items */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-3.5 hover:border-orange-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wide">
            Tổng Tồn Thực Tế
          </span>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {stats?.totalInStockQuantity || 0} <span className="text-sm font-bold text-slate-400">SP</span>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Dựa trên {stats?.totalVariantsCount || 0} mẫu biến thể
        </div>
      </div>

      {/* 3. Total Import / Export In Month */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-3.5 hover:border-orange-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wide">
            Biến Động Tháng Này
          </span>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-xs font-extrabold text-emerald-600 uppercase block">Nhập Kho</span>
            <span className="text-2xl font-black text-slate-900">+{stats?.totalImportInPeriod || 0}</span>
          </div>
          <div className="h-9 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-xs font-extrabold text-rose-500 uppercase block">Xuất Kho</span>
            <span className="text-2xl font-black text-slate-900">-{stats?.totalExportInPeriod || 0}</span>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Số lượng nhập & xuất tháng hiện tại
        </div>
      </div>

      {/* 4. Low Stock Alerts Count */}
      <div className="border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-3.5 hover:border-orange-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-600 uppercase tracking-wide">
            Cảnh Báo Sắp Hết
          </span>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">
          {stats?.lowStockAlertCount || 0} <span className="text-sm font-bold text-slate-400">mẫu</span>
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Số lượng biến thể tồn kho &le; 5 SP
        </div>
      </div>
    </div>
  );
}
