'use client';

import React from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';
import { ProductVariant } from '@/types/product';

interface ProductFormReviewStepProps {
  isEdit?: boolean;
  name: string;
  slug: string;
  price: number | '';
  unit: string;
  mainImage: string;
  categoryIds: number[];
  variants: ProductVariant[];
}

export function ProductFormReviewStep({
  isEdit = false,
  name,
  slug,
  price,
  unit,
  mainImage,
  categoryIds,
  variants,
}: ProductFormReviewStepProps) {
  const totalCalculatedStock = variants.reduce(
    (sum, v) => sum + (Number(v.stockQuantity) || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
        <Check className="w-6 h-6 text-emerald-500" /> Bước 4:{' '}
        {isEdit ? 'Kiểm tra & Cập nhật sản phẩm' : 'Kiểm tra thông tin & Xác nhận lưu'}
      </h2>

      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
        <div className="flex items-center gap-4">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              className="w-24 h-24 object-cover rounded-xl border border-slate-200"
            />
          ) : (
            <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{name}</h3>
            <p className="text-sm text-slate-500 font-mono">/{slug}</p>
            <p className="text-base font-bold text-orange-600 mt-1.5">
              Giá niêm yết: {Number(price)?.toLocaleString('vi-VN')} đ / {unit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm pt-4 border-t border-slate-200">
          <div>
            <span className="text-slate-500">Danh mục đã chọn:</span>
            <p className="font-bold text-slate-900 text-base mt-0.5">
              {categoryIds.length} danh mục
            </p>
          </div>
          <div>
            <span className="text-slate-500">Tổng biến thể:</span>
            <p className="font-bold text-emerald-600 text-base mt-0.5">
              {variants.length} biến thể
            </p>
          </div>
          <div>
            <span className="text-slate-500">Tổng tồn kho sản phẩm:</span>
            <p className="font-bold text-emerald-600 text-base mt-0.5">
              {totalCalculatedStock} sản phẩm (Tự động cộng dồn từ các biến thể)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
