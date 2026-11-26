'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { VariantSizeOption } from '@/types/product';

interface UseProductFilterSidebarParams {
  minPrice: number | null;
  maxPrice: number | null;
  availableSizeOptions: VariantSizeOption[];
  selectedSizes: string[];
  onSetPriceRange: (min: number | null, max: number | null) => void;
}

const DEFAULT_VISIBLE_SIZE_LIMIT = 12;

/**
 * Custom Hook quản lý toàn bộ trạng thái tương tác cho Bộ lọc trang sản phẩm (ProductFilterSidebar):
 * - Quản lý ô nhập khoảng giá Từ - Đến
 * - Quản lý đóng/mở cây danh mục
 * - Quản lý tìm kiếm nhanh kích cỡ biến thể (8oz, 190, 42, XL, 4U...) và chế độ Xem thêm / Thu gọn khi lượng biến thể tăng lớn
 */
export function useProductFilterSidebar({
  minPrice,
  maxPrice,
  availableSizeOptions,
  selectedSizes,
  onSetPriceRange,
}: UseProductFilterSidebarParams) {
  const [minInput, setMinInput] = useState<string>(
    minPrice !== null ? minPrice.toString() : ''
  );
  const [maxInput, setMaxInput] = useState<string>(
    maxPrice !== null ? maxPrice.toString() : ''
  );

  // Danh sách ID danh mục đang thu gọn
  const [collapsedCategoryIds, setCollapsedCategoryIds] = useState<number[]>([]);

  // Từ khóa tìm nhanh kích thước / quy cách ngay trong Sidebar khi số biến thể lớn
  const [sizeSearchTerm, setSizeSearchTerm] = useState<string>('');
  const [showAllSizes, setShowAllSizes] = useState<boolean>(false);

  useEffect(() => {
    setMinInput(minPrice !== null ? minPrice.toString() : '');
    setMaxInput(maxPrice !== null ? maxPrice.toString() : '');
  }, [minPrice, maxPrice]);

  const handleApplyPriceInputs = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const parsedMin = minInput ? Number(minInput) : null;
      const parsedMax = maxInput ? Number(maxInput) : null;
      onSetPriceRange(parsedMin, parsedMax);
    },
    [minInput, maxInput, onSetPriceRange]
  );

  const handleToggleCategoryExpand = useCallback((categoryId: number) => {
    setCollapsedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const isCategoryExpanded = useCallback(
    (categoryId: number) => !collapsedCategoryIds.includes(categoryId),
    [collapsedCategoryIds]
  );

  // Lọc danh sách kích thước theo giá trị kích cỡ (opt.value), không lọc theo nhãn nhóm dimensionLabel
  // để tránh gõ chữ cái như "S" bị khớp nhầm vào nhãn "Kích thước / Size" của toàn bộ danh sách.
  const filteredSizeOptions = useMemo(() => {
    const q = sizeSearchTerm.trim().toLowerCase();
    if (!q) return availableSizeOptions;
    return availableSizeOptions
      .filter((opt) => opt.value.toLowerCase().includes(q))
      .sort((a, b) => {
        const va = a.value.toLowerCase();
        const vb = b.value.toLowerCase();
        const aExact = va === q ? 0 : va.startsWith(q) ? 1 : 2;
        const bExact = vb === q ? 0 : vb.startsWith(q) ? 1 : 2;
        return aExact - bExact;
      });
  }, [availableSizeOptions, sizeSearchTerm]);

  // Nếu chưa bấm Xem thêm và không đang gõ tìm kiếm: ưu tiên hiển thị các size đang được chọn + các size phổ biến nhất
  const visibleSizeOptions = useMemo(() => {
    if (showAllSizes || sizeSearchTerm.trim() !== '') {
      return filteredSizeOptions;
    }
    if (filteredSizeOptions.length <= DEFAULT_VISIBLE_SIZE_LIMIT) {
      return filteredSizeOptions;
    }

    const selectedSet = new Set(selectedSizes.map((s) => s.toLowerCase()));
    const result: VariantSizeOption[] = [];
    const addedKeys = new Set<string>();

    // Luôn giữ các chip đang được người dùng tích chọn hiển thị trên màn hình
    for (const opt of filteredSizeOptions) {
      const k = opt.value.toLowerCase();
      if (selectedSet.has(k) && !addedKeys.has(k)) {
        result.push(opt);
        addedKeys.add(k);
      }
    }

    for (const opt of filteredSizeOptions) {
      if (result.length >= DEFAULT_VISIBLE_SIZE_LIMIT) break;
      const k = opt.value.toLowerCase();
      if (!addedKeys.has(k)) {
        result.push(opt);
        addedKeys.add(k);
      }
    }

    return result;
  }, [filteredSizeOptions, showAllSizes, sizeSearchTerm, selectedSizes]);

  // Gom nhóm động theo nhãn thuộc tính sản phẩm (VD: "Kích thước / Size", "Trọng lượng", "Loại sân"...)
  const groupedSizeSections = useMemo(() => {
    const map = new Map<string, VariantSizeOption[]>();
    for (const opt of visibleSizeOptions) {
      const label = opt.dimensionLabel || 'Kích thước / Quy cách';
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(opt);
    }
    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      items,
    }));
  }, [visibleSizeOptions]);

  const hiddenSizesCount = Math.max(0, filteredSizeOptions.length - visibleSizeOptions.length);

  const handleToggleShowAllSizes = useCallback(() => {
    setShowAllSizes((prev) => !prev);
  }, []);

  return {
    minInput,
    maxInput,
    setMinInput,
    setMaxInput,
    handleApplyPriceInputs,
    collapsedCategoryIds,
    handleToggleCategoryExpand,
    isCategoryExpanded,
    sizeSearchTerm,
    setSizeSearchTerm,
    showAllSizes,
    handleToggleShowAllSizes,
    filteredSizeOptions,
    visibleSizeOptions,
    groupedSizeSections,
    hiddenSizesCount,
  };
}
