import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImportRequestPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
}

/**
 * Component phân trang cho danh sách Yêu Cầu Nhập Kho
 */
export function ImportRequestPagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
}: ImportRequestPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 pt-2 text-xs font-medium text-slate-500">
      <div>
        Hiển thị trang <strong className="text-slate-800">{page + 1}</strong> /{' '}
        <strong className="text-slate-800">{totalPages}</strong> ({totalElements} bản ghi)
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Trước
        </button>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Sau <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

