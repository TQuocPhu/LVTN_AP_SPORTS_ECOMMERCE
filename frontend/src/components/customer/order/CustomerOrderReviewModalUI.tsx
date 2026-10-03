"use client";

import React from "react";
import {
  Star,
  Upload,
  X,
  Loader2,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { OrderItemToReview } from "@/hooks/useCustomerOrderReviewModal";

interface CustomerOrderReviewModalUIProps {
  isOpen: boolean;
  selectedOrderItem: OrderItemToReview | null;
  rating: number;
  setRating: (val: number) => void;
  comment: string;
  setComment: (val: string) => void;
  photoFiles: string[];
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (index: number) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const CustomerOrderReviewModalUI: React.FC<
  CustomerOrderReviewModalUIProps
> = ({
  isOpen,
  selectedOrderItem,
  rating,
  setRating,
  comment,
  setComment,
  photoFiles,
  onAddPhoto,
  onRemovePhoto,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !selectedOrderItem) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddPhoto(e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Đánh Giá Sản Phẩm
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Product info preview */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700/60">
            {selectedOrderItem.productImage ? (
              <img
                src={selectedOrderItem.productImage}
                alt={selectedOrderItem.productName}
                className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-600 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                AP
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {selectedOrderItem.productName}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedOrderItem.variantSize &&
                  `Size: ${selectedOrderItem.variantSize} | `}
                {selectedOrderItem.variantColor &&
                  `Màu: ${selectedOrderItem.variantColor} | `}
                Số lượng: {selectedOrderItem.quantity}
              </p>
            </div>
          </div>

          {/* Star Rating picker */}
          <div className="text-center py-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
              Chất lượng sản phẩm thế nào?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-115 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                        : "text-slate-300 dark:text-slate-600"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-2">
              {rating === 5 && "⭐⭐⭐⭐⭐ Tuyệt vời! Rất hài lòng"}
              {rating === 4 && "⭐⭐⭐⭐ Hài lòng"}
              {rating === 3 && "⭐⭐⭐ Bình thường"}
              {rating === 2 && "⭐⭐ Không hài lòng"}
              {rating === 1 && "⭐ Tệ"}
            </p>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Nhận xét thực tế của bạn <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Hãy chia sẻ cảm nhận về chất lượng sản phẩm, form dáng, đóng gói..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
            />
            <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              <span>Tối thiểu 5 ký tự</span>
              <span>{comment.length}/2000</span>
            </div>
          </div>

          {/* Photo attachment section */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Đính kèm ảnh chụp thực tế (Tối đa 5 ảnh)
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {photoFiles.map((photo, index) => (
                <div
                  key={index}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group"
                >
                  <img
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(index)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/70 text-white opacity-90 group-hover:opacity-100 hover:bg-red-600 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {photoFiles.length < 5 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-500 dark:hover:border-amber-400 bg-slate-50 dark:bg-slate-700/30 flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Hoàn Tất Đánh Giá</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
