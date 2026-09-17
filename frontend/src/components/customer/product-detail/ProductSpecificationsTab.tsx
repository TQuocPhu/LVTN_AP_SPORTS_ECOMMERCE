'use client';

import React from 'react';
import { Layers, ShieldCheck, Award, RefreshCw, Truck } from 'lucide-react';

interface ProductSpecificationsTabProps {
  specifications?: Record<string, string>;
  unit?: string;
  categoryName?: string;
}

export function ProductSpecificationsTab({
  specifications,
  unit,
  categoryName,
}: ProductSpecificationsTabProps) {
  // Merge dynamic specifications with standard fallback specifications
  const mergedSpecs: Record<string, string> = {
    ...(specifications || {}),
  };

  if (!mergedSpecs['Danh mục sản phẩm']) {
    mergedSpecs['Danh mục sản phẩm'] = categoryName || 'Trang thiết bị thể thao';
  }
  if (!mergedSpecs['Đơn vị đóng gói']) {
    mergedSpecs['Đơn vị đóng gói'] = unit || 'sản phẩm';
  }
  if (!mergedSpecs['Tiêu chuẩn kiểm định']) {
    mergedSpecs['Tiêu chuẩn kiểm định'] = 'CO/CQ Chính Hãng';
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <span>Thông Số Kỹ Thuật & Cam Kết Dịch Vụ</span>
        </h3>
      </div>

      {/* 1. BẢNG THÔNG SỐ KỸ THUẬT (DYNAMIC SPECIFICATIONS + GENERAL ATTR) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {Object.entries(mergedSpecs).map(([key, val], idx) => (
          <div
            key={key}
            className={`grid grid-cols-2 p-3.5 text-xs ${
              idx % 2 === 0 ? 'bg-slate-50/60 dark:bg-slate-950/60' : 'bg-white dark:bg-slate-900'
            }`}
          >
            <span className="font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{key}</span>
            <span className="font-semibold text-slate-900 dark:text-white text-right">{val}</span>
          </div>
        ))}
      </div>

      {/* 2. CÁC THẺ CAM KẾT DỊCH VỤ AP SPORTS (LUÔN HIỂN THỊ PHÍA DƯỚI THÔNG SỐ) */}
      <div className="pt-2 space-y-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block">
          Cam Kết Chất Lượng AP Sports:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-extrabold">Cam Kết 100% Chính Hãng</strong>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Đền tiền x2 nếu phát hiện hàng giả hàng nhái.</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-extrabold">Đổi Trả 7 Ngày Miễn Phí</strong>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Hỗ trợ đổi size & màu sắc nhanh chóng.</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <Truck className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-extrabold">Miễn Phí Vận Chuyển</strong>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Giao hàng hỏa tốc toàn quốc.</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-extrabold">Bảo Hành 12 Tháng</strong>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Bảo hành lỗi nhà sản xuất trọn đời sản phẩm.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
