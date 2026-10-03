'use client';

import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { Review } from '@/types/review';

interface ProductReviewCardProps {
  item: Review;
  onZoomImage: (url: string) => void;
}

export const ProductReviewCard: React.FC<ProductReviewCardProps> = ({ item, onZoomImage }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 shadow-2xs transition-colors">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {item.userAvatar ? (
            <img
              src={item.userAvatar}
              alt={item.userName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {item.userName ? item.userName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {item.userName}
              </h4>
              {item.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đã mua hàng tại AP Sports
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= item.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                • {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment text */}
      <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed whitespace-pre-line">
        {item.comment}
      </p>

      {/* Photos Grid */}
      {item.imageUrls && item.imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {item.imageUrls.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => onZoomImage(imgUrl)}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-90 hover:scale-105 transition-all focus:outline-none"
            >
              <img src={imgUrl} alt={`Review ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Official Admin Response Box */}
      {item.adminReply && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
              Phản hồi từ AP Sports
            </span>
            {item.repliedByName && <span>• {item.repliedByName}</span>}
            {item.repliedAt && (
              <span className="text-amber-600/70 dark:text-amber-400/70 font-normal">
                ({new Date(item.repliedAt).toLocaleDateString('vi-VN')})
              </span>
            )}
          </div>
          <p className="text-slate-700 dark:text-amber-100/90 pl-1 leading-relaxed">
            {item.adminReply}
          </p>
        </div>
      )}
    </div>
  );
};
