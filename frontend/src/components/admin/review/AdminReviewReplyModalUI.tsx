'use client';

import React from 'react';
import { X, MessageSquare, Loader2, Send } from 'lucide-react';
import { AdminReviewDetail } from '@/types/review';
import { MIN_ADMIN_REPLY_LENGTH } from '@/hooks/useAdminReviews';

interface AdminReviewReplyModalUIProps {
  isOpen: boolean;
  review: AdminReviewDetail | null;
  replyText: string;
  setReplyText: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const AdminReviewReplyModalUI: React.FC<AdminReviewReplyModalUIProps> = ({
  isOpen,
  review,
  replyText,
  setReplyText,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Phản Hồi Chính Thức (1-1)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Review Details Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>{review.userName}</span>
              <span className="text-amber-600">⭐ {review.rating}/5</span>
            </div>
            <p className="text-slate-600 italic">"{review.comment}"</p>
          </div>

          {/* Reply Input Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nội dung phản hồi từ AP Sports <span className="text-red-500">*</span>
            </label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Cảm ơn quý khách đã mua sắm tại AP Sports. Chúng tôi ghi nhận ý kiến của bạn..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tối thiểu {MIN_ADMIN_REPLY_LENGTH} ký tự. Câu trả lời này sẽ hiển thị trang trọng ngay bên dưới nhận xét của khách hàng trên trang chi tiết sản phẩm.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || replyText.trim().length < MIN_ADMIN_REPLY_LENGTH}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Phản Hồi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
