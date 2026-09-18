'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft } from 'lucide-react';

export function WishlistEmptyState() {
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl my-6">
      <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto ring-8 ring-rose-500/5">
        <Heart className="w-10 h-10 fill-current" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          Danh Sách Yêu Thích Trống
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá các dụng cụ & trang phục thể thao chính hãng ngay!
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 text-xs uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Khám Phá Sản Phẩm Ngay</span>
        </Link>
      </div>
    </div>
  );
}
