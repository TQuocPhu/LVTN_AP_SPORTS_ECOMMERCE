'use client';

import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { ProductCategorySelect } from '@/components/admin/product/ProductCategorySelect';
import { ProductImageUpload } from '@/components/admin/product/ProductImageUpload';
import { CategoryResponse } from '@/types/category';

interface ProductFormBasicStepProps {
  name: string;
  slug: string;
  categoryIds: number[];
  categoryTree: CategoryResponse[];
  price: number | '';
  unit: string;
  mainImage: string;
  errors: Record<string, string>;
  onNameChange: (val: string) => void;
  onCategoryIdsChange: (ids: number[]) => void;
  onPriceChange: (val: number | '') => void;
  onUnitChange: (val: string) => void;
  onMainImageChange: (url: string) => void;
}

export function ProductFormBasicStep({
  name,
  slug,
  categoryIds,
  categoryTree,
  price,
  unit,
  mainImage,
  errors,
  onNameChange,
  onCategoryIdsChange,
  onPriceChange,
  onUnitChange,
  onMainImageChange,
}: ProductFormBasicStepProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
        <Package className="w-6 h-6 text-orange-500" /> Bước 1: Thông tin sản phẩm cơ bản
      </h2>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
          Tên sản phẩm <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ví dụ: Giày Bóng Đá Puma Future Ultimate FG/AG"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
        />
        {errors.name && (
          <p className="text-sm font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.name}
          </p>
        )}
      </div>

      {/* Slug (Read-only / Disabled) */}
      <div>
        <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
          Đường dẫn tĩnh (Slug - Tự động tạo chuẩn SEO)
        </label>
        <input
          type="text"
          disabled
          readOnly
          placeholder="Tự động tạo từ tên sản phẩm..."
          value={slug}
          className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-base font-mono text-slate-500 cursor-not-allowed select-none opacity-80"
        />
        <p className="text-xs text-slate-400 mt-1">
          * Đường dẫn slug được hệ thống tự động khởi tạo theo chuẩn SEO kèm mã định danh duy nhất.
        </p>
      </div>

      {/* Category Selector */}
      <div>
        <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
          Phân loại danh mục <span className="text-rose-500">*</span>
        </label>
        <ProductCategorySelect
          categoryTree={categoryTree}
          selectedCategoryIds={categoryIds}
          onChange={onCategoryIdsChange}
          error={errors.categoryIds}
        />
      </div>

      {/* Price & Unit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
            Giá gốc niêm yết (VNĐ) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            placeholder="Ví dụ: 1250000"
            value={price}
            onChange={(e) =>
              onPriceChange(e.target.value === '' ? '' : Number(e.target.value))
            }
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {errors.price && (
            <p className="text-sm font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.price}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
            Đơn vị tính <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Cái, Đôi, Bộ, Ống..."
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          {errors.unit && (
            <p className="text-sm font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.unit}
            </p>
          )}
        </div>
      </div>

      {/* Main Image File Upload */}
      <ProductImageUpload
        label="Hình ảnh chính đại diện sản phẩm (Tải Tệp Ảnh)"
        value={mainImage}
        onChange={onMainImageChange}
      />
    </div>
  );
}
