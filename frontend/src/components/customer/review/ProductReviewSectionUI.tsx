'use client';

import React, { useState } from 'react';
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Review, ProductReviewSummary } from '@/types/review';
import { ProductReviewSummaryCard } from './ProductReviewSummaryCard';
import { ProductReviewFilterBar } from './ProductReviewFilterBar';
import { ProductReviewCard } from './ProductReviewCard';
import { ProductReviewZoomModal } from './ProductReviewZoomModal';
import { ReviewAiSummaryCard } from './ReviewAiSummaryCard';

interface ProductReviewSectionUIProps {
  productId?: number;
  reviews: Review[];
  summary: ProductReviewSummary | null;
  selectedRating?: number;
  withImagesOnly: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  isLoading: boolean;
  onFilterRating: (rating?: number) => void;
  onToggleWithImages: () => void;
  onPageChange: (page: number) => void;
}

export const ProductReviewSectionUI: React.FC<ProductReviewSectionUIProps> = ({
  productId,
  reviews,
  summary,
  selectedRating,
  withImagesOnly,
  page,
  totalPages,
  totalElements,
  isLoading,
  onFilterRating,
  onToggleWithImages,
  onPageChange,
}) => {
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const total = summary?.totalReviews || 0;

  return (
    <div className="mt-12 bg-white dark:bg-slate-800/80 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700/80">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Đánh Giá Từ Khách Hàng</span>
            <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              {total} lượt đánh giá
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Đánh giá thực tế từ người mua hàng đã xác minh tại AP Sports
          </p>
        </div>
      </div>

      {/* 0. AI Review Summary Card (Agent 4) */}
      <div className="pt-6">
        <ReviewAiSummaryCard productId={productId} />
      </div>

      {/* 1. Summary Score Card */}
      <ProductReviewSummaryCard summary={summary} />

      {/* 2. Filter Bar */}
      <ProductReviewFilterBar
        total={total}
        selectedRating={selectedRating}
        withImagesOnly={withImagesOnly}
        onFilterRating={onFilterRating}
        onToggleWithImages={onToggleWithImages}
      />

      {/* 3. Review Cards List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 animate-pulse text-sm">
          Đang tải danh sách đánh giá...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Chưa có đánh giá nào phù hợp với bộ lọc.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((item) => (
            <ProductReviewCard key={item.id} item={item} onZoomImage={setZoomImage} />
          ))}
        </div>
      )}

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100 dark:border-slate-700/80">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Trang {page + 1} / {totalPages} (Tổng {totalElements} đánh giá)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Image Lightbox Zoom Modal */}
      <ProductReviewZoomModal imageUrl={zoomImage} onClose={() => setZoomImage(null)} />
    </div>
  );
};
