'use client';

import React from 'react';
import { Star, Image as ImageIcon } from 'lucide-react';

interface ProductReviewFilterBarProps {
  total: number;
  selectedRating?: number;
  withImagesOnly: boolean;
  onFilterRating: (rating?: number) => void;
  onToggleWithImages: () => void;
}

export const ProductReviewFilterBar: React.FC<ProductReviewFilterBarProps> = ({
  total,
  selectedRating,
  withImagesOnly,
  onFilterRating,
  onToggleWithImages,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onFilterRating(undefined)}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
          selectedRating === undefined && !withImagesOnly
            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
        }`}
      >
        Tất cả ({total})
      </button>

      {[5, 4, 3, 2, 1].map((s) => (
        <button
          key={s}
          onClick={() => onFilterRating(s)}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1 ${
            selectedRating === s
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
          }`}
        >
          <span>{s} Sao</span>
          <Star className="w-3.5 h-3.5 fill-current" />
        </button>
      ))}

      <button
        onClick={onToggleWithImages}
        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
          withImagesOnly
            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
        }`}
      >
        <ImageIcon className="w-3.5 h-3.5" />
        <span>Có Hình Ảnh</span>
      </button>
    </div>
  );
};
