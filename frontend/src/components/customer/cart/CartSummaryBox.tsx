"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  HelpCircle,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";

export default function CartSummaryBox() {
  const { selectedItemIds, selectedTotalPrice, selectedTotalItems } = useCart();

  const isCheckoutDisabled = selectedItemIds.size === 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-5 sticky top-24 transition-colors">
      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <ShoppingBag className="w-5 h-5 text-orange-500" />
        <span>TỔNG KẾT ĐƠN HÀNG</span>
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Số sản phẩm đã chọn:</span>
          <span className="font-bold text-orange-600 dark:text-orange-400">
            {selectedTotalItems} món
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Tạm tính hàng:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(selectedTotalPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span className="flex items-center space-x-1.5">
            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Phí vận chuyển dự kiến:</span>
          </span>

          {/* Khối hiển thị chữ ngắn gọn và Tooltip */}
          <span className="relative group flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400 cursor-help">
            <span>Tính khi thanh toán</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />

            {/* Hộp Tooltip ẩn, chỉ hiện lên khi hover vào phần tử cha (group-hover) */}
            <span className="absolute bottom-full right-0 mb-2 w-56 scale-0 group-hover:scale-100 transition-all duration-150 origin-bottom-right rounded-lg bg-slate-800 p-2 text-xs font-normal text-white shadow-lg dark:bg-slate-700 pointer-events-none z-50">
              Phí vận chuyển được tính chính xác dựa trên địa chỉ giao hàng và
              khối lượng thực tế của đơn hàng.
              {/* Mũi tên nhỏ chĩa xuống dưới */}
              <span className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></span>
            </span>
          </span>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-base">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            TỔNG TIỀN THANH TOÁN:
          </span>
          <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
            {formatCurrency(selectedTotalPrice)}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Giá trên đã bao gồm VAT. Mã giảm giá (Voucher) và địa chỉ nhận hàng chi
        tiết sẽ được chọn ở trang Thanh toán.
      </p>

      {/* Checkout Button */}
      <Link
        href={isCheckoutDisabled ? "#" : "/checkout"}
        onClick={(e) => {
          if (isCheckoutDisabled) e.preventDefault();
        }}
        className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
          isCheckoutDisabled
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-xl shadow-orange-500/25 group cursor-pointer"
        }`}
      >
        <span>TIẾN HÀNH THANH TOÁN ({selectedItemIds.size})</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
          <span>
            Cam kết 100% trang thiết bị thể thao nguyên bản chính hãng.
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="w-4 h-4 text-orange-500 shrink-0" />
          <span>Hỗ trợ đổi trả miễn phí trong vòng 7 ngày.</span>
        </div>
      </div>
    </div>
  );
}
