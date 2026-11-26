'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryResponse } from '@/types/category';
import { Product, VariantSizeOption } from '@/types/product';
import { formatCurrency } from '@/utils/formatters';
import { CategoryDirectoryTree } from './CategoryDirectoryTree';
import { useProductFilterSidebar } from '@/hooks/useProductFilterSidebar';
import {
  Star,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Sparkles,
  Trophy,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ProductFilterSidebarProps {
  categoryTree: CategoryResponse[];
  topRatedProducts?: Product[];
  availableSizeOptions?: VariantSizeOption[];
  loadingSizes?: boolean;
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

const PRICE_PRESETS = [
  { label: 'Dưới 500k', min: 0, max: 500000 },
  { label: '500k - 1 Triệu', min: 500000, max: 1000000 },
  { label: '1M - 3 Triệu', min: 1000000, max: 3000000 },
  { label: 'Trên 3 Triệu', min: 3000000, max: 100000000 },
];

/**
 * Component Thanh bên Bộ lọc Tìm kiếm Sản phẩm (Product Filter Sidebar).
 * Tuân thủ nghiêm ngặt Layer Architecture:
 * - Gọi hook `useProductFilterSidebar` để xử lý nghiệp vụ giao diện, hoàn toàn không dùng useState/useEffect trực tiếp.
 * - Hỗ trợ đầy đủ chế độ Dark/Light mode của trang khách hàng.
 */
export function ProductFilterSidebar({
  categoryTree,
  topRatedProducts = [],
  availableSizeOptions = [],
  loadingSizes = false,
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
  const {
    minInput,
    maxInput,
    setMinInput,
    setMaxInput,
    handleApplyPriceInputs,
    collapsedCategoryIds,
    handleToggleCategoryExpand,
    sizeSearchTerm,
    setSizeSearchTerm,
    showAllSizes,
    handleToggleShowAllSizes,
    groupedSizeSections,
    hiddenSizesCount,
  } = useProductFilterSidebar({
    minPrice,
    maxPrice,
    availableSizeOptions,
    selectedSizes,
    onSetPriceRange,
  });

  return (
    <aside className="w-full space-y-6">
      {/* Tiêu đề Sidebar & Nút đặt lại bộ lọc */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Bộ Lọc Tìm Kiếm
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors"
            title="Xóa tất cả các bộ lọc đang chọn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại</span>
          </button>
        )}
      </div>

      {/* Nhãn hiển thị các bộ lọc đang kích hoạt */}
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
                ? `${(minPrice / 1000).toLocaleString('vi-VN')}k`
                : '0k'}{' '}
              -{' '}
              {maxPrice && maxPrice < 10000000
                ? `${(maxPrice / 1000).toLocaleString('vi-VN')}k`
                : 'Tối đa'}
            </span>
          )}
          {selectedSizes.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Size: {selectedSizes.join(', ')}
            </span>
          )}
          {selectedRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ★ {selectedRating}+ Sao
            </span>
          )}
        </div>
      )}

      {/* Khối 1: Cây danh mục sản phẩm (Directory Tree được tăng tốc bởi Redis Cache) */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Danh Mục Sản Phẩm
        </h4>
        <CategoryDirectoryTree
          categoryTree={categoryTree}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={onSelectCategory}
          collapsedCategoryIds={collapsedCategoryIds}
          onToggleExpand={handleToggleCategoryExpand}
        />
      </div>

      {/* Khối 2: Lọc theo Khoảng Giá (Price Range Presets & Manual Form) */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Khoảng Giá (VND)
        </h4>

        {/* Các mức giá chọn nhanh */}
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
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-500/50'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Form nhập khoảng giá tùy chỉnh */}
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

      {/* Khối 3: Lọc theo Đánh giá (Rating Filter 4★+) */}
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
                    ? 'bg-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < starCount
                          ? isSelected
                            ? 'fill-white text-white'
                            : 'fill-amber-400 text-amber-400'
                          : isSelected
                            ? 'text-white/40'
                            : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1.5 font-semibold">
                    {starCount === 5 ? '5.0 tuyệt đối' : 'Từ 4.0 trở lên'}
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Khối 4: Bộ lọc Kích thước & Quy cách Biến thể Động theo Sản phẩm (Hỗ trợ mọi loại biến thể 8oz, 190, 42, XL, 4U...) */}
      <div className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Kích Thước & Quy Cách
          </h4>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            ({availableSizeOptions.length} phân loại)
          </span>
        </div>

        {/* Ô tìm nhanh kích thước khi số lượng phân loại biến thể lớn (> 10) */}
        {availableSizeOptions.length > 10 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={sizeSearchTerm}
              onChange={(e) => setSizeSearchTerm(e.target.value)}
              placeholder="Tìm kích cỡ (VD: 42, 8oz, 190...)"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        )}

        {loadingSizes && availableSizeOptions.length === 0 ? (
          <div className="flex flex-wrap gap-2 py-1">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-8 w-14 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : groupedSizeSections.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
            {sizeSearchTerm
              ? 'Không tìm thấy kích cỡ khớp từ khóa.'
              : 'Chưa có biến thể kích thước cho bộ lọc này.'}
          </p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {groupedSizeSections.map((section) => (
              <div key={section.label} className="space-y-1.5">
                {groupedSizeSections.length > 1 && (
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {section.label}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {section.items.map((opt) => {
                    const isSelected = selectedSizes.some(
                      (s) => s.toLowerCase() === opt.value.toLowerCase()
                    );
                    return (
                      <button
                        key={`${section.label}-${opt.value}`}
                        type="button"
                        onClick={() => onToggleSize(opt.value)}
                        title={`${opt.dimensionLabel}: ${opt.value} (${opt.productCount} sản phẩm)`}
                        className={`min-w-[2.75rem] h-8 px-2.5 rounded-xl text-xs font-bold border transition-all inline-flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-orange-500/60 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                      >
                        <span>{opt.value}</span>
                        <span
                          className={`text-[10px] font-medium ${
                            isSelected
                              ? 'text-orange-100'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          ({opt.productCount})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nút Xem thêm / Thu gọn khi có nhiều hơn 12 loại biến thể */}
        {!sizeSearchTerm.trim() && (hiddenSizesCount > 0 || showAllSizes) && availableSizeOptions.length > 12 && (
          <button
            type="button"
            onClick={handleToggleShowAllSizes}
            className="w-full pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center justify-center gap-1 cursor-pointer"
          >
            {showAllSizes ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Thu gọn danh sách</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Xem thêm (+{hiddenSizesCount} phân loại khác)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Khối 5: Sản phẩm đánh giá cao tiêu biểu (Dữ liệu thật từ Backend) */}
      <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent dark:from-orange-950/40 dark:via-amber-950/20 dark:to-transparent p-4 rounded-2xl border border-orange-200/60 dark:border-orange-900/40 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
            Sản Phẩm Đánh Giá Cao
          </h4>
        </div>

        <div className="space-y-3">
          {topRatedProducts.length > 0 ? (
            topRatedProducts.slice(0, 2).map((prod) => (
              <Link
                key={prod.id}
                href={`/products/${prod.slug}`}
                className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 flex items-center gap-3 shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-slate-800 shrink-0 overflow-hidden relative flex items-center justify-center font-bold text-xs text-orange-600">
                  {prod.mainImage ? (
                    <img
                      src={prod.mainImage}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Sparkles className="w-5 h-5 text-orange-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 truncate transition-colors">
                    {prod.name}
                  </h5>
                  <div className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-bold">{(prod.rating ?? 0).toFixed(1)}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                      ({prod.reviewsCount ?? 0} đánh giá)
                    </span>
                  </div>
                  <span className="font-extrabold text-xs text-orange-600 dark:text-orange-400 block mt-0.5">
                    {formatCurrency(prod.price)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
              Đang cập nhật sản phẩm nổi bật...
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
