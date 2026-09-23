'use client';

import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { Package, ShoppingBag } from 'lucide-react';

interface CheckoutItemsSectionProps {
  items: CartItem[];
  loading: boolean;
}

export function CheckoutItemsSection({ items, loading }: CheckoutItemsSectionProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
        <div className="h-16 bg-slate-100 dark:bg-slate-950 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Mặt Hàng Đặt Mua</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {items.length} sản phẩm
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Danh sách sản phẩm được chọn từ giỏ hàng của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Chưa có sản phẩm nào trong giỏ hàng.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => {
            const price = item.price || 0;
            const lineTotal = item.subtotal || price * item.quantity;
            const imageSrc = item.mainImage || '/placeholder.png';

            return (
              <div key={item.id} className="py-4 first:pt-1 last:pb-1 flex items-center gap-3.5 sm:gap-4">
                {/* Image */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={item.productName || 'Sản phẩm'}
                      fill
                      sizes="72px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.productName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {item.size && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                        Size: {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                        Màu: {item.color}
                      </span>
                    )}
                    {item.sku && (
                      <span className="text-[10px] font-mono text-slate-400">
                        SKU: {item.sku}
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-0.5">
                    <span>{price.toLocaleString('vi-VN')} đ</span>
                    <span>x</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </span>
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-black text-orange-600 dark:text-orange-400 block">
                    {lineTotal.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
