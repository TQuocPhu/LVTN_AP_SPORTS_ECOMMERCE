'use client';

import React from 'react';
import { StaffPerformanceReportResponse } from '@/types/report';
import { formatCurrency } from '@/utils/formatters';
import { Award, Search, Users, CircleCheck, AlertCircle, DollarSign, TrendingUp, Star } from 'lucide-react';
import Image from 'next/image';

interface StaffLeaderboardTableProps {
  data: StaffPerformanceReportResponse[];
  filteredData: StaffPerformanceReportResponse[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  summaryKpis: {
    totalStaff: number;
    topPerformer: StaffPerformanceReportResponse | null;
    totalCommissionPaid: number;
    avgSuccessRate: number;
  };
  loading?: boolean;
}

export function StaffLeaderboardTable({
  data,
  filteredData,
  searchTerm,
  onSearchChange,
  summaryKpis,
  loading,
}: StaffLeaderboardTableProps) {
  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
            🥇 Hạng 1
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
            🥈 Hạng 2
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-orange-50 text-orange-900 border border-orange-200">
            🥉 Hạng 3
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-slate-400 pl-2">
            #{idx + 1}
          </span>
        );
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'XUẤT SẮC':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ĐẠT CHỈ TIÊU':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CẦN CẢI THIỆN':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Staff KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Nhân Sự Bán Hàng
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {summaryKpis.totalStaff} <span className="text-sm font-semibold text-slate-400">nhân viên</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Có phát sinh đơn trong kỳ báo cáo
          </div>
        </div>

        {/* Top Performer */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Nhân Viên Xuất Sắc Nhất
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-black text-slate-900 tracking-tight truncate">
            {summaryKpis.topPerformer?.staffName || 'Chưa xác định'}
          </div>
          <div className="mt-2 text-xs text-slate-500 font-semibold">
            Doanh số: <span className="text-orange-600 font-bold">{formatCurrency(summaryKpis.topPerformer?.deliveredRevenue || 0)}</span>
          </div>
        </div>

        {/* Total Commission Paid */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tổng Hoa Hồng Trả Thưởng
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-600 tracking-tight">
            +{formatCurrency(summaryKpis.totalCommissionPaid)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Định mức hoa hồng 2.0% trên đơn thành công
          </div>
        </div>

        {/* Avg Success Rate */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tỷ Lệ Chốt Thành Công TB
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {summaryKpis.avgSuccessRate}%
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Mục tiêu tối thiểu toàn đội: 80%
          </div>
        </div>
      </div>

      {/* 2. Main Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Search */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Bảng Xếp Hạng Doanh Số & Hiệu Suất Bán Hàng Nhân Viên
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Đánh giá theo tổng doanh thu hoàn tất, tỷ lệ giao thành công và hoa hồng ước tính
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo tên, email, mã NV..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Thứ Hạng</th>
                <th className="py-3 px-4">Nhân Viên</th>
                <th className="py-3 px-4 text-center">Đơn Tiếp Nhận</th>
                <th className="py-3 px-4 text-center">Đơn Thành Công</th>
                <th className="py-3 px-4 text-center">Tỷ Lệ Đạt</th>
                <th className="py-3 px-4 text-right">Doanh Thu Mang Lại</th>
                <th className="py-3 px-4 text-right">Hoa Hồng (2%)</th>
                <th className="py-3 px-4 text-center">Đánh Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tổng hợp dữ liệu hiệu suất...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-8 h-8 text-slate-300 mb-2" />
                      <span>Không tìm thấy nhân viên nào phù hợp với bộ lọc</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((staff, idx) => (
                  <tr
                    key={staff.staffId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold whitespace-nowrap">
                      {getRankBadge(idx)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {staff.staffAvatar ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden relative shrink-0 border border-slate-200">
                            <Image
                              src={staff.staffAvatar}
                              alt={staff.staffName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {staff.staffName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{staff.staffName}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({staff.employeeCode})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">{staff.staffEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {staff.totalHandledOrders}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">
                      {staff.completedOrders}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-black text-slate-900">
                          {staff.successRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                      {formatCurrency(staff.deliveredRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-orange-600 whitespace-nowrap">
                      +{formatCurrency(staff.estimatedCommission)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(
                          staff.performanceBadge
                        )}`}
                      >
                        {staff.performanceBadge === 'XUẤT SẮC' ? (
                          <CircleCheck className="w-3 h-3" />
                        ) : staff.performanceBadge === 'CẦN CẢI THIỆN' ? (
                          <AlertCircle className="w-3 h-3" />
                        ) : null}
                        {staff.performanceBadge}
                      </span>
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
