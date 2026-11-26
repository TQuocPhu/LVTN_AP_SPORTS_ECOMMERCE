'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportController } from '@/controllers/report-controller';
import {
  CategoryRevenueItemResponse,
  TimeRangePreset,
  TopMerchandiseReportResponse,
  TopProductItemResponse,
} from '@/types/report';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useChartDrilldownModal } from '@/hooks/useChartDrilldownModal';
import { toast } from 'sonner';

/**
 * Custom Hook quản lý trang Thống Kê Sản Phẩm & Danh Mục (/admin/products/reports)
 * nằm trong cụm Dropdown Bán Hàng & Sản Phẩm (Phân quyền nghiêm ngặt: ADMIN và STAFF).
 */
export function useProductReportsPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const drilldown = useChartDrilldownModal();

  const [timeRange, setTimeRange] = useState<TimeRangePreset>('LAST_30_DAYS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [merchandiseData, setMerchandiseData] = useState<TopMerchandiseReportResponse | null>(null);

  const roleName = user?.roleName?.toUpperCase() || '';
  const hasAccess = roleName === 'ADMIN' || roleName === 'STAFF';

  const filterParams = useMemo(
    () => ({
      timeRange,
      startDate: timeRange === 'CUSTOM' ? startDate : undefined,
      endDate: timeRange === 'CUSTOM' ? endDate : undefined,
    }),
    [timeRange, startDate, endDate]
  );

  const loadMerchandiseReport = useCallback(async () => {
    if (authLoading || !hasAccess) return;
    try {
      setLoading(true);
      const res = await reportController.getTopMerchandise(filterParams, 15);
      if (res.data) {
        setMerchandiseData(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải dữ liệu thống kê sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [authLoading, hasAccess, filterParams]);

  useEffect(() => {
    loadMerchandiseReport();
  }, [loadMerchandiseReport]);

  const handlePresetChange = useCallback((preset: TimeRangePreset) => {
    setTimeRange(preset);
  }, []);

  const handleCustomDateChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimeRange('CUSTOM');
  }, []);

  // Mở Modal bảng đơn hàng khi click vào một Sản phẩm bán chạy
  const handleSelectProduct = useCallback(
    (prod: TopProductItemResponse) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Chi Tiết Đơn Mua Sản Phẩm — ${prod.productName}`,
        subtitle: `Danh sách các đơn hàng hoàn tất đã mua sản phẩm này trong kỳ (${prod.totalQuantitySold} món đã bán)`,
        timeRange,
        startDate: timeRange === 'CUSTOM' ? startDate : undefined,
        endDate: timeRange === 'CUSTOM' ? endDate : undefined,
        statusGroup: 'COMPLETED',
        productId: prod.productId,
      });
    },
    [drilldown, timeRange, startDate, endDate]
  );

  // Mở Modal bảng đơn hàng khi click vào thanh Danh mục trên biểu đồ Tỷ trọng Danh mục
  const handleSelectCategory = useCallback(
    (cat: CategoryRevenueItemResponse) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Chi Tiết Đơn Hàng Theo Ngành Hàng — ${cat.categoryName}`,
        subtitle: `Các đơn hàng hoàn tất có mua sản phẩm thuộc danh mục ${cat.categoryName} (${cat.percentage}% tỷ trọng)`,
        timeRange,
        startDate: timeRange === 'CUSTOM' ? startDate : undefined,
        endDate: timeRange === 'CUSTOM' ? endDate : undefined,
        statusGroup: 'COMPLETED',
        categoryId: cat.categoryId,
      });
    },
    [drilldown, timeRange, startDate, endDate]
  );

  return {
    user,
    authLoading,
    hasAccess,
    timeRange,
    startDate,
    endDate,
    loading,
    merchandiseData,
    handlePresetChange,
    handleCustomDateChange,
    handleRefresh: loadMerchandiseReport,
    handleSelectProduct,
    handleSelectCategory,
    drilldown,
  };
}
