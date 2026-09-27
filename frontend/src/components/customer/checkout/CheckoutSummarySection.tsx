import React from 'react';
import { CheckoutOrderSummary } from '@/types/checkout';
import { ShoppingBag, Loader2, MessageSquare } from 'lucide-react';

interface CheckoutSummarySectionProps {
  summary: CheckoutOrderSummary;
  note: string;
  setNote: (note: string) => void;
  loadingShippingFee?: boolean;
}

export function CheckoutSummarySection({
  summary,
  note,
  setNote,
  loadingShippingFee,
}: CheckoutSummarySectionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 transition-colors">
      {/* Title */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-500" />
          <span>Tổng Quan Đơn Hàng</span>
        </h2>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Tổng tiền hàng</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {summary.subtotal.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
            <span>Phí vận chuyển (GHN Express)</span>
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            {loadingShippingFee ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-orange-500 animate-pulse font-normal">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang tính...
              </span>
            ) : (
              `${summary.shippingFee.toLocaleString('vi-VN')} đ`
            )}
          </span>
        </div>

        {summary.discountAmount > 0 && (
          <div className="flex items-center justify-between text-orange-600 dark:text-orange-400">
            <span className="font-medium">Giảm giá mã voucher</span>
            <span className="font-extrabold">
              -{summary.discountAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>
        )}

        <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 flex items-baseline justify-between">
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
            Tổng thanh toán
          </span>
          <span className="text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400">
            {summary.finalAmount.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Ghi chú đơn hàng */}
      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
          <span>Ghi chú cho đơn hàng (không bắt buộc)</span>
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Lưu ý giao hàng, thời gian nhận hàng..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
    </div>
  );
}
