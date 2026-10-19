'use client';

import React from 'react';
import {
  X,
  Scan,
  PackageCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Sparkles,
  Loader2,
  Keyboard,
} from 'lucide-react';
import { AdminOrderDetail } from '@/types/admin-order';

interface OrderPackingScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: AdminOrderDetail | null;
  scannedMap: Record<number, number>;
  manualCode: string;
  onManualCodeChange: (val: string) => void;
  onScanCode: (code: string) => void;
  onReset: () => void;
  onSubmit: () => Promise<void>;
  note: string;
  onNoteChange: (val: string) => void;
  loading: boolean;
  totalRequired: number;
  totalScanned: number;
  isAllScanned: boolean;
  progressPercentage: number;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function OrderPackingScannerModal({
  isOpen,
  onClose,
  order,
  scannedMap,
  manualCode,
  onManualCodeChange,
  onScanCode,
  onReset,
  onSubmit,
  note,
  onNoteChange,
  loading,
  totalRequired,
  totalScanned,
  isAllScanned,
  progressPercentage,
  inputRef,
}: OrderPackingScannerModalProps) {
  if (!isOpen || !order) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onScanCode(manualCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl z-10 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shrink-0 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Scan className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-300 block">
                WMS Pick & Pack Verification System
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Kiểm Đếm Barcode & Đóng Gói Đơn Hàng #{order.orderCode}
              </h2>
            </div>
          </div>

          {/* Progress Bar Header */}
          <div className="mt-5 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-indigo-200">
                Tiến độ kiểm đếm: {totalScanned} / {totalRequired} sản phẩm ({progressPercentage}%)
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider ${
                  isAllScanned ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {isAllScanned ? '100% Đã Khớp Hoàn Hảo' : 'Đang Kiểm Đếm'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isAllScanned
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-indigo-500 to-amber-500'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Ô Quét Barcode & Nhập SKU mô phỏng */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 uppercase">
                <Keyboard className="w-4 h-4 text-indigo-600" />
                <span>Quét máy đọc mã vạch hoặc nhập Barcode / SKU + Nhấn Enter:</span>
              </label>
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Quét lại từ đầu</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={manualCode}
                  onChange={(e) => onManualCodeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Đặt con trỏ tại đây để quét mã vạch (hoặc gõ SKU)..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => onScanCode(manualCode)}
                disabled={!manualCode.trim()}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Quét Mã
              </button>
            </div>
          </div>

          {/* Bảng Mặt Hàng Cần Kiểm Đếm Trong Đơn */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Mặt Hàng</th>
                  <th className="p-3.5">Mã SKU / Barcode</th>
                  <th className="p-3.5 text-center">Yêu Cầu</th>
                  <th className="p-3.5 text-center">Đã Quét</th>
                  <th className="p-3.5 text-right">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {order.items.map((item, idx) => {
                  const vId = item.variantId || item.productId;
                  const scanned = scannedMap[vId] || 0;
                  const isDone = scanned >= item.quantity;
                  const effectiveBarcode = item.barcode || item.sku || 'N/A';

                  return (
                    <tr
                      key={item.id || idx}
                      className={`transition-colors ${
                        isDone ? 'bg-emerald-50/60 font-semibold' : 'bg-white'
                      }`}
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.variantSummary || [item.color, item.size].filter(Boolean).join(' - ') || 'Tiêu chuẩn'}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-800">{item.sku}</div>
                        <div className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                          <Barcode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{effectiveBarcode}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-center font-bold text-sm text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="p-3.5 text-center font-black text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-lg ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : scanned > 0
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {scanned} / {item.quantity}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Đã Đủ 100%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4" /> Còn Thiếu {item.quantity - scanned}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Ghi chú kiểm kho */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Ghi chú đóng gói niêm phong (tùy chọn):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Ví dụ: Đã niêm phong thùng carton bằng băng dính AP Sports..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {isAllScanned ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> Sẵn sàng hoàn tất kiểm đếm và niêm phong đơn hàng!
              </span>
            ) : (
              <span className="text-slate-500">
                Vui lòng quét đủ tất cả mã vạch trước khi xác nhận.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading || !isAllScanned}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PackageCheck className="w-4 h-4" />
              )}
              <span>Xác Nhận Đóng Gói Niêm Phong</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
