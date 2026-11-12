'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseProductFilterSidebarParams {
  minPrice: number | null;
  maxPrice: number | null;
  onSetPriceRange: (min: number | null, max: number | null) => void;
}

/**
 * Custom Hook quản lý toàn bộ trạng thái tương tác cho Bộ lọc trang sản phẩm (ProductFilterSidebar)
 * và Cây danh mục (CategoryDirectoryTree).
 *
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Đóng gói toàn bộ useState / useEffect của ô nhập khoảng giá và trạng thái đóng/mở các nhánh cây danh mục.
 * - Giúp các Component `ProductFilterSidebar` và `CategoryDirectoryTree` hoàn toàn thuần giao diện (Pure UI Components).
 */
export function useProductFilterSidebar({
  minPrice,
  maxPrice,
  onSetPriceRange,
}: UseProductFilterSidebarParams) {
  // State lưu giá trị tạm thời của 2 ô nhập giá (Từ - Đến)
  const [minInput, setMinInput] = useState<string>(
    minPrice !== null ? minPrice.toString() : ''
  );
  const [maxInput, setMaxInput] = useState<string>(
    maxPrice !== null ? maxPrice.toString() : ''
  );

  // State lưu danh sách các ID danh mục đang bị thu gọn (collapsed); mặc định mở toàn bộ (Set rỗng)
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<number[]>([]);

  // Đồng bộ lại giá trị trong ô input khi minPrice/maxPrice từ bộ lọc chính thay đổi (ví dụ bấm nút Đặt lại hoặc chọn Preset)
  useEffect(() => {
    setMinInput(minPrice !== null ? minPrice.toString() : '');
    setMaxInput(maxPrice !== null ? maxPrice.toString() : '');
  }, [minPrice, maxPrice]);

  /**
   * Xử lý khi người dùng nhấn nút "Áp dụng khoảng giá" trên form nhập giá thủ công.
   */
  const handleApplyPriceInputs = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const parsedMin = minInput ? Number(minInput) : null;
      const parsedMax = maxInput ? Number(maxInput) : null;
      onSetPriceRange(parsedMin, parsedMax);
    },
    [minInput, maxInput, onSetPriceRange]
  );

  /**
   * Đóng hoặc mở nhánh danh mục con khi người dùng bấm vào mũi tên trên cây danh mục.
   */
  const handleToggleCategoryExpand = useCallback((categoryId: number) => {
    setCollapsedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  /**
   * Kiểm tra một danh mục cha có đang mở nhánh con hay không (mặc định là true).
   */
  const isCategoryExpanded = useCallback(
    (categoryId: number) => !collapsedCategoryIds.includes(categoryId),
    [collapsedCategoryIds]
  );

  return {
    minInput,
    maxInput,
    setMinInput,
    setMaxInput,
    handleApplyPriceInputs,
    collapsedCategoryIds,
    handleToggleCategoryExpand,
    isCategoryExpanded,
  };
}

