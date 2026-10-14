'use client';

import React from 'react';
import { Calendar, ArrowUpDown, RotateCcw } from 'lucide-react';

interface AdminNotificationDateFilterProps {
  startDate: string;
  endDate: string;
  sortOrder: 'DESC' | 'ASC';
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onSortOrderChange: (val: 'DESC' | 'ASC') => void;
  onReset: () => void;
  onQuickPreset: (preset: 'today' | '7days' | '30days') => void;
}

export const AdminNotificationDateFilter: React.FC<AdminNotificationDateFilterProps> = ({
  startDate,
  endDate,
  sortOrder,
  onStartDateChange,
  onEndDateChange,
  onSortOrderChange,
  onReset,
  onQuickPreset,
}) => {
  const isFiltered = Boolean(startDate || endDate || sortOrder !== 'DESC');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Left: Date Range & Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>Khoảng thời gian:</span>
        </span>

        {/* Start Date */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700">
          <span className="text-xs text-slate-400">Từ:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-medium text-slate-700 cursor-pointer"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700">
          <span className="text-xs text-slate-400">Đến:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-medium text-slate-700 cursor-pointer"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onQuickPreset('today')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-200 cursor-pointer"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset('7days')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-200 cursor-pointer"
          >
            7 ngày qua
          </button>
          <button
            type="button"
            onClick={() => onQuickPreset('30days')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-200 cursor-pointer"
          >
            30 ngày qua
          </button>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa lọc</span>
          </button>
        )}
      </div>

      {/* Right: Sort Order Selector */}
      <div className="flex items-center gap-2 shrink-0">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs text-slate-400 hidden sm:inline">Thứ tự:</span>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'DESC' | 'ASC')}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
        >
          <option value="DESC">Mới nhất trước (Mặc định)</option>
          <option value="ASC">Cũ nhất trước</option>
        </select>
      </div>
    </div>
  );
};
