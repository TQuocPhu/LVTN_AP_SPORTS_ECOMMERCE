'use client';

import React from 'react';
import { LowStockItem } from '@/types/inventory';
import { AlertTriangle, ArrowDownLeft, PackageX, Zap } from 'lucide-react';

interface LowStockAlertsTableProps {
  items: LowStockItem[];
  onOpenImportModal: (initialItems?: LowStockItem[]) => void;
}

export function LowStockAlertsTable({ items, onOpenImportModal }: LowStockAlertsTableProps) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <span>Cảnh Báo Sản Phẩm Sắp Hết Tồn Kho (≤ 5 sản phẩm)</span>
              {items.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                  {items.length} mẫu mã
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Danh sách biến thể cần được ưu tiên lập phiếu nhập kho khẩn cấp
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => onOpenImportModal(items)}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
            title="Tự động gắn tất cả mẫu hàng bị cảnh báo vào 1 phiếu nhập duy nhất"
          >
            <Zap className="w-4 h-4 fill-current text-amber-300" />
            <span>Lập Phiếu Nhập Hàng Loạt Khẩn Cấp ({items.length} SP)</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Sản Phẩm</th>
              <th className="py-4 px-6">Biến Thể (SKU)</th>
              <th className="py-4 px-6 text-center">Tồn Hiện Tại</th>
              <th className="py-4 px-6">Trạng Thái Cảnh Báo</th>
              <th className="py-4 px-6 text-right">Nhập Lẻ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  <PackageX className="w-7 h-7 mx-auto mb-2 text-emerald-500 opacity-80" />
                  <span className="text-emerald-700 font-semibold text-xs">
                    Tuyệt vời! Tất cả sản phẩm biến thể đều đạt mức tồn kho an toàn.
                  </span>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.variantId} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6 font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {item.productName}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-orange-600 font-bold">{item.sku}</span>
                    <div className="text-xs text-slate-400">
                      {item.size ? `Size: ${item.size}` : ''} {item.color ? `| Màu: ${item.color}` : ''}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center font-extrabold text-rose-600 text-sm">
                    {item.stockQuantity}
                  </td>
                  <td className="py-4 px-6">
                    {item.stockQuantity === 0 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        HẾT HÀNG TẬN GỐC
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                        CẢNH BÁO SẮP HẾT
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onOpenImportModal([item])}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 hover:text-orange-600 hover:border-orange-500 font-bold text-xs transition-all flex items-center gap-1 ml-auto"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-orange-500" />
                      <span>Nhập mẫu này</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
