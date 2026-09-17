'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomerPaginationProps {
  page: number; // 0-indexed
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function CustomerPagination({
  page,
  totalPages,
  onPageChange,
}: CustomerPaginationProps) {
  if (totalPages <= 1) return null;

  const currentPageDisplay = page + 1;

  // Generate visible page numbers
  const pages: number[] = [];
  const startPage = Math.max(0, page - 2);
  const endPage = Math.min(totalPages - 1, page + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-6 pb-2">
      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Trang trước</span>
      </button>

      {/* First Page Link */}
      {startPage > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className="w-9 h-9 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            1
          </button>
          {startPage > 1 && <span className="text-slate-400 text-xs px-1">...</span>}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((p) => {
        const isActive = p === page;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
              isActive
                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {p + 1}
          </button>
        );
      })}

      {/* Last Page Link */}
      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && <span className="text-slate-400 text-xs px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className="w-9 h-9 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">Trang sau</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
