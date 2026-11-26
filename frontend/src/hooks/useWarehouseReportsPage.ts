'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportController } from '@/controllers/report-controller';
import { TimeRangePreset, WarehouseReportResponse } from '@/types/report';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useChartDrilldownModal } from '@/hooks/useChartDrilldownModal';
import { toast } from 'sonner';

/**
 * Custom Hook quản lý trang Báo Cáo Kho Hàng chuyên biệt (/admin/inventory/reports)
 * nằm trong cụm Dropdown Kho Vận (Phân quyền nghiêm ngặt: ADMIN và WAREHOUSE_MANAGER).
 */
export function useWarehouseReportsPage() {
  const { user, loading: authLoading } = useAdminAuth();
  const drilldown = useChartDrilldownModal();

  const [timeRange, setTimeRange] = useState<TimeRangePreset>('LAST_30_DAYS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [warehouseData, setWarehouseData] = useState<WarehouseReportResponse | null>(null);

  const roleName = user?.roleName?.toUpperCase() || '';
  const hasAccess = roleName === 'ADMIN' || roleName === 'WAREHOUSE_MANAGER';

  const filterParams = useMemo(
    () => ({
      timeRange,
      startDate: timeRange === 'CUSTOM' ? startDate : undefined,
      endDate: timeRange === 'CUSTOM' ? endDate : undefined,
    }),
    [timeRange, startDate, endDate]
  );

  const loadWarehouseReport = useCallback(async () => {
    if (authLoading || !hasAccess) return;
    try {
      setLoading(true);
      const res =
        roleName === 'ADMIN'
          ? await reportController.getWarehouseReport(filterParams)
          : await reportController.getWarehouseInventory(filterParams);
      if (res.data) {
        setWarehouseData(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải dữ liệu báo cáo kho hàng');
    } finally {
      setLoading(false);
    }
  }, [authLoading, hasAccess, roleName, filterParams]);

  useEffect(() => {
    loadWarehouseReport();
  }, [loadWarehouseReport]);

  const handlePresetChange = useCallback((preset: TimeRangePreset) => {
    setTimeRange(preset);
  }, []);

  const handleCustomDateChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimeRange('CUSTOM');
  }, []);

  // Mở Modal bảng biến thể SKU khi click vào biểu đồ Tròn An toàn Tồn kho
  const handleSelectStockStatus = useCallback(
    (stockFilter: 'SAFE' | 'LOW' | 'OUT', label: string) => {
      drilldown.openDrilldown({
        mode: 'STOCKS',
        title: `Chi Tiết Biến Thể SKU — ${label}`,
        subtitle: 'Danh sách biến thể thực tế theo ngưỡng an toàn tồn kho hiện hành',
        stockFilter,
      });
    },
    [drilldown]
  );

  // Mở Modal bảng phiếu giao dịch khi click vào biểu đồ Cân đối Nhập - Xuất kho
  const handleSelectTransactionFlow = useCallback(
    (txFilter: 'IMPORT' | 'EXPORT' | 'ORDER_EXPORT' | 'MANUAL_EXPORT', label: string) => {
      drilldown.openDrilldown({
        mode: 'TRANSACTIONS',
        title: `Nhật Ký Phiếu Giao Dịch Kho — ${label}`,
        subtitle: 'Chi tiết các phiếu nhập/xuất kho phát sinh trong kỳ báo cáo đang chọn',
        txFilter,
        timeRange,
        startDate: timeRange === 'CUSTOM' ? startDate : undefined,
        endDate: timeRange === 'CUSTOM' ? endDate : undefined,
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
    warehouseData,
    handlePresetChange,
    handleCustomDateChange,
    handleRefresh: loadWarehouseReport,
    handleSelectStockStatus,
    handleSelectTransactionFlow,
    drilldown,
  };
}
