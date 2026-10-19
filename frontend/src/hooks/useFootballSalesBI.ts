import { useState, useMemo } from 'react';
import { FootballTopProduct } from '@/types/dashboard';

export type FootballMetricMode = 'BOTH' | 'REVENUE' | 'VOLUME';

/**
 * Hook nghiệp vụ xử lý phân tích Top 10 mặt hàng Bóng Đá & Tỷ trọng Doanh thu / Sản lượng
 * Tuân thủ nghiêm ngặt 7-Layer Architecture: Tách biệt hoàn toàn nghiệp vụ khỏi UI Component.
 */
export function useFootballSalesBI(products?: FootballTopProduct[]) {
  const [metricMode, setMetricMode] = useState<FootballMetricMode>('BOTH');
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);

  // Danh sách an toàn
  const safeProducts = useMemo(() => {
    return products || [];
  }, [products]);

  // Tổng doanh thu bóng đá và tổng sản lượng bóng đá từ danh sách
  const totals = useMemo(() => {
    const totalRev = safeProducts.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const totalVol = safeProducts.reduce((acc, curr) => acc + (curr.quantitySold || 0), 0);
    const topPerformer = safeProducts.length > 0 ? safeProducts[0] : null;

    return {
      totalRevenue: totalRev,
      totalVolume: totalVol,
      topPerformer,
      productCount: safeProducts.length,
    };
  }, [safeProducts]);

  // Sản phẩm đang được hover hoặc chọn xem chi tiết
  const hoveredProduct = useMemo(() => {
    if (!hoveredProductId) return null;
    return safeProducts.find((p) => p.productId === hoveredProductId) || null;
  }, [hoveredProductId, safeProducts]);

  return {
    products: safeProducts,
    metricMode,
    setMetricMode,
    hoveredProductId,
    setHoveredProductId,
    hoveredProduct,
    totals,
  };
}
