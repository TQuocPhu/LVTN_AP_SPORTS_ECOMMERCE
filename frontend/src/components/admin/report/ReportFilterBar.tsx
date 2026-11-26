'use client';

import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { TIME_RANGE_OPTIONS } from '@/hooks/useAdminReports';
import { TimeRangePreset } from '@/types/report';
import { VietnameseDateInput } from '@/components/common/VietnameseDateInput';

interface ReportFilterBarProps {
  timeRange: TimeRangePreset;
  onPresetChange: (preset: TimeRangePreset) => void;
  startDate: string;
  endDate: string;
  onCustomDateChange: (start: string, end: string) => void;
}

/**
 * Thanh Bộ Lọc Kỳ Báo Cáo Doanh Thu & Đơn Hàng (/admin/reports).
 * Đã tinh gọn chỉ tập trung vào Doanh Thu & Đơn Hàng (bỏ tab Hiệu suất nhân viên và bỏ lọc nhân viên),
 * sử dụng chuẩn ngày Việt Nam dd/mm/yyyy và giao diện sáng cố định chuẩn Admin.
 */
export function ReportFilterBar({
  timeRange,
  onPresetChange,
  startDate,
  endDate,
  onCustomDateChange,
}: ReportFilterBarProps) {
  return (
    <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      {/* Tiêu đề phân hệ Báo cáo Doanh thu & Đơn hàng */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold shadow-2xs">
          <DollarSign className="w-4 h-4" />
          <span>Báo Cáo Doanh Thu & Đơn Hàng</span>
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Mẹo: Nhấp vào bất kỳ điểm nút, cột hoặc lát cắt trên biểu đồ để mở bảng đối soát chi tiết đơn hàng.
        </span>
      </div>

      {/* Các nút chọn nhanh Kỳ Báo Cáo & Tùy chọn ngày dd/mm/yyyy */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            Kỳ Báo Cáo:
          </span>
          {TIME_RANGE_OPTIONS.map((opt) => {
            const isSelected = timeRange === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onPresetChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Chọn khoảng ngày tùy chỉnh chuẩn Việt Nam (dd/mm/yyyy) */}
        {timeRange === 'CUSTOM' && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 font-medium">Từ:</span>
            <VietnameseDateInput
              value={startDate}
              onChange={(val) => onCustomDateChange(val, endDate)}
              themeVariant="admin"
              sizeVariant="bare"
            />
            <span className="text-slate-400 font-medium">Đến:</span>
            <VietnameseDateInput
              value={endDate}
              min={startDate || undefined}
              onChange={(val) => onCustomDateChange(startDate, val)}
              themeVariant="admin"
              sizeVariant="bare"
            />
          </div>
        )}
      </div>
    </div>
  );
}
