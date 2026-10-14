'use client';

import React, { useState } from 'react';
import { StaffPerformanceReportResponse } from '@/types/report';
import { formatCurrency } from '@/utils/formatters';
import { Award, Search, Users, CircleCheck, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface StaffLeaderboardTableProps {
  data: StaffPerformanceReportResponse[];
  loading?: boolean;
}

export function StaffLeaderboardTable({ data, loading }: StaffLeaderboardTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = data.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.staffName.toLowerCase().includes(q) ||
      s.staffEmail.toLowerCase().includes(q) ||
      (s.employeeCode && s.employeeCode.toLowerCase().includes(q))
    );
  });

  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300">
            🥇 Hạng 1
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-300">
            🥈 Hạng 2
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-700/10 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-600/30">
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
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300';
      case 'ĐẠT CHỈ TIÊU':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300';
      case 'CẦN CẢI THIỆN':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header & Search */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
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
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, mã NV..."
            className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <span>Đang tổng hợp dữ liệu hiệu suất...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-8 h-8 text-slate-300 mb-2" />
                    <span>Không tìm thấy nhân viên nào phù hợp với bộ lọc</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((staff, idx) => (
                <tr
                  key={staff.staffId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                          {staff.staffName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{staff.staffName}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({staff.employeeCode})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{staff.staffEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {staff.totalHandledOrders}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {staff.completedOrders}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <span className="font-black text-slate-900 dark:text-slate-100">
                        {staff.successRate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {formatCurrency(staff.deliveredRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-orange-600 dark:text-orange-400 whitespace-nowrap">
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
  );
}
