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
import {
  exportStaffPersonalReportToCSV,
  printStaffPersonalReportDocument,
} from '@/utils/reportExportPrinter';

export const STAFF_TIME_PRESETS: { label: string; value: TimeRangePreset }[] = [
  { label: 'Tháng này', value: 'THIS_MONTH' },
  { label: '7 ngày qua', value: 'LAST_7_DAYS' },
  { label: '30 ngày qua', value: 'LAST_30_DAYS' },
  { label: 'Tháng trước', value: 'LAST_MONTH' },
  { label: 'Toàn thời gian', value: 'ALL_TIME' },
];

export type StaffOrderStatusFilter = 'ALL' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';

/**
 * Custom Hook quản lý số liệu đơn hàng phụ trách của Nhân viên bán hàng (STAFF).
 * Đã loại bỏ tính hoa hồng / xếp hạng hiệu suất, chỉ tập trung theo dõi các đơn hàng
 * nhân viên đó xác nhận, đang quản lý và các đơn hàng đã giao thành công.
 */
export function useStaffReports(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('THIS_MONTH');
  const [statusFilter, setStatusFilter] = useState<StaffOrderStatusFilter>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [performance, setPerformance] = useState<StaffPerformanceReportResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueOverviewReportResponse | null>(null);
  const [myOrders, setMyOrders] = useState<AdminOrderDetail[]>([]);
  const [ordersPage, setOrdersPage] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const filterParams: ReportFilterParams = useMemo(() => {
    return { timeRange };
  }, [timeRange]);

  const loadStaffData = useCallback(async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);

      const [perfRes, revRes, ordersRes] = await Promise.all([
        reportController.getMyStaffPerformance(filterParams),
        reportController.getMyStaffRevenue(filterParams),
        reportController.getMyStaffOrders(ordersPage, 10, statusFilter),
      ]);

      if (perfRes.data) setPerformance(perfRes.data);
      if (revRes.data) setRevenue(revRes.data);
      if (ordersRes.data) {
        setMyOrders(ordersRes.data.content || []);
        setTotalOrders(ordersRes.data.totalElements || 0);
        setTotalPages(ordersRes.data.totalPages || 0);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải thống kê đơn hàng phụ trách';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [enabled, filterParams, ordersPage, statusFilter]);

  useEffect(() => {
    loadStaffData();
  }, [loadStaffData]);

  const handlePresetChange = useCallback((preset: TimeRangePreset) => {
    setTimeRange(preset);
  }, []);

  const handleStatusFilterChange = useCallback((nextStatus: StaffOrderStatusFilter) => {
    setStatusFilter(nextStatus);
    setOrdersPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setOrdersPage(newPage);
  }, []);

  const handleRefresh = useCallback(() => {
    loadStaffData();
    toast.success('Đã cập nhật danh sách đơn hàng phụ trách');
  }, [loadStaffData]);

  const handleExportCSV = useCallback(() => {
    try {
      exportStaffPersonalReportToCSV({
        timeRange,
        performance,
        revenue,
        myOrders,
        staffName: performance?.staffName || 'Nhân viên kinh doanh',
      });
      toast.success('Đã xuất danh sách đơn hàng phụ trách CSV (chuẩn UTF-8)');
    } catch (err) {
      console.error('Lỗi xuất CSV cá nhân:', err);
      toast.error('Không thể xuất file CSV');
    }
  }, [timeRange, performance, revenue, myOrders]);

  const handlePrint = useCallback(() => {
    try {
      printStaffPersonalReportDocument({
        timeRange,
        performance,
        revenue,
        myOrders,
        staffName: performance?.staffName || 'Nhân viên kinh doanh',
      });
    } catch (err) {
      console.error('Lỗi in bảng kê cá nhân:', err);
      toast.error('Không thể khởi tạo bản in');
    }
  }, [timeRange, performance, revenue, myOrders]);

  return {
    timeRange,
    statusFilter,
    loading,
    error,
    performance,
    revenue,
    myOrders,
    ordersPage,
    totalOrders,
    totalPages,
    handlePresetChange,
    handleStatusFilterChange,
    handlePageChange,
    handleRefresh,
    handleExportCSV,
    handlePrint,
  };
}
