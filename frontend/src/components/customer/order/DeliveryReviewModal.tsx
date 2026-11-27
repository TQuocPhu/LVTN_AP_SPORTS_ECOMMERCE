'use client';

import React from 'react';
import { Star, Truck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  DELIVERY_REVIEW_QUICK_TAGS,
  useDeliveryReviewModal,
} from '@/hooks/useDeliveryReviewModal';
import { DeliveryReview } from '@/types/delivery-review';

interface DeliveryReviewModalProps {
  isOpen: boolean;
  orderCode: string;
  shipperName?: string | null;
  shippingProvider?: string | null;
  onClose: () => void;
  onSuccess: (review: DeliveryReview) => void;
}

export function DeliveryReviewModal({
  isOpen,
  orderCode,
  shipperName,
  shippingProvider,
  onClose,
  onSuccess,
}: DeliveryReviewModalProps) {
  const {
    rating,
    setRating,
    selectedTags,
    toggleTag,
    comment,
    setComment,
    submitting,
    errorMsg,
    ratingLabel,
    handleSubmit,
    handleClose,
  } = useDeliveryReviewModal({ orderCode, onSuccess, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-orange-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Đánh Giá Dịch Vụ Giao Hàng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đơn #{orderCode} • {shipperName || `Shipper ${shippingProvider || 'GHN'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bạn hài lòng với quá trình giao hàng chứ?
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-9 h-9 ${
                        active
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-sm font-black text-orange-600 dark:text-orange-400">{ratingLabel}</p>
          </div>

          {/* Quick Tags */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Điểm bạn ấn tượng nhất:
            </p>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_REVIEW_QUICK_TAGS.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      selected
                        ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-500 text-orange-700 dark:text-orange-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Nhận xét thêm về shipper (không bắt buộc):
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ví dụ: Anh shipper gọi điện trước 15 phút, giao hàng nhanh và rất lịch sự..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Để Sau
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Đang Gửi...' : 'Gửi Đánh Giá'}
          </button>
        </div>
      </div>
    </div>
  );
}
