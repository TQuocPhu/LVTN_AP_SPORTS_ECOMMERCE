'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ProductReviewZoomModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ProductReviewZoomModal: React.FC<ProductReviewZoomModalProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img src={imageUrl} alt="Zoom review photo" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
      </div>
    </div>
  );
};
