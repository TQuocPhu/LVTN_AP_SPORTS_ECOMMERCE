'use client';

import React from 'react';
import { PaymentMethod } from '@/types/checkout';
import { CreditCard, Banknote, ShieldCheck, Check, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface CheckoutPaymentMethodSectionProps {
  paymentMethod: PaymentMethod;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
  isSubmitting: boolean;
  onPlaceOrder: () => void;
}

export function CheckoutPaymentMethodSection({
  paymentMethod,
  onSelectPaymentMethod,
  isSubmitting,
  onPlaceOrder,
}: CheckoutPaymentMethodSectionProps) {
  const isVnPay = paymentMethod === 'VNPAY';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Phương Thức Thanh Toán
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chọn hình thức thanh toán thuận tiện nhất cho bạn.
          </p>
        </div>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {/* Option 1: COD */}
        <div
          onClick={() => onSelectPaymentMethod('COD')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3.5 ${
            paymentMethod === 'COD'
              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-orange-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
          }`}
        >
          <div className="pt-0.5 shrink-0">
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                paymentMethod === 'COD'
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {paymentMethod === 'COD' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Thanh Toán Khi Nhận Hàng (COD)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Thanh toán trực tiếp bằng tiền mặt cho shipper GHN sau khi đã kiểm tra hàng.
            </p>
          </div>
        </div>

        {/* Option 2: VNPay */}
        <div
          onClick={() => onSelectPaymentMethod('VNPAY')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3.5 ${
            paymentMethod === 'VNPAY'
              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 ring-2 ring-orange-500/20 shadow-md'
              : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
          }`}
        >
          <div className="pt-0.5 shrink-0">
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                paymentMethod === 'VNPAY'
                  ? 'border-orange-500 bg-orange-500 text-white'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {paymentMethod === 'VNPAY' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Thanh Toán Qua Cổng VNPay
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Quét mã QR, thẻ ATM nội địa hoặc thẻ quốc tế (Visa/Mastercard) bảo mật 100%.
            </p>
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1 pb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Giao dịch của bạn được mã hóa và bảo mật theo tiêu chuẩn PCI-DSS Enterprise.</span>
      </div>

      {/* Distinct Action Buttons according to Payment Method */}
      {isVnPay ? (
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang Kết Nối Cổng VNPay...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Thanh Toán Bằng VNPay Sandbox</span>
              <ArrowRight className="w-5 h-5 ml-auto opacity-80" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Đang Xử Lý Đơn Hàng...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Xác Nhận Đặt Hàng (COD)</span>
              <ArrowRight className="w-5 h-5 ml-auto opacity-80" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
