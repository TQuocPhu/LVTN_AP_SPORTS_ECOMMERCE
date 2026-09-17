'use client';

import React from 'react';
import { Search, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

interface ProductGridToolbarProps {
  totalElements: number;
  keyword: string;
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
  onKeywordChange: (val: string) => void;
  onSortChange: (field: string, dir: 'ASC' | 'DESC') => void;
  onToggleMobileFilter?: () => void;
}

const SORT_OPTIONS = [
  { label: 'Mới nhất xếp trước', field: 'createdAt', dir: 'DESC' },
  { label: 'Cũ nhất xếp trước', field: 'createdAt', dir: 'ASC' },
  { label: 'Giá: Thấp đến Cao', field: 'price', dir: 'ASC' },
  { label: 'Giá: Cao đến Thấp', field: 'price', dir: 'DESC' },
  { label: 'Tên: A đến Z', field: 'name', dir: 'ASC' },
  { label: 'Tên: Z đến A', field: 'name', dir: 'DESC' },
];

export function ProductGridToolbar({
  totalElements,
  keyword,
  sortBy,
  sortDir,
  onKeywordChange,
  onSortChange,
  onToggleMobileFilter,
}: ProductGridToolbarProps) {
  const currentSortKey = `${sortBy}_${sortDir}`;

  const handleSelectSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const option = SORT_OPTIONS.find((opt) => `${opt.field}_${opt.dir}` === val);
    if (option) {
      onSortChange(option.field, option.dir as 'ASC' | 'DESC');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Result Count & Mobile Filter Trigger */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Tất Cả Sản Phẩm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hiển thị <span className="font-extrabold text-orange-600 dark:text-orange-400">{totalElements}</span> sản phẩm phù hợp
          </p>
        </div>

        {/* Mobile Filter Button */}
        {onToggleMobileFilter && (
          <button
            onClick={onToggleMobileFilter}
            className="sm:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-xl text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ Lọc</span>
          </button>
        )}
      </div>

      {/* Search Input & Sort Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-colors"
          />
        </div>

        {/* Sort Select Dropdown */}
        <div className="relative w-full sm:w-auto flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline-block" />
          <select
            value={currentSortKey}
            onChange={handleSelectSort}
            className="w-full sm:w-48 px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-slate-100 cursor-pointer transition-colors"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={`${opt.field}_${opt.dir}`} value={`${opt.field}_${opt.dir}`}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
