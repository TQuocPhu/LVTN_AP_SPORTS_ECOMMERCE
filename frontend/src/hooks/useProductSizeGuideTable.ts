'use client';

import { useState } from 'react';
import { SizeGuideCategoryType } from '@/types/size-guide';

/**
 * Hook nghiệp vụ xử lý chuyển đổi Tab kích thước cho bảng chuẩn hóa kích cỡ thể thao (ProductSizeGuideTable).
 * Tuân thủ nghiêm ngặt 7-Layer Architecture: Toàn bộ state nghiệp vụ giao diện được đưa ra Hooks,
 * loại bỏ hoàn toàn useState trong Component.
 */
export function useProductSizeGuideTable(initialCategory: SizeGuideCategoryType = 'shoes') {
  const [tab, setTab] = useState<SizeGuideCategoryType>(
    initialCategory !== 'none' ? initialCategory : 'shoes'
  );

  return {
    tab,
    setTab,
  };
}
