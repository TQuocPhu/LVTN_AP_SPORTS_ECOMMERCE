'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { AdminReviewFilterRequest } from '@/types/review';

interface AdminReviewFilterToolbarProps {
  filter: AdminReviewFilterRequest;
  totalElements: number;
  currentCount: number;
  onStatusFilter: (status: string) => void;
  onRatingFilter: (rating?: number) => void;
  onKeywordFilter: (keyword: string) => void;
}

export const AdminReviewFilterToolbar: React.FC<AdminReviewFilterToolbarProps> = ({
  filter,
  totalElements,
  currentCount,
  onStatusFilter,
  onRatingFilter,
  onKeywordFilter,
}) => {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        {/* Keyword Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter.keyword || ''}
            onChange={(e) => onKeywordFilter(e.target.value)}
            placeholder="Tìm theo sản phẩm, tên khách hàng hoặc nội dung..."
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filter.status || 'ALL'}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="approved">Đã Phê Duyệt (Hiển thị)</option>
          <option value="hidden">Đã Ẩn (Vi phạm)</option>
        </select>

        {/* Rating Filter */}
        <select
          value={filter.rating || ''}
          onChange={(e) => onRatingFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">Tất cả số sao</option>
          <option value="5">5 Sao ⭐⭐⭐⭐⭐</option>
          <option value="4">4 Sao ⭐⭐⭐⭐</option>
          <option value="3">3 Sao ⭐⭐⭐</option>
          <option value="2">2 Sao ⭐⭐</option>
          <option value="1">1 Sao ⭐</option>
        </select>
      </div>

      <div className="text-xs text-slate-500 font-medium">
        Hiển thị <span className="font-bold text-slate-800">{currentCount}</span> / {totalElements} kết quả
      </div>
    </div>
  );
};
