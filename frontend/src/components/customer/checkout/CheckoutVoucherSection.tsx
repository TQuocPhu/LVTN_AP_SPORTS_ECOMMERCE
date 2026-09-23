'use client';

import React from 'react';
import { VoucherApplyResult } from '@/types/voucher';
import { Ticket, Check, X, AlertCircle, Loader2 } from 'lucide-react';

interface CheckoutVoucherSectionProps {
  voucherCode: string;
  setVoucherCode: (code: string) => void;
  appliedVoucher: VoucherApplyResult | null;
  applying: boolean;
  error: string | null;
  onApply: () => void;
  onRemove: () => void;
}

export function CheckoutVoucherSection({
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  applying,
  error,
  onApply,
  onRemove,
}: CheckoutVoucherSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Mã Khuyến Mãi / Voucher AP Sports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhập mã khuyến mãi để nhận ưu đãi giảm tiền hàng hoặc miễn phí vận chuyển.
          </p>
        </div>
      </div>

      {/* Applied Voucher Card OR Input Form */}
      {appliedVoucher ? (
        <div className="p-4 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 font-black text-xs">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">
                  {appliedVoucher.couponCode || appliedVoucher.voucher?.code || 'VOUCHER'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-700 dark:text-orange-300">
                  Giảm {appliedVoucher.discountAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate pt-0.5">
                {appliedVoucher.couponName || appliedVoucher.message || 'Đã áp dụng mã thành công.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-colors shrink-0"
            title="Hủy mã giảm giá"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onApply();
                }
              }}
              placeholder="Nhập mã voucher (VD: FREESHIP30K)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={onApply}
              disabled={applying || !voucherCode.trim()}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 shrink-0 inline-flex items-center gap-1.5"
            >
              {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp Dụng'}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1 font-medium pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
