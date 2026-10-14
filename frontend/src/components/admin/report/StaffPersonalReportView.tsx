'use client';

import React from 'react';
import { STAFF_TIME_PRESETS } from '@/hooks/useStaffReports';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  Award,
  CircleCheck,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { StaffPerformanceReportResponse, RevenueOverviewReportResponse, TimeRangePreset } from '@/types/report';
import { AdminOrderDetail } from '@/types/admin-order';

interface StaffPersonalReportViewProps {
  timeRange: TimeRangePreset;
  loading: boolean;
  performance: StaffPerformanceReportResponse | null;
  revenue: RevenueOverviewReportResponse | null;
  myOrders: AdminOrderDetail[];
  onPresetChange: (preset: TimeRangePreset) => void;
  onRefresh: () => void;
}

export function StaffPersonalReportView({
  timeRange,
  loading,
  performance,
  revenue,
  myOrders,
  onPresetChange,
  onRefresh,
}: StaffPersonalReportViewProps) {
  const commission = performance?.estimatedCommission || 0;
  const kpiBonus = performance?.kpiBonus || 0;
  const totalEarnings = performance?.totalEstimatedEarnings || 0;
  const deliveredRevenue = performance?.deliveredRevenue || 0;
  const successRate = performance?.successRate || 0;
  const completedOrders = performance?.completedOrders || 0;
  const totalHandled = performance?.totalHandledOrders || 0;

  return (
    <div className="space-y-6">
      {/* 1. Header with Presets & Refresh */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-black uppercase text-slate-500">
            Kỳ Báo Cáo Cá Nhân:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STAFF_TIME_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPresetChange(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === p.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          <span>Cập nhật</span>
        </button>
      </div>

      {/* 2. Personal Performance & Earnings Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Thu Nhập Hoa Hồng Dự Kiến
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/30">
                2.0% Doanh Thu
              </span>
            </div>
            <div className="text-3xl font-black tracking-tight text-white mb-1">
              +{formatCurrency(totalEarnings)}
            </div>
            <p className="text-xs text-slate-400">
              Tính trên các đơn hàng bạn đã tiếp nhận và giao thành công
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-xs space-y-1.5 relative z-10">
            <div className="flex justify-between text-slate-300">
              <span>Hoa hồng bán hàng (2%):</span>
              <span className="font-bold text-white">
                {formatCurrency(commission)}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Thưởng vượt KPI (&ge; 90%):</span>
              <span className="font-bold text-amber-400">
                +{formatCurrency(kpiBonus)}
              </span>
            </div>
          </div>
        </div>

        {/* Sales KPI Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Doanh Số Đóng Góp
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(deliveredRevenue)}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Đơn hoàn tất: <strong className="text-slate-800">{completedOrders}</strong> / {totalHandled} đơn tiếp nhận
            </div>
          </div>

          {/* KPI Target Bar */}
          <div className="mt-6 space-y-1.5 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600">Tỷ lệ chốt thành công:</span>
              <span className="text-emerald-600">{successRate}% (Mục tiêu 85%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-700"
                style={{ width: `${Math.min(100, successRate)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Performance Badge Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Đánh Giá Hiệu Suất
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
              <CircleCheck className="w-3.5 h-3.5" />
              {performance?.performanceBadge || 'ĐẠT CHỈ TIÊU'}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Mã nhân viên: <strong className="text-slate-700">{performance?.employeeCode}</strong>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Giá trị đơn trung bình (AOV):</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(performance?.averageOrderValue || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tỷ lệ hủy / hoàn trả:</span>
              <span className="font-bold text-rose-500">
                {performance?.cancellationRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Handled Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              Các Đơn Hàng Bạn Đang Phụ Trách
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Danh sách đơn hàng do chính bạn xác nhận và theo dõi trong hệ thống
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
          >
            <span>Xem tất cả đơn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4 text-right">Tổng Tiền</th>
                <th className="py-3 px-4 text-center">Trạng Thái Đơn</th>
                <th className="py-3 px-4 text-center">Thanh Toán</th>
                <th className="py-3 px-4 text-right">Ngày Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>Bạn chưa tiếp nhận đơn hàng nào gần đây</span>
                  </td>
                </tr>
              ) : (
                myOrders.slice(0, 8).map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {order.orderCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {order.customerName || 'Khách hàng'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatCurrency(order.finalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
