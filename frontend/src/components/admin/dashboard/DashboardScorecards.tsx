'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  Award,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  PackageCheck,
  PackagePlus,
  PackageMinus,
  Ban,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { AdminScorecards, StaffScorecards, WarehouseScorecards } from '@/types/dashboard';

interface DashboardScorecardsProps {
  isAdmin: boolean;
  isStaff: boolean;
  isWarehouse: boolean;
  adminData?: AdminScorecards;
  staffData?: StaffScorecards;
  warehouseData?: WarehouseScorecards;
  loading: boolean;
}

export function DashboardScorecards({
  isAdmin,
  isStaff,
  isWarehouse,
  adminData,
  staffData,
  warehouseData,
  loading,
}: DashboardScorecardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  // Helper render badge tăng trưởng so với tháng trước (MoM)
  const renderGrowthBadge = (percent: number | null | undefined, fallbackText: string) => {
    if (percent === null || percent === undefined) {
      return <div className="mt-1 text-xs text-slate-700">{fallbackText}</div>;
    }
    const isPositive = percent >= 0;
    return (
      <div className="flex items-center gap-1.5 mt-1 text-xs font-bold">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
            isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
          ) : (
            <ArrowDownRight className="w-3 h-3 mr-0.5" />
          )}
          {isPositive ? `+${percent}%` : `${percent}%`}
        </span>
        <span className="text-slate-700 font-normal">so với tháng trước</span>
      </div>
    );
  };

  // 1. GIAO DIỆN SCORECARDS DÀNH CHO ADMIN
  if (isAdmin && adminData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng doanh thu hoàn thành */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Doanh Thu Hoàn Tất</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(adminData.grossRevenue)}
            </div>
            {renderGrowthBadge(adminData.revenueGrowthPercent, 'Toàn bộ doanh thu tích lũy hệ thống')}
          </div>
        </div>

        {/* Card 2: Tổng đơn hàng */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {adminData.totalOrders.toLocaleString('vi-VN')} <span className="text-xs font-medium text-slate-700">đơn</span>
            </div>
            {renderGrowthBadge(adminData.orderGrowthPercent, 'Toàn bộ đơn hàng đã ghi nhận')}
          </div>
        </div>

        {/* Card 3: Giá trị đơn trung bình AOV */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">AOV (Giá Trị Đơn TB)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(adminData.averageOrderValue)}
            </div>
            {renderGrowthBadge(adminData.aovGrowthPercent, 'Tính trên đơn hàng thực tế')}
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-700">
              <span>COD: <b className="text-slate-800">{formatCurrency(adminData.cashCodRevenue)}</b></span>
              <span>•</span>
              <span>VNPay: <b className="text-slate-800">{formatCurrency(adminData.vnpayRevenue)}</b></span>
            </div>
          </div>
        </div>

        {/* Card 4: Tỷ lệ hủy/hoàn đơn */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tỷ Lệ Hủy / Hoàn</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${adminData.cancellationRate > 15 ? 'bg-rose-50 border border-rose-200 text-rose-600' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-black tracking-tight ${adminData.cancellationRate > 15 ? 'text-rose-600' : 'text-slate-900'}`}>
              {adminData.cancellationRate}%
            </div>
            <div className="mt-1 text-xs text-slate-700">
              {adminData.cancellationRate <= 10 ? 'Mức độ an toàn rất tốt' : 'Cần kiểm tra lý do hủy đơn'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. GIAO DIỆN SCORECARDS DÀNH CHO NHÂN VIÊN (STAFF)
  if (isStaff && staffData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Doanh Số Phụ Trách</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{formatCurrency(staffData.handledRevenue)}</div>
            <div className="text-xs text-slate-700 mt-1">Đơn giao hoàn tất thành công</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Đơn Hàng Thành Công</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{staffData.completedOrders} <span className="text-xs font-medium text-slate-700">đơn</span></div>
            <div className="text-xs text-slate-700 mt-1">Đang giao: {staffData.deliveringOrders} đơn</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tỷ Lệ Chốt Thành Công</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{staffData.successRate}%</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">Hiệu suất vận hành đạt chuẩn</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Thu Nhập & Hoa Hồng</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700">{formatCurrency(staffData.estimatedEarnings)}</div>
            <div className="text-xs text-amber-900 mt-1 font-semibold">Hoa hồng 2% + Thưởng KPI</div>
          </div>
        </div>
      </div>
    );
  }

  // 3. GIAO DIỆN SCORECARDS DÀNH CHO QUẢN LÝ KHO (WAREHOUSE_MANAGER)
  if (isWarehouse && warehouseData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Xuất Kho Hôm Nay</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <PackageMinus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {warehouseData.todayOutboundQuantity.toLocaleString('vi-VN')} <span className="text-xs font-medium text-slate-700">SP</span>
            </div>
            <div className="text-xs text-slate-700 mt-1">Bao gồm xuất đơn GHN & nội bộ</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nhập Kho Hôm Nay</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PackagePlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">
              {warehouseData.todayInboundQuantity.toLocaleString('vi-VN')} <span className="text-xs font-medium text-slate-700">SP</span>
            </div>
            <div className="text-xs text-emerald-700 font-bold mt-1">Hàng đã kiểm đếm vào kệ</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Chờ Đóng Gói (GHN)</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-700">
              {warehouseData.pendingPackingOrders} <span className="text-xs font-medium text-slate-700">đơn</span>
            </div>
            <div className="text-xs text-slate-700 mt-1">Cần đóng gói bàn giao shipper</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cảnh Báo Hết Hàng</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">
              {warehouseData.outOfStockVariantCount} <span className="text-xs font-medium text-slate-700">SKU</span>
            </div>
            <div className="text-xs text-rose-600 font-bold mt-1">Cần lập phiếu nhập gấp</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
