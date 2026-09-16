'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductPaginationProps {
  pageInfo: {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
  onPageChange: (newPage: number) => void;
  onSizeChange?: (newSize: number) => void;
}

export function ProductPagination({
  pageInfo,
  onPageChange,
  onSizeChange,
}: ProductPaginationProps) {
  if (pageInfo.totalElements === 0) return null;

  const currentPage = pageInfo.number;
  const totalPages = pageInfo.totalPages;

  // Generate page numbers array (e.g. 1, 2, 3...)
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
            i === currentPage
              ? 'bg-orange-500 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-slate-200 bg-white rounded-2xl shadow-sm text-xs">
      <div className="flex items-center gap-4 text-slate-500">
        <span>
          Hiển thị <strong>{currentPage * pageInfo.size + 1}</strong> -{' '}
          <strong>{Math.min((currentPage + 1) * pageInfo.size, pageInfo.totalElements)}</strong> trên{' '}
          <strong>{pageInfo.totalElements}</strong> sản phẩm
        </span>

        {onSizeChange && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
            <span>Hiển thị:</span>
            <select
              value={pageInfo.size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
            >
              <option value={10}>10 dòng/trang</option>
              <option value={20}>20 dòng/trang</option>
              <option value={50}>50 dòng/trang</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 disabled:opacity-30 transition-colors"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage + 1 >= totalPages}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 disabled:opacity-30 transition-colors"
          title="Trang tiếp theo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
