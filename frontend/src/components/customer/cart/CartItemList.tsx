'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, CheckSquare, Square, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatters';

export default function CartItemList() {
  const {
    items,
    selectedItemIds,
    isAllSelected,
    toggleSelectItem,
    toggleSelectAll,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
        <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-orange-500 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-100">Giỏ hàng của bạn đang trống</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md">
            Hãy khám phá thêm các thiết bị và dụng cụ thể thao cao cấp chính hãng từ AP Sports.
          </p>
        </div>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>TIẾP TỤC MUA SẮM</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar: Select All & Bulk Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
        <button
          onClick={toggleSelectAll}
          className="flex items-center space-x-3 text-sm font-bold text-slate-200 hover:text-orange-400 transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="w-5 h-5 text-orange-500" />
          ) : (
            <Square className="w-5 h-5 text-slate-500" />
          )}
          <span>Chọn tất cả ({items.length} sản phẩm)</span>
        </button>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-400 hover:text-red-400 flex items-center space-x-1.5 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      {/* Item List Cards */}
      <div className="space-y-3">
        {items.map((item) => {
          const isSelected = selectedItemIds.has(item.id);
          const isMaxStockReached = item.quantity >= item.stockQuantity;

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isSelected
                  ? 'border-orange-500/40 bg-slate-900/90 shadow-lg shadow-orange-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                {/* Item Checkbox */}
                <button
                  onClick={() => toggleSelectItem(item.id)}
                  className="text-slate-400 hover:text-orange-400 transition-colors shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                {/* Product Thumbnail */}
                <Link
                  href={`/products/${item.productSlug}`}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 group"
                >
                  <Image
                    src={item.mainImage || '/images/ap-sports_logo_no-back.png'}
                    alt={item.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Product Details & Variants */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="text-sm sm:text-base font-bold text-slate-100 hover:text-orange-400 transition-colors line-clamp-1"
                  >
                    {item.productName}
                  </Link>

                  {/* Variant Details Chips */}
                  {(item.variantName || item.size || item.color) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {item.variantName ? (
                        <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          {item.variantName}
                        </span>
                      ) : (
                        <>
                          {item.size && (
                            <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                              Màu: {item.color}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Stock Warning Badge */}
                  <div className="mt-2 flex items-center space-x-2">
                    {item.stockQuantity <= 0 ? (
                      <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
                        Tạm hết hàng
                      </span>
                    ) : item.stockQuantity <= 5 ? (
                      <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        Chỉ còn {item.stockQuantity} sản phẩm
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400">
                        Còn hàng
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side controls: Price, Stepper, Delete */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                {/* Unit Price */}
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block sm:hidden">Đơn giá:</span>
                  <span className="text-sm font-extrabold text-slate-200">
                    {formatCurrency(item.price)}
                  </span>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                    title="Giảm số lượng"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-8 text-center text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={isMaxStockReached}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={isMaxStockReached ? "Đã đạt số lượng tồn kho tối đa" : "Tăng số lượng"}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[100px]">
                  <span className="text-base font-black text-orange-400">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Xóa khỏi giỏ hàng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
