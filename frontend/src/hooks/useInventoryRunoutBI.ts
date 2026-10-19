import { useState, useMemo } from 'react';
import { InventoryRunoutAnalysis } from '@/types/dashboard';

export type RunoutHealthFilter = 'ALL' | 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'OVERSTOCK';

/**
 * Hook nghiệp vụ xử lý Ma Trận Phân Tích Tồn Kho Runout Days & Đề Xuất Nhập Hàng
 * Tuân thủ nghiêm ngặt 7-Layer Architecture: Quản lý toàn bộ state lọc, tìm kiếm, tính toán chỉ số kho.
 */
export function useInventoryRunoutBI(items?: InventoryRunoutAnalysis[]) {
  const [selectedFilter, setSelectedFilter] = useState<RunoutHealthFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const safeItems = useMemo(() => {
    return items || [];
  }, [items]);

  // Thống kê nhanh các chỉ số tổng hợp
  const metrics = useMemo(() => {
    let criticalCount = 0;
    let warningCount = 0;
    let healthyCount = 0;
    let overstockCount = 0;
    let totalSuggestedReorder = 0;

    for (const item of safeItems) {
      if (item.healthStatus === 'CRITICAL') criticalCount++;
      else if (item.healthStatus === 'WARNING') warningCount++;
      else if (item.healthStatus === 'HEALTHY') healthyCount++;
      else if (item.healthStatus === 'OVERSTOCK') overstockCount++;

      totalSuggestedReorder += item.suggestedReorderQty || 0;
    }

    return {
      totalVariants: safeItems.length,
      criticalCount,
      warningCount,
      healthyCount,
      overstockCount,
      totalSuggestedReorder,
    };
  }, [safeItems]);

  // Danh sách đã lọc theo trạng thái và từ khóa tìm kiếm
  const filteredItems = useMemo(() => {
    return safeItems.filter((item) => {
      // Lọc theo trạng thái
      if (selectedFilter !== 'ALL' && item.healthStatus !== selectedFilter) {
        return false;
      }

      // Lọc theo từ khóa tìm kiếm (SKU hoặc Tên sản phẩm)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const skuMatch = item.sku?.toLowerCase().includes(query);
        const nameMatch = item.productName?.toLowerCase().includes(query);
        const infoMatch = item.variantInfo?.toLowerCase().includes(query);
        return skuMatch || nameMatch || infoMatch;
      }

      return true;
    });
  }, [safeItems, selectedFilter, searchTerm]);

  return {
    items: filteredItems,
    allItems: safeItems,
    selectedFilter,
    setSelectedFilter,
    searchTerm,
    setSearchTerm,
    metrics,
  };
}
