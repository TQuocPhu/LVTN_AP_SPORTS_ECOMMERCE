'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatters';

export default function CartSummaryBox() {
  const { selectedItemIds, selectedTotalPrice, selectedTotalItems } = useCart();

  const isCheckoutDisabled = selectedItemIds.size === 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 sticky top-24">
      <h3 className="text-lg font-black text-slate-100 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-4">
        <ShoppingBag className="w-5 h-5 text-orange-500" />
        <span>TỔNG KẾT ĐƠN HÀNG</span>
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-300">
          <span>Số sản phẩm đã chọn:</span>
          <span className="font-bold text-orange-400">{selectedTotalItems} món</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span>Tạm tính hàng:</span>
          <span className="font-bold text-slate-100">{formatCurrency(selectedTotalPrice)}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Phí vận chuyển dự kiến:</span>
          </span>
          <span className="font-bold text-emerald-400">Miễn phí</span>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base">
          <span className="font-bold text-slate-200">TỔNG TIỀN THANH TOÁN:</span>
          <span className="text-2xl font-black text-orange-400">
            {formatCurrency(selectedTotalPrice)}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Giá trên đã bao gồm VAT. Mã giảm giá (Voucher) và địa chỉ nhận hàng chi tiết sẽ được chọn ở trang Thanh toán.
      </p>

      {/* Checkout Button */}
      <Link
        href={isCheckoutDisabled ? '#' : '/checkout'}
        onClick={(e) => {
          if (isCheckoutDisabled) e.preventDefault();
        }}
        className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
          isCheckoutDisabled
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-xl shadow-orange-500/25 group cursor-pointer'
        }`}
      >
        <span>TIẾN HÀNH THANH TOÁN ({selectedItemIds.size})</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Cam kết 100% trang thiết bị thể thao nguyên bản chính hãng.</span>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Hỗ trợ đổi trả miễn phí trong vòng 7 ngày.</span>
        </div>
      </div>
    </div>
  );
}
