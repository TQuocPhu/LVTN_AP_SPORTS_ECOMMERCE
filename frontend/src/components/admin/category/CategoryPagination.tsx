'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryPaginationProps {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
  onSizeChange: (newSize: number) => void;
}

export function CategoryPagination({
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
}: CategoryPaginationProps) {
  if (totalElements === 0) return null;

  const startItem = page * size + 1;
  const endItem = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs text-slate-600">
      {/* Items count & size selector */}
      <div className="flex items-center gap-3">
        <span>
          Hiển thị <strong className="text-slate-900 font-bold">{startItem}</strong> -{' '}
          <strong className="text-slate-900 font-bold">{endItem}</strong> trên tổng số{' '}
          <strong className="text-orange-600 font-bold">{totalElements}</strong> danh mục
        </span>

        <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
          <span>Xem:</span>
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onPageChange(idx)}
            className={`w-8 h-8 rounded-xl font-bold transition-all ${
              idx === page
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
