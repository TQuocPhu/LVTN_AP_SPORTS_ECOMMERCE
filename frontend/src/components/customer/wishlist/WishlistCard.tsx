'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Trash2, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { WishlistResponse } from '@/types/wishlist';

interface WishlistCardProps {
  item: WishlistResponse;
  onRemove: (productId: number) => void;
}

export function WishlistCard({ item, onRemove }: WishlistCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(item.price);

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between">
      {/* 1. Image Header */}
      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
        <Link href={`/products/${item.slug || item.productId}`}>
          {item.mainImage ? (
            <Image
              src={item.mainImage}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
          )}
        </Link>

        {/* Tag Danh Mục */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-950/80 text-orange-400 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md border border-slate-800">
          {item.primaryCategoryName || 'AP Sports'}
        </span>

        {/* Nút Xóa Khỏi Yêu Thích */}
        <button
          onClick={() => onRemove(item.productId)}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 dark:bg-slate-900/90 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-md backdrop-blur-md hover:scale-110 active:scale-95 border border-slate-200 dark:border-slate-800"
          title="Xóa khỏi danh sách yêu thích"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Content Info & Actions */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <Link
            href={`/products/${item.slug || item.productId}`}
            className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 line-clamp-2 leading-snug transition-colors"
          >
            {item.name}
          </Link>

          <div className="flex items-center gap-1.5 text-[11px]">
            {item.inStock ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Còn hàng
              </span>
            ) : (
              <span className="text-rose-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Tạm hết hàng
              </span>
            )}
          </div>
        </div>

        {/* Price & View Product Link */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-orange-600 dark:text-orange-400">
              {formattedPrice}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              / {item.unit || 'sản phẩm'}
            </span>
          </div>

          <Link
            href={`/products/${item.slug || item.productId}`}
            className="w-full py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            <span>Xem Sản Phẩm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
