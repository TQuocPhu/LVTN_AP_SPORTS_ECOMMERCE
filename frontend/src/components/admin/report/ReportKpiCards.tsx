'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CircleCheck,
  CreditCard,
  Percent,
} from 'lucide-react';
import { RevenueOverviewReportResponse } from '@/types/report';
import { formatCurrency } from '@/utils/formatters';

interface ReportKpiCardsProps {
  data: RevenueOverviewReportResponse | null;
  loading: boolean;
}

export function ReportKpiCards({ data, loading }: ReportKpiCardsProps) {
  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800"
          />
        ))}
      </div>
    );
  }

  const deliveredRevenue = data?.totalDeliveredRevenue ?? 0;
  const netRevenue = data?.totalNetRevenue ?? 0;
  const completedOrders = data?.completedOrders ?? 0;
  const totalOrders = data?.totalOrders ?? 0;
  const successRate = data?.successRate ?? 0;
  const cancellationRate = data?.cancellationRate ?? 0;
  const aov = data?.averageOrderValue ?? 0;
  const discountAmount = data?.totalDiscountAmount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Doanh Thu Thực Nhận */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Doanh Thu Hoàn Tất
          </span>
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCurrency(deliveredRevenue)}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
          <span>Doanh thu thuần hàng:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {formatCurrency(netRevenue)}
          </span>
        </div>
      </div>

      {/* 2. Đơn Hoàn Tất / Tổng Đơn */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Đơn Hàng Thành Công
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {completedOrders}{' '}
          <span className="text-sm font-semibold text-slate-400">
            / {totalOrders} đơn
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
          <span>Đang vận chuyển:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {data?.deliveringOrders ?? 0} đơn
          </span>
        </div>
      </div>

      {/* 3. Tỷ Lệ Giao Thành Công */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tỷ Lệ Giao Thành Công
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-baseline gap-2">
          <span>{successRate}%</span>
          {successRate >= 80 ? (
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CircleCheck className="w-3 h-3" /> Tốt
            </span>
          ) : (
            <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Cần tối ưu
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
          <span>Tỷ lệ hủy / hoàn:</span>
          <span className="font-bold text-rose-500">
            {cancellationRate}%
          </span>
        </div>
      </div>

      {/* 4. Giá Trị Đơn Trung Bình (AOV) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Giá Trị Đơn TB (AOV)
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {formatCurrency(aov)}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
          <span>Tổng giảm giá Voucher:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            -{formatCurrency(discountAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
