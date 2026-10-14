'use client';

import React from 'react';
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react';

interface ReportHeaderProps {
  onRefresh: () => void;
  onExportCSV: () => void;
  onPrint: () => void;
  loading: boolean;
}

export function ReportHeader({
  onRefresh,
  onExportCSV,
  onPrint,
  loading,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Báo Cáo & Thống Kê Enterprise
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              Phân tích đa chiều doanh thu, hiệu suất bán hàng nhân viên và tồn kho vận hành AP SPORTS
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          <span>Làm mới</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition-all cursor-pointer"
          title="In báo cáo (A4 Chuẩn)"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>In báo cáo</span>
        </button>

        <button
          type="button"
          onClick={onExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-xs transition-all cursor-pointer"
          title="Xuất bảng số liệu CSV / Excel"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Xuất Excel/CSV</span>
        </button>
      </div>
    </div>
  );
}
