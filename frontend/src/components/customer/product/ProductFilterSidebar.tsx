"use client";

import React, { useState, useEffect } from "react";
import { CategoryResponse } from "@/types/category";
import { CategoryDirectoryTree } from "./CategoryDirectoryTree";
import {
  Filter,
  Star,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Sparkles,
  Trophy,
} from "lucide-react";

interface ProductFilterSidebarProps {
  categoryTree: CategoryResponse[];
  selectedCategoryId: number | null;
  selectedCategoryName: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  selectedSizes: string[];
  selectedRating: number | null;
  hasActiveFilters: boolean;
  onSelectCategory: (id: number | null, name: string | null) => void;
  onSetPriceRange: (min: number | null, max: number | null) => void;
  onToggleSize: (size: string) => void;
  onSetRating: (rating: number | null) => void;
  onResetFilters: () => void;
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const PRICE_PRESETS = [
  { label: "Dưới 500k", min: 0, max: 500000 },
  { label: "500k - 1 Triệu", min: 500000, max: 1000000 },
  { label: "1M - 3 Triệu", min: 1000000, max: 3000000 },
  { label: "Trên 3 Triệu", min: 3000000, max: 100000000 },
];

export function ProductFilterSidebar({
  categoryTree,
  selectedCategoryId,
  selectedCategoryName,
  minPrice,
  maxPrice,
  selectedSizes,
  selectedRating,
  hasActiveFilters,
  onSelectCategory,
  onSetPriceRange,
  onToggleSize,
  onSetRating,
  onResetFilters,
}: ProductFilterSidebarProps) {
  const [minInput, setMinInput] = useState<string>(
    minPrice !== null ? minPrice.toString() : "",
  );
  const [maxInput, setMaxInput] = useState<string>(
    maxPrice !== null ? maxPrice.toString() : "",
  );

  useEffect(() => {
    setMinInput(minPrice !== null ? minPrice.toString() : "");
    setMaxInput(maxPrice !== null ? maxPrice.toString() : "");
  }, [minPrice, maxPrice]);

  const handleApplyPriceInputs = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMin = minInput ? Number(minInput) : null;
    const parsedMax = maxInput ? Number(maxInput) : null;
    onSetPriceRange(parsedMin, parsedMax);
  };

  return (
    <aside className="w-full space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Bộ Lọc Tìm Kiếm
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors"
            title="Xóa tất cả các bộ lọc đang chọn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {selectedCategoryName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
              {selectedCategoryName}
            </span>
          )}
          {(minPrice !== null || maxPrice !== null) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {minPrice
                ? `${(minPrice / 1000).toLocaleString("vi-VN")}k`
                : "0k"}{" "}
              -{" "}
              {maxPrice && maxPrice < 10000000
                ? `${(maxPrice / 1000).toLocaleString("vi-VN")}k`
                : "Tối đa"}
            </span>
          )}
          {selectedSizes.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Size: {selectedSizes.join(", ")}
            </span>
          )}
          {selectedRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ★ {selectedRating}+ Sao
            </span>
          )}
        </div>
      )}

      {/* Section 1: Cây danh mục (Directory Tree) */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Danh Mục Sản Phẩm
        </h4>
        <CategoryDirectoryTree
          categoryTree={categoryTree}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
        />
      </div>

      {/* Section 2: Lọc theo Khoảng Giá (Price Range Slider & Presets) */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Khoảng Giá (VND)
        </h4>

        {/* Quick Presets */}
        <div className="grid grid-cols-2 gap-2">
          {PRICE_PRESETS.map((preset, idx) => {
            const isActive = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSetPriceRange(preset.min, preset.max)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-500/50"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Manual Price Range Form */}
        <form
          onSubmit={handleApplyPriceInputs}
          className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800"
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Từ (VNĐ)"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-slate-100"
            />
            <span className="text-slate-400 text-xs font-bold">-</span>
            <input
              type="number"
              placeholder="Đến (VNĐ)"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-orange-600 dark:hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Áp dụng khoảng giá
          </button>
        </form>
      </div>

      {/* Section 3: Lọc theo Đánh giá (Rating Filter 4★+) */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Đánh Giá Sản Phẩm
        </h4>
        <div className="space-y-1.5">
          {[5, 4].map((starCount) => {
            const isSelected = selectedRating === starCount;
            return (
              <div
                key={starCount}
                onClick={() => onSetRating(starCount)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  isSelected
                    ? "bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < starCount
                          ? isSelected
                            ? "fill-white text-white"
                            : "fill-amber-400 text-amber-400"
                          : isSelected
                            ? "text-white/40"
                            : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-semibold">
                    {starCount === 5 ? "5.0 tuyệt đối" : "Từ 4.0 trở lên"}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Lọc theo Size Đồ (Size Chips - Multi-select) */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Kích Thước (Size)
          </h4>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            (Chọn nhiều size)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_SIZES.map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => onToggleSize(size)}
                className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                  isSelected
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-105"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-500/60 hover:text-orange-600"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 5: Top 2 Sản Phẩm Đánh Giá Cao (Featured Widget) */}
      <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/40 dark:via-amber-950/20 dark:to-transparent p-4 rounded-2xl border border-orange-200/60 dark:border-orange-900/40 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Sản Phẩm Đánh Giá Cao
          </h4>
        </div>

        <div className="space-y-3">
          {/* Top 1 item preview */}
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-slate-800 shrink-0 overflow-hidden relative flex items-center justify-center font-bold text-xs text-orange-600">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                Vợt Cầu Lông AP Pro Power
              </h5>
              <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-bold">5.0</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                  (128 đánh giá)
                </span>
              </div>
              <span className="font-extrabold text-xs text-orange-600 dark:text-orange-400 block mt-0.5">
                1.450.000₫
              </span>
            </div>
          </div>

          {/* Top 2 item preview */}
          <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-slate-800 shrink-0 overflow-hidden relative flex items-center justify-center font-bold text-xs text-amber-600">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                Giày Đá Bóng AP Speed X
              </h5>
              <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                <Star className="w-3 h-3 fill-current" />
                <span className="font-bold">4.9</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                  (96 đánh giá)
                </span>
              </div>
              <span className="font-extrabold text-xs text-orange-600 dark:text-orange-400 block mt-0.5">
                980.000₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
