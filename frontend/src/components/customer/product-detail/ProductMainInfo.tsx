'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, Sparkles, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { ProductDetail, ProductVariant } from '@/types/product';

interface ProductMainInfoProps {
  product: ProductDetail;
  primaryCategory: string;
  selectedVariant: ProductVariant | null;
  effectivePrice: number;
  attributeGroups?: Record<string, string[]>;
  selectedAttributes?: Record<string, string>;
  availableColors: string[];
  colorImageMap: Record<string, string>;
  availableSizes: string[];
  selectedColor: string | null;
  selectedSize: string | null;
  onAttributeSelect?: (groupName: string, value: string) => void;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
}

export function ProductMainInfo({
  product,
  primaryCategory,
  selectedVariant,
  effectivePrice,
  attributeGroups,
  selectedAttributes = {},
  availableColors,
  colorImageMap,
  availableSizes,
  selectedColor,
  selectedSize,
  onAttributeSelect,
  onColorSelect,
  onSizeSelect,
}: ProductMainInfoProps) {
  const [isHighlightsOpen, setIsHighlightsOpen] = useState<boolean>(true);

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(effectivePrice);

  const productUnit = product.unit || 'sản phẩm';
  const hasDynamicGroups = attributeGroups && Object.keys(attributeGroups).length > 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Info & Title */}
      <div className="space-y-2">
        <Link
          href="/products"
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
        >
          <span>Chính hãng AP Sports</span>
        </Link>
        
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
          {product.name}
        </h1>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
          <span>Danh mục: <strong className="text-slate-700 dark:text-slate-300">{primaryCategory}</strong></span>
          <span>•</span>
          <span>Mã SKU: <strong className="text-slate-700 dark:text-slate-300">{selectedVariant?.sku || product.slug}</strong></span>
          {selectedVariant?.variantName && (
            <>
              <span>•</span>
              <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold px-2 py-0.5 rounded-md border border-orange-500/30">
                {selectedVariant.variantName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Giá Tiền & Đơn Vị Tính Ở Cột Giữa */}
      <div className="border-t border-b border-slate-200 dark:border-slate-800 py-3.5 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400">
            {formattedPrice}
          </span>
          <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            / {productUnit}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Miễn phí giao hàng tại Việt Nam & Đổi trả trong 7 ngày</span>
        </div>
      </div>

      {/* 3. Render Các Nhóm Thuộc Tính Động (Dynamic Attribute Groups) Separately */}
      {hasDynamicGroups ? (
        <div className="space-y-4">
          {Object.entries(attributeGroups!).map(([groupName, values]) => {
            const currentSelected = selectedAttributes[groupName] || values[0];
            const isColorGroup = groupName.toLowerCase().includes('màu');

            return (
              <div key={groupName} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {groupName}: <strong className="text-orange-600 dark:text-orange-400">{currentSelected}</strong>
                  </span>
                </div>

                {isColorGroup ? (
                  <div className="flex flex-wrap gap-2.5">
                    {values.map((val) => {
                      const isSelected = currentSelected === val;
                      const swatchImg = colorImageMap[val] || product.mainImage;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            onAttributeSelect
                              ? onAttributeSelect(groupName, val)
                              : onColorSelect(val)
                          }
                          className={`relative group p-1 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-4 ring-orange-500/20 shadow-md scale-105'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300'
                          }`}
                          title={`${groupName}: ${val}`}
                        >
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                            {swatchImg ? (
                              <Image src={swatchImg} alt={val} fill sizes="48px" className="object-contain p-0.5" />
                            ) : (
                              <span className="text-[10px] flex items-center justify-center h-full">{val}</span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-1">
                            {val}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected = currentSelected === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() =>
                            onAttributeSelect
                              ? onAttributeSelect(groupName, val)
                              : onSizeSelect(val)
                          }
                          className={`min-w-[2.75rem] h-9 px-3.5 rounded-xl font-black text-xs transition-all border flex items-center justify-center ${
                            isSelected
                              ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/25 scale-105'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-orange-400'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          {/* Legacy Swatch Màu Sắc */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Màu sắc: <strong className="text-orange-600 dark:text-orange-400">{selectedColor || 'Mặc định'}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((color) => {
                  const isSelected = selectedColor === color;
                  const swatchImg = colorImageMap[color] || product.mainImage;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onColorSelect(color)}
                      className={`relative group p-1 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-4 ring-orange-500/20 shadow-md scale-105'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-orange-300'
                      }`}
                      title={`Màu ${color}`}
                    >
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950">
                        {swatchImg ? (
                          <Image src={swatchImg} alt={color} fill sizes="48px" className="object-contain p-0.5" />
                        ) : (
                          <span className="text-[10px] flex items-center justify-center h-full">{color}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 px-1">
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legacy Bộ Chọn Kích Thước */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Kích thước: <strong className="text-orange-600 dark:text-orange-400">{selectedSize || 'Chọn size'}</strong>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onSizeSelect(size)}
                      className={`min-w-[2.75rem] h-9 px-2.5 rounded-xl font-black text-xs transition-all border flex items-center justify-center ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-orange-400'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. Accordion Thông Số Nổi Bật (Top Highlights) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        <button
          onClick={() => setIsHighlightsOpen(!isHighlightsOpen)}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Thông Số Nổi Bật (Top Highlights)</span>
          </span>
          {isHighlightsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isHighlightsOpen && (
          <div className="p-3.5 pt-0 text-xs border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="grid grid-cols-2 py-1">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Xuất xứ</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Chính hãng AP Sports</span>
            </div>
            <div className="grid grid-cols-2 py-1 border-t border-slate-100 dark:border-slate-800/60">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Chất liệu</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Cao cấp thoáng khí</span>
            </div>
            <div className="grid grid-cols-2 py-1 border-t border-slate-100 dark:border-slate-800/60">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Đơn vị</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{productUnit}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
