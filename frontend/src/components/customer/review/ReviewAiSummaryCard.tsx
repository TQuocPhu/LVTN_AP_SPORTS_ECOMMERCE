'use client';

import React from 'react';
import { Sparkles, ThumbsUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useReviewAiSummary } from '@/hooks/useReviewAiSummary';

interface ReviewAiSummaryCardProps {
  productId?: number;
}

/**
 * UI Component: Thẻ Tóm tắt & Phân tích Cảm xúc Đánh giá Khách hàng bằng AI (Agent 4)
 * Tuân thủ nghiêm ngặt: Nhận dữ liệu từ hook useReviewAiSummary, không logic nội bộ.
 */
export const ReviewAiSummaryCard: React.FC<ReviewAiSummaryCardProps> = ({ productId }) => {
  const { summary, isLoading, error, refreshSummary } = useReviewAiSummary(productId);

  if (isLoading) {
    return (
      <div className="p-4 mb-6 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center gap-2.5 text-xs text-indigo-600 dark:text-indigo-400">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span>AI đang đọc và tổng hợp nhận xét từ khách hàng...</span>
      </div>
    );
  }

  if (!summary || summary.totalReviewsAnalyzed === 0 || error) {
    return null; // Không hiển thị nếu chưa có đủ đánh giá thực tế
  }

  return (
    <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900 border border-indigo-200/60 dark:border-indigo-900/40 shadow-sm space-y-4">
      {/* Header card */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Tóm Tắt Đánh Giá Bởi AI</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              Đúc kết từ {summary.totalReviewsAnalyzed} người mua
            </span>
          </h4>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{summary.satisfactionRate}% hài lòng</span>
        </div>
      </div>

      {/* Tóm tắt ngắn gọn */}
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white/70 dark:bg-slate-800/60 p-3 rounded-xl border border-indigo-100/50 dark:border-slate-700/60">
        "{summary.summaryText}"
      </p>

      {/* Lưới Điểm Khen & Điểm Lưu Ý */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Điểm cộng */}
        {summary.positiveHighlights && summary.positiveHighlights.length > 0 && (
          <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <ThumbsUp className="w-3 h-3" /> Điểm Cộng Nổi Bật
            </span>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {summary.positiveHighlights.map((pos, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="leading-tight">{pos}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Điểm lưu ý (ví dụ về size, form chân) */}
        {summary.negativeNotes && summary.negativeNotes.length > 0 && (
          <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3" /> Lưu Ý Khi Chọn Mua
            </span>
            <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              {summary.negativeNotes.map((neg, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">!</span>
                  <span className="leading-tight">{neg}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
