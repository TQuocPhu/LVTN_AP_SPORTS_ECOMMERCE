'use client';

import React from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';

interface AdminExportExcelButtonProps {
  onClick: () => void;
  isExporting?: boolean;
  disabled?: boolean;
  label?: string;
  title?: string;
  className?: string;
}

/**
 * Nút Xuất Excel (.xlsx) chuẩn giao diện Admin Light Mode (AP Sports).
 * Thuần UI: không chứa useState/useEffect, nhận toàn bộ trạng thái và callback từ Hook.
 */
export function AdminExportExcelButton({
  onClick,
  isExporting = false,
  disabled = false,
  label = 'Xuất Excel',
  title = 'Xuất toàn bộ dữ liệu theo bộ lọc hiện tại ra file Excel (.xlsx)',
  className = '',
}: AdminExportExcelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isExporting}
      title={title}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
      ) : (
        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
      )}
      <span>{isExporting ? 'Đang xuất...' : label}</span>
    </button>
  );
}
