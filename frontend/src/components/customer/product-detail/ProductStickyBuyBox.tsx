'use client';

import React, { useState } from 'react';
import { ShoppingBag, Zap, Heart, Truck, AlertCircle, Check, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProductStickyBuyBoxProps {
  productName: string;
  totalPrice: number;
  effectiveStock: number;
  isOutOfStock: boolean;
  quantity: number;
  unit: string;
  onQuantityChange: (delta: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export function ProductStickyBuyBox({
  productName,
  totalPrice,
  effectiveStock,
  isOutOfStock,
  quantity,
  unit,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
}: ProductStickyBuyBoxProps) {
  const [isWishlist, setIsWishlist] = useState<boolean>(false);

  const formattedTotalPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(totalPrice);

  const handleToggleWishlist = () => {
    setIsWishlist(!isWishlist);
    if (!isWishlist) {
      toast.success(`Đã thêm "${productName}" vào danh sách yêu thích!`);
    } else {
      toast.info(`Đã xóa khỏi danh sách yêu thích.`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
      {/* 1. Header Giá Tiền Tổng (Thay đổi theo số lượng) */}
      <div className="space-y-1">
        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
          Tổng tiền ({quantity} {unit}):
        </span>
        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formattedTotalPrice}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Miễn phí giao hàng tại Việt Nam</span>
        </div>
      </div>

      {/* 2. Stock Status Badge */}
      <div>
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4" /> Tạm hết hàng
          </span>
        ) : effectiveStock <= 5 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 animate-pulse">
            <AlertCircle className="w-4 h-4" /> Chỉ còn {effectiveStock} sản phẩm - Đặt ngay!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Check className="w-4 h-4" /> Còn hàng ({effectiveStock} {unit})
          </span>
        )}
      </div>

      {/* 3. Bộ chọn Số lượng */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Số lượng mua:</span>
        <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-1">
          <button
            onClick={() => onQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="flex-1 text-center font-black text-sm text-slate-900 dark:text-white">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(1)}
            disabled={isOutOfStock || quantity >= effectiveStock}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Nút Thêm Vào Giỏ Hàng (Màu Vàng Amber) */}
      <button
        onClick={onAddToCart}
        disabled={isOutOfStock}
        className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-500 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 border border-amber-300"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Thêm Vào Giỏ Hàng</span>
      </button>

      {/* 5. Nút Mua Ngay (Màu Cam Vibrant) */}
      <button
        onClick={onBuyNow}
        disabled={isOutOfStock}
        className="w-full py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>Mua Ngay</span>
      </button>

      {/* 6. Thông tin Nhà Phân Phối */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
        <div className="flex justify-between">
          <span>Phân phối bởi:</span>
          <strong className="text-slate-800 dark:text-slate-200">AP Sports Store</strong>
        </div>
        <div className="flex justify-between">
          <span>Bảo hành:</span>
          <strong className="text-slate-800 dark:text-slate-200">12 tháng chính hãng</strong>
        </div>
      </div>

      {/* 7. Nút Thêm vào Danh Sách Yêu Thích - Đã Fix Triệt Để Lỗi Hover Nền Tối */}
      <button
        onClick={handleToggleWishlist}
        className={`w-full py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
          isWishlist
            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlist ? 'fill-current text-rose-500' : 'text-slate-600 dark:text-slate-300'}`} />
        <span>{isWishlist ? 'Đã Thêm Vào Yêu Thích' : 'Thêm Vào Danh Sách Yêu Thích'}</span>
      </button>
    </div>
  );
}
