'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  productName: string;
  primaryCategory: string;
  currentImage: string;
  allImages: string[];
  selectedColor: string | null;
  onImageSelect: (imgUrl: string) => void;
}

export function ProductImageGallery({
  productName,
  primaryCategory,
  currentImage,
  allImages,
  selectedColor,
  onImageSelect,
}: ProductImageGalleryProps) {
  // Tìm vị trí của ảnh hiện tại trong danh sách
  const currentIndex = allImages.length > 0 ? Math.max(0, allImages.indexOf(currentImage)) : 0;

  // Chuyển ảnh lùi (Prev)
  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + allImages.length) % allImages.length;
    onImageSelect(allImages[prevIdx]);
  };

  // Chuyển ảnh tới (Next)
  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (allImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % allImages.length;
    onImageSelect(allImages[nextIdx]);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
      {/* 1. Vertical Thumbnail Bar với overflow-y-auto và kích thước cố định shrink-0 */}
      {allImages.length > 1 && (
        <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-hidden sm:overflow-y-auto w-full sm:w-20 max-h-[560px] shrink-0 py-1 pr-1 [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {allImages.map((img, idx) => {
            const isActive = currentImage === img;
            return (
              <button
                key={idx}
                onClick={() => onImageSelect(img)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 dark:bg-slate-950 ${
                  isActive
                    ? 'border-orange-500 ring-4 ring-orange-500/20 scale-105 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-400'
                }`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-contain p-1 object-center" />
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Ảnh Preview Cỡ Lớn Kèm Nút Điều Hướng Prev/Next Thủ Công */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 order-1 sm:order-2 group flex-1 min-h-[380px] sm:min-h-[480px]">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-contain p-2 transition-all duration-300 drop-shadow-md"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
            <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs font-medium">Chưa có ảnh</span>
          </div>
        )}

        {/* Tag Danh mục & Màu đang chọn */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 text-orange-400 font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-md border border-slate-800 shadow-sm">
            {primaryCategory}
          </span>
          {selectedColor && (
            <span className="px-2.5 py-1 rounded-xl bg-orange-500/90 text-white font-bold text-[10px] shadow-sm backdrop-blur-md">
              Màu: {selectedColor}
            </span>
          )}
        </div>

        {/* Nút Điều Hướng Prev / Next Thủ Công Đặt Đè Lên Ảnh Lớn */}
        {allImages.length > 1 && (
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between z-20 pointer-events-none">
            <button
              onClick={handlePrevImage}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-all flex items-center justify-center backdrop-blur-md hover:scale-110 active:scale-95"
              title="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            <button
              onClick={handleNextImage}
              className="pointer-events-auto w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 transition-all flex items-center justify-center backdrop-blur-md hover:scale-110 active:scale-95"
              title="Ảnh kế tiếp"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Đếm Số Thứ Tự Ảnh (Ví dụ: 1/5) */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/70 text-white text-[10px] font-mono font-bold border border-slate-800 backdrop-blur-sm shadow-sm">
              {currentIndex + 1} / {allImages.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
