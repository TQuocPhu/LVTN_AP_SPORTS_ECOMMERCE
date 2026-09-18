'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { WishlistResponse } from '@/types/wishlist';
import { WishlistCard } from './WishlistCard';

interface WishlistGridProps {
  items: WishlistResponse[];
  wishlistCount: number;
  onRemove: (productId: number) => void;
}

export function WishlistGrid({ items, wishlistCount, onRemove }: WishlistGridProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-current" />
          <span>Sản Phẩm Đã Lưu ({wishlistCount})</span>
        </h2>

        <Link
          href="/products"
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
        >
          + Tiếp tục chọn đồ thể thao
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <WishlistCard key={item.id || item.productId} item={item} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
