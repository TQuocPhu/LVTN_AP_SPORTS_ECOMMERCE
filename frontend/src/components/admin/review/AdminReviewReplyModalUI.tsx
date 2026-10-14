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

const QUICK_REPLIES = [
  "Cảm ơn bạn đã tin tưởng và ủng hộ AP Sports! Chúc bạn có trải nghiệm tuyệt vời cùng sản phẩm.",
  "Dạ AP Sports rất tiếc về sự cố này ạ. Đội ngũ CSKH sẽ chủ động liên hệ để hỗ trợ bạn ngay.",
  "Cảm ơn bạn đã đánh giá 5 sao! Rất mong được tiếp tục đồng hành cùng bạn trong các đơn hàng tới.",
  "Dạ AP Sports ghi nhận phản hồi của bạn để ngày càng nâng cao chất lượng dịch vụ hơn ạ.",
];

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
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Phản Hồi Đánh Giá (1-1)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Review Details Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="text-sm font-bold text-slate-900">{review.userName}</span>
              <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                ⭐ {review.rating}/5
              </span>
            </div>

            <p className="text-xs font-medium text-slate-500">
              Sản phẩm: <span className="text-slate-800 font-semibold">{review.productName || `SP #${review.productId}`}</span>
            </p>

            <p className="text-slate-700 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
              "{review.comment}"
            </p>

            {/* Attached Images */}
            {review.imageUrls && review.imageUrls.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <span>Ảnh thực tế đính kèm từ khách ({review.imageUrls.length}):</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {review.imageUrls.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Bấm để mở ảnh lớn trong tab mới"
                      className="group relative w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all cursor-zoom-in"
                    >
                      <img
                        src={img}
                        alt={`Review attached img ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                        Xem to
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies - Vertical full-width list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Mẫu phản hồi nhanh có sẵn:</span>
              <span className="text-[11px] text-blue-600 font-medium">Bấm vào câu để chọn nhanh</span>
            </div>
            <div className="flex flex-col gap-2">
              {QUICK_REPLIES.map((template, idx) => {
                const isSelected = replyText === template;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(template)}
                    className={`w-full text-left p-3 rounded-xl text-xs leading-relaxed transition-all border cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? "bg-blue-100/90 border-blue-500 text-blue-950 font-semibold shadow-xs"
                        : "bg-blue-50/50 hover:bg-blue-100/60 border-blue-200 text-blue-900 hover:border-blue-300"
                    }`}
                  >
                    <span className="text-blue-600 flex-shrink-0 mt-0.5 font-bold">⚡</span>
                    <span className="flex-1 whitespace-normal break-words">{template}</span>
                  </button>
                );
              })}
            </div>
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
              Tối thiểu {MIN_ADMIN_REPLY_LENGTH} ký tự. Phản hồi này sẽ hiển thị công khai ngay bên dưới đánh giá của khách hàng.
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
