'use client';

import React, { useEffect } from 'react';
import { X, ExternalLink, ZoomIn } from 'lucide-react';

interface AdminReviewImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const AdminReviewImageModal: React.FC<AdminReviewImageModalProps> = ({
  imageUrl,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (imageUrl) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top bar controls */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-800/90 border-b border-slate-700 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <ZoomIn className="w-4 h-4 text-orange-400" />
            <span>Xem chi tiết ảnh đánh giá</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở ảnh gốc</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
              title="Đóng (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image content */}
        <div className="p-4 flex items-center justify-center bg-black/40 overflow-auto max-h-[calc(90vh-60px)]">
          <img
            src={imageUrl}
            alt="Review attachment zoomed"
            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-lg transition-transform"
          />
        </div>
      </div>
    </div>
  );
};
