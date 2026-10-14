'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportController } from '@/controllers/report-controller';
import {
  ReportFilterParams,
  RevenueOverviewReportResponse,
  StaffPerformanceReportResponse,
  TimeRangePreset,
} from '@/types/report';
import { AdminOrderDetail } from '@/types/admin-order';
import { toast } from 'sonner';

// ==========================================
// CÁC HẰNG SỐ CẤU HÌNH BÁO CÁO CÁ NHÂN NHÂN VIÊN
// ==========================================
export const STAFF_TIME_PRESETS: { label: string; value: TimeRangePreset }[] = [
  { label: 'Tháng này', value: 'THIS_MONTH' },
  { label: '7 ngày qua', value: 'LAST_7_DAYS' },
  { label: '30 ngày qua', value: 'LAST_30_DAYS' },
  { label: 'Tháng trước', value: 'LAST_MONTH' },
  { label: 'Toàn thời gian', value: 'ALL_TIME' },
];

export function useStaffReports() {
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('THIS_MONTH');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [performance, setPerformance] = useState<StaffPerformanceReportResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueOverviewReportResponse | null>(null);
  const [myOrders, setMyOrders] = useState<AdminOrderDetail[]>([]);
  const [ordersPage, setOrdersPage] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  const filterParams: ReportFilterParams = useMemo(() => {
    return { timeRange };
  }, [timeRange]);

  const loadStaffData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [perfRes, revRes, ordersRes] = await Promise.all([
        reportController.getMyStaffPerformance(filterParams),
        reportController.getMyStaffRevenue(filterParams),
        reportController.getMyStaffOrders(ordersPage, 10),
      ]);

      if (perfRes.data) setPerformance(perfRes.data);
      if (revRes.data) setRevenue(revRes.data);
      if (ordersRes.data) {
        setMyOrders(ordersRes.data.content);
        setTotalOrders(ordersRes.data.totalElements);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải báo cáo nhân viên';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filterParams, ordersPage]);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  const handlePresetChange = (preset: TimeRangePreset) => {
    setTimeRange(preset);
  };

  const handlePageChange = (newPage: number) => {
    setOrdersPage(newPage);
  };

  const handleRefresh = () => {
    loadStaffData();
    toast.success('Đã cập nhật số liệu cá nhân');
  };

  return {
    timeRange,
    loading,
    error,
    performance,
    revenue,
    myOrders,
    ordersPage,
    totalOrders,
    handlePresetChange,
    handlePageChange,
    handleRefresh,
  };
}
