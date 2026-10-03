'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { ProductReviewSummary } from '@/types/review';

interface ProductReviewSummaryCardProps {
  summary: ProductReviewSummary | null;
}

export const ProductReviewSummaryCard: React.FC<ProductReviewSummaryCardProps> = ({ summary }) => {
  const avg = summary?.averageRating || 5.0;
  const total = summary?.totalReviews || 0;

  const getPercent = (count: number) => {
    if (!total || total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/60">
      {/* Left Rating score */}
      <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700/80 pb-6 md:pb-0 pr-0 md:pr-6">
        <div className="text-4xl sm:text-5xl font-extrabold text-amber-500 dark:text-amber-400 tracking-tight">
          {avg.toFixed(1)}
          <span className="text-xl sm:text-2xl text-slate-400 font-normal"> / 5.0</span>
        </div>
        <div className="flex items-center gap-1 my-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 ${
                s <= Math.round(avg)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Dựa trên {total} nhận xét
        </p>
      </div>

      {/* Right Star Breakdown Progress Bars */}
      <div className="md:col-span-8 space-y-2 flex flex-col justify-center">
        {[
          { star: 5, count: summary?.fiveStarCount || 0 },
          { star: 4, count: summary?.fourStarCount || 0 },
          { star: 3, count: summary?.threeStarCount || 0 },
          { star: 2, count: summary?.twoStarCount || 0 },
          { star: 1, count: summary?.oneStarCount || 0 },
        ].map((item) => {
          const pct = getPercent(item.count);
          return (
            <div key={item.star} className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 w-12 text-slate-600 dark:text-slate-300 font-medium">
                <span>{item.star}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-slate-400 dark:text-slate-500 font-mono">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
