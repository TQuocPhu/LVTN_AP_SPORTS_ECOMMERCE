'use client';

import React from 'react';
import { Tag } from 'lucide-react';

interface ProductDescriptionTabProps {
  description?: string;
}

export function ProductDescriptionTab({ description }: ProductDescriptionTabProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <Tag className="w-5 h-5 text-orange-500" />
        <span>Chi Tiết Sản Phẩm & Mô Tả</span>
      </h3>

      {description ? (
        <div
          className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base leading-relaxed space-y-4 [&_*]:!text-slate-800 dark:[&_*]:!text-slate-100"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic">
          Chưa có thông tin mô tả chi tiết cho sản phẩm này.
        </p>
      )}
    </div>
  );
}
