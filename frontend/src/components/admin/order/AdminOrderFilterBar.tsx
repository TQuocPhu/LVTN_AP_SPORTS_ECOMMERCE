'use client';

import React from 'react';
import { Search, Filter, RotateCcw, Calendar, DollarSign, ArrowUpDown } from 'lucide-react';
import { AdminOrderFilterParams } from '@/types/admin-order';

interface AdminOrderFilterBarProps {
  filters: AdminOrderFilterParams;
  onFilterChange: (key: keyof AdminOrderFilterParams, value: any) => void;
  onResetFilters: () => void;
  onSearch: () => void;
}

export function AdminOrderFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onSearch,
}: AdminOrderFilterBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 transition-colors duration-200">
      {/* Hàng 1: Search Keyword & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm theo Mã đơn (VD: AP2026...), Tên KH, Email, SĐT, Mã vận đơn GHN..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-sm rounded-lg transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại</span>
          </button>

          <button
            type="button"
            onClick={onSearch}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>

      {/* Hàng 2: Bộ lọc Trạng thái, Phương thức, Ngày đặt & Giá */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Lọc:</span>
        </div>

        {/* Filter Trạng Thái */}
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm font-medium"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận (pending)</option>
          <option value="CONFIRMED">Đã xác nhận (confirmed)</option>
          <option value="PROCESSING">Đang đóng gói (processing)</option>
          <option value="SHIPPING">Đang vận chuyển (shipping)</option>
          <option value="DELIVERED">Đã hoàn thành (delivered)</option>
          <option value="CANCELLED">Đã hủy (cancelled)</option>
          <option value="PAYMENT_FAILED">Thanh toán thất bại</option>
        </select>

        {/* Filter Phương thức thanh toán */}
        <select
          value={filters.paymentMethod || 'ALL'}
          onChange={(e) => onFilterChange('paymentMethod', e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm font-medium"
        >
          <option value="ALL">Tất cả phương thức</option>
          <option value="COD">Thanh toán COD</option>
          <option value="VNPAY">Chuyển khoản VNPay</option>
        </select>

        {/* Start Date */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400">Từ:</span>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-medium text-slate-700"
          />
        </div>

        {/* End Date */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400">Đến:</span>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-medium text-slate-700"
          />
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={`${filters.sortBy || 'createdAt'}_${filters.sortDir || 'DESC'}`}
            onChange={(e) => {
              const [sortBy, sortDir] = e.target.value.split('_');
              onFilterChange('sortBy', sortBy);
              onFilterChange('sortDir', sortDir);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm font-medium"
          >
            <option value="createdAt_DESC">Mới nhất (Mặc định)</option>
            <option value="createdAt_ASC">Cũ nhất (Đặt sớm nhất)</option>
            <option value="finalAmount_DESC">Giá trị lớn nhất</option>
            <option value="finalAmount_ASC">Giá trị nhỏ nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
}
