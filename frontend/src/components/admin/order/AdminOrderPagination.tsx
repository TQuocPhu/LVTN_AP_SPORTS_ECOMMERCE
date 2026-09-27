'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminOrderPaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function AdminOrderPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: AdminOrderPaginationProps) {
  if (totalElements === 0) return null;

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
      <div className="text-slate-500 font-medium">
        Hiển thị <span className="font-extrabold text-slate-900">{startItem}</span> -{' '}
        <span className="font-extrabold text-slate-900">{endItem}</span> trên tổng số{' '}
        <span className="font-extrabold text-slate-900">{totalElements}</span> đơn hàng
      </div>

      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i).map((page) => {
          if (
            totalPages <= 7 ||
            page === 0 ||
            page === totalPages - 1 ||
            Math.abs(page - currentPage) <= 1
          ) {
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                  page === currentPage
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {page + 1}
              </button>
            );
          } else if (
            (page === 1 && currentPage > 3) ||
            (page === totalPages - 2 && currentPage < totalPages - 4)
          ) {
            return (
              <span key={page} className="px-1 text-slate-400 font-bold">
                ...
              </span>
            );
          }
          return null;
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
