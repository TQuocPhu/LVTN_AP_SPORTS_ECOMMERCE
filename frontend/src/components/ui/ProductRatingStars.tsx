'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useProductRatingStars, UseProductRatingStarsProps } from '@/hooks/useProductRatingStars';

export interface ProductRatingStarsProps extends UseProductRatingStarsProps {
  /** Có hiển thị giá trị số sao bằng text (ví dụ "4.8") hay không */
  showRatingValue?: boolean;
  /** Có hiển thị số lượt đánh giá (ví dụ "(12 đánh giá)") hay không */
  showCount?: boolean;
  /** Custom className */
  className?: string;
}

export function ProductRatingStars({
  rating = 5,
  totalReviews,
  size = 'sm',
  showRatingValue = true,
  showCount = true,
  interactive = false,
  className = '',
}: ProductRatingStarsProps) {
  const {
    safeRating,
    roundedRating,
    formattedRating,
    starSizeClass,
    textSizeClass,
    handleClick,
    isInteractive,
  } = useProductRatingStars({ rating, totalReviews, size, interactive });

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 select-none ${
        isInteractive ? 'cursor-pointer group hover:opacity-90 transition-opacity' : ''
      } ${className}`}
      title={`${roundedRating} trên 5 sao${totalReviews !== undefined ? ` (${totalReviews} đánh giá)` : ''}`}
    >
      {/* 5 Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= Math.round(safeRating);
          return (
            <Star
              key={starIndex}
              className={`${starSizeClass} transition-transform ${
                isInteractive ? 'group-hover:scale-110' : ''
              } ${
                filled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-200 dark:fill-slate-700 text-slate-200 dark:text-slate-700'
              }`}
            />
          );
        })}
      </div>

      {/* Numerical Rating (ví dụ: 4.8) */}
      {showRatingValue && (
        <span
          className={`font-black text-amber-600 dark:text-amber-400 ${textSizeClass}`}
        >
          {formattedRating}
        </span>
      )}

      {/* Review Count (ví dụ: (12 đánh giá)) */}
      {showCount && totalReviews !== undefined && (
        <span
          className={`text-slate-500 dark:text-slate-400 ${textSizeClass} ${
            isInteractive ? 'group-hover:underline text-orange-600 dark:text-orange-400 font-semibold' : ''
          }`}
        >
          ({totalReviews} đánh giá)
        </span>
      )}
    </div>
  );
}
