'use client';

import React from 'react';
import { RevenueOverviewReportResponse } from '@/types/report';
import { CheckCircle2, Truck, XCircle, RotateCcw, Activity } from 'lucide-react';

interface OrderStatusDistributionChartProps {
  data: RevenueOverviewReportResponse | null;
  loading?: boolean;
}

export function OrderStatusDistributionChart({
  data,
  loading,
}: OrderStatusDistributionChartProps) {
  const total = data?.totalOrders || 0;
  const completed = data?.completedOrders || 0;
  const delivering = data?.deliveringOrders || 0;
  const cancelled = data?.cancelledOrders || 0;
  const returned = data?.returnedOrders || 0;
  const successRate = data?.successRate || 0;

  // Donut geometry (radius = 60, circumference ~= 377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const compPct = total > 0 ? (completed / total) * 100 : 0;
  const deliPct = total > 0 ? (delivering / total) * 100 : 0;
  const cancPct = total > 0 ? (cancelled / total) * 100 : 0;
  const retuPct = total > 0 ? (returned / total) * 100 : 0;

  const compDash = (compPct / 100) * circumference;
  const deliDash = (deliPct / 100) * circumference;
  const cancDash = (cancPct / 100) * circumference;
  const retuDash = (retuPct / 100) * circumference;

  const deliOffset = -compDash;
  const cancOffset = -(compDash + deliDash);
  const retuOffset = -(compDash + deliDash + cancDash);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs h-[380px] flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[380px]">
      <div className="pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span className="font-black text-slate-900 text-sm md:text-base">
            Phân Bổ Trạng Thái Đơn Hàng
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Tỷ lệ đơn hàng theo trạng thái xử lý và tỷ lệ chuyển đổi thành công
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="20"
            />

            {/* Completed Segment (Emerald) */}
            {total > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth="20"
                strokeDasharray={`${compDash} ${circumference}`}
                strokeDashoffset="0"
                className="transition-all duration-700"
              />
            )}

            {/* Delivering Segment (Blue) */}
            {total > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${deliDash} ${circumference}`}
                strokeDashoffset={deliOffset}
                className="transition-all duration-700"
              />
            )}

            {/* Cancelled Segment (Rose) */}
            {total > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth="20"
                strokeDasharray={`${cancDash} ${circumference}`}
                strokeDashoffset={cancOffset}
                className="transition-all duration-700"
              />
            )}

            {/* Returned Segment (Amber) */}
            {total > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth="20"
                strokeDasharray={`${retuDash} ${circumference}`}
                strokeDashoffset={retuOffset}
                className="transition-all duration-700"
              />
            )}
          </svg>

          {/* Inner Text with Success Rate */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tỷ Lệ Đạt</span>
            <span className="text-base font-black text-emerald-600">
              {successRate}%
            </span>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
          {/* Completed */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Giao Xong</span>
            </div>
            <div className="text-sm font-black text-slate-800">
              {completed}{' '}
              <span className="text-[10px] font-normal text-slate-400">
                ({Math.round(compPct)}%)
              </span>
            </div>
          </div>

          {/* Delivering */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 mb-0.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Đang Giao</span>
            </div>
            <div className="text-sm font-black text-slate-800">
              {delivering}{' '}
              <span className="text-[10px] font-normal text-slate-400">
                ({Math.round(deliPct)}%)
              </span>
            </div>
          </div>

          {/* Cancelled */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mb-0.5">
              <XCircle className="w-3.5 h-3.5" />
              <span>Đã Hủy</span>
            </div>
            <div className="text-sm font-black text-slate-800">
              {cancelled}{' '}
              <span className="text-[10px] font-normal text-slate-400">
                ({Math.round(cancPct)}%)
              </span>
            </div>
          </div>

          {/* Returned */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 min-w-[120px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-0.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hoàn Trả</span>
            </div>
            <div className="text-sm font-black text-slate-800">
              {returned}{' '}
              <span className="text-[10px] font-normal text-slate-400">
                ({Math.round(retuPct)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
