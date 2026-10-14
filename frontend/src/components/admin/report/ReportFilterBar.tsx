'use client';

import React from 'react';
import {
  Calendar,
  DollarSign,
  Package,
  Users,
  Warehouse,
  ChevronDown,
} from 'lucide-react';
import {
  REPORT_TABS,
  TIME_RANGE_OPTIONS,
} from '@/hooks/useAdminReports';
import { ReportTabType, TimeRangePreset } from '@/types/report';
import { UserResponse } from '@/types/auth';

interface ReportFilterBarProps {
  activeTab: ReportTabType;
  onTabChange: (tab: ReportTabType) => void;
  timeRange: TimeRangePreset;
  onPresetChange: (preset: TimeRangePreset) => void;
  startDate: string;
  endDate: string;
  onCustomDateChange: (start: string, end: string) => void;
  staffId: number | null;
  onStaffChange: (id: number | null) => void;
  staffList: UserResponse[];
  isAdmin: boolean;
}

export function ReportFilterBar({
  activeTab,
  onTabChange,
  timeRange,
  onPresetChange,
  startDate,
  endDate,
  onCustomDateChange,
  staffId,
  onStaffChange,
  staffList,
  isAdmin,
}: ReportFilterBarProps) {
  const getTabIcon = (key: ReportTabType) => {
    switch (key) {
      case 'overview':
        return <DollarSign className="w-4 h-4" />;
      case 'staff':
        return <Users className="w-4 h-4" />;
      case 'warehouse':
        return <Warehouse className="w-4 h-4" />;
      case 'merchandise':
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
      {/* 1. Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
        {REPORT_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {getTabIcon(tab.key)}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Controls: Presets + Date Range + Staff Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Preset Pills */}
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

        {/* Right side controls: Custom dates and Staff dropdown */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Custom Date Pickers */}
          {timeRange === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 font-medium">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onCustomDateChange(e.target.value, endDate)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-hidden"
              />
              <span className="text-slate-400 font-medium">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onCustomDateChange(startDate, e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-hidden"
              />
            </div>
          )}

          {/* Drill-down Staff Filter (Only shown for Admin and relevant tabs) */}
          {isAdmin && activeTab !== 'warehouse' && (
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                  Nhân viên:
                </span>
                <div className="relative">
                  <select
                    value={staffId === null ? '' : staffId}
                    onChange={(e) => {
                      const val = e.target.value;
                      onStaffChange(val === '' ? null : Number(val));
                    }}
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl pl-3 pr-8 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Toàn bộ nhân viên (Tất cả)</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.roleName || 'STAFF'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
