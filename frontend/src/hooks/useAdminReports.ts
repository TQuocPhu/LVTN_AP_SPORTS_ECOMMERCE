'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportController } from '@/controllers/report-controller';
import {
  DailyReconciliationRow,
  FinancialReconciliationResponse,
  ReportFilterParams,
  ReportTabType,
  RevenueOverviewReportResponse,
  TimeRangePreset,
  TimeSeriesPointResponse,
} from '@/types/report';
import { useChartDrilldownModal } from '@/hooks/useChartDrilldownModal';
import { useRealtimeReportSync } from '@/hooks/useRealtimeReportSync';
import { toast } from 'sonner';
import {
  exportEnterpriseReportToCSV,
  printEnterpriseReportDocument,
} from '@/utils/reportExportPrinter';

const RECONCILIATION_PAGE_SIZE = 10;

// ==========================================
// CÁC HẰNG SỐ CẤU HÌNH BỘ LỌC BÁO CÁO ADMIN
// ==========================================
export const TIME_RANGE_OPTIONS: { label: string; value: TimeRangePreset }[] = [
  { label: 'Hôm nay', value: 'TODAY' },
  { label: '7 ngày qua', value: 'LAST_7_DAYS' },
  { label: '30 ngày qua', value: 'LAST_30_DAYS' },
  { label: 'Tháng này', value: 'THIS_MONTH' },
  { label: 'Tháng trước', value: 'LAST_MONTH' },
  { label: 'Quý này', value: 'THIS_QUARTER' },
  { label: 'Toàn thời gian', value: 'ALL_TIME' },
  { label: 'Tùy chọn ngày', value: 'CUSTOM' },
];

export const REPORT_TABS: { key: ReportTabType; label: string; iconName: string }[] = [
  { key: 'overview', label: 'Doanh Thu & Đơn Hàng', iconName: 'DollarSign' },
];

/**
 * Custom Hook quản lý trang Báo Cáo Doanh Thu & Đơn Hàng (/admin/reports) của Admin,
 * tích hợp điều khiển Modal Bảng Chi Tiết Đơn Hàng khi click vào bất kỳ nút giao biểu đồ nào.
 */
export function useAdminReports(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const drilldown = useChartDrilldownModal();

  const [timeRange, setTimeRange] = useState<TimeRangePreset>('LAST_30_DAYS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<RevenueOverviewReportResponse | null>(null);
  const [reconciliationData, setReconciliationData] = useState<FinancialReconciliationResponse | null>(null);
  const [reconciliationLoading, setReconciliationLoading] = useState<boolean>(false);
  const [reconciliationMethod, setReconciliationMethod] = useState<'ALL' | 'COD' | 'VNPAY'>('ALL');
  const [reconciliationPage, setReconciliationPage] = useState<number>(0);

  // State hover tooltip của 2 biểu đồ chuỗi thời gian
  const [revenueHoveredPoint, setRevenueHoveredPoint] = useState<TimeSeriesPointResponse | null>(null);
  const [revenueHoverPos, setRevenueHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [volumeHoveredPoint, setVolumeHoveredPoint] = useState<TimeSeriesPointResponse | null>(null);

  const filterParams: ReportFilterParams = useMemo(() => {
    return {
      timeRange,
      startDate: timeRange === 'CUSTOM' ? startDate : undefined,
      endDate: timeRange === 'CUSTOM' ? endDate : undefined,
    };
  }, [timeRange, startDate, endDate]);

  const loadReportData = useCallback(async (silent = false) => {
    if (!enabled) return;
    try {
      if (!silent) {
        setLoading(true);
        setReconciliationLoading(true);
      }
      setError(null);
      const [overviewRes, reconRes] = await Promise.all([
        reportController.getRevenueOverview(filterParams),
        reportController.getFinancialReconciliation(filterParams, reconciliationMethod),
      ]);
      if (overviewRes.data) setOverviewData(overviewRes.data);
      if (reconRes.data) {
        setReconciliationData(reconRes.data);
        if (!silent) setReconciliationPage(0);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu báo cáo doanh thu';
      setError(msg);
    } finally {
      if (!silent) {
        setLoading(false);
        setReconciliationLoading(false);
      }
    }
  }, [enabled, filterParams, reconciliationMethod]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  useRealtimeReportSync(() => loadReportData(true), { enabled });

  const handlePresetChange = useCallback((preset: TimeRangePreset) => {
    setTimeRange(preset);
  }, []);

  const handleCustomDateChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimeRange('CUSTOM');
  }, []);

  const handleRefresh = useCallback(() => {
    loadReportData();
    toast.success('Đã làm mới dữ liệu báo cáo doanh thu');
  }, [loadReportData]);

  // 1. Click điểm nút trên Biểu đồ Xu hướng Doanh thu
  const handleSelectRevenuePoint = useCallback(
    (point: TimeSeriesPointResponse) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Bảng Đơn Hàng Hoàn Tất Doanh Thu — Ngày ${point.label || point.date}`,
        subtitle: `Danh sách chi tiết đơn hàng giao thành công / hoàn tất tạo nên doanh thu ngày ${point.date}`,
        specificDate: point.date,
        statusGroup: 'COMPLETED',
      });
    },
    [drilldown]
  );

  // 2. Click cột trên Biểu đồ Sản lượng & Trạng thái Đơn
  const handleSelectVolumeBar = useCallback(
    (point: TimeSeriesPointResponse, statusGroup: 'ALL' | 'COMPLETED' | 'CANCELLED') => {
      const groupTitle =
        statusGroup === 'COMPLETED'
          ? 'Đơn Giao Thành Công'
          : statusGroup === 'CANCELLED'
          ? 'Đơn Đã Hủy'
          : 'Tổng Đơn Phát Sinh';
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Bảng Chi Tiết ${groupTitle} — Ngày ${point.label || point.date}`,
        subtitle: `Danh sách đơn hàng, khách mua và sản phẩm biến thể phát sinh trong ngày ${point.date}`,
        specificDate: point.date,
        statusGroup,
      });
    },
    [drilldown]
  );

  // 3. Click lát cắt / thẻ trên Biểu đồ Cơ cấu Thanh toán (COD vs VNPay)
  const handleSelectPaymentMethod = useCallback(
    (method: 'CASH' | 'VNPAY', label: string) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Bảng Đơn Hàng Hoàn Tất — ${label}`,
        subtitle: 'Các đơn hàng hoàn tất thu tiền theo phương thức thanh toán trong kỳ báo cáo đang chọn',
        timeRange,
        startDate: timeRange === 'CUSTOM' ? startDate : undefined,
        endDate: timeRange === 'CUSTOM' ? endDate : undefined,
        statusGroup: 'COMPLETED',
        paymentMethod: method,
      });
    },
    [drilldown, timeRange, startDate, endDate]
  );

  // 4. Click lát cắt / thẻ trên Biểu đồ Phân bổ Trạng thái Đơn hàng
  const handleSelectStatusGroup = useCallback(
    (statusGroup: 'COMPLETED' | 'DELIVERING' | 'CANCELLED' | 'RETURNED', label: string) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Bảng Chi Tiết — ${label}`,
        subtitle: 'Danh sách đơn hàng thuộc nhóm trạng thái vừa chọn trong kỳ báo cáo hiện hành',
        timeRange,
        startDate: timeRange === 'CUSTOM' ? startDate : undefined,
        endDate: timeRange === 'CUSTOM' ? endDate : undefined,
        statusGroup,
      });
    },
    [drilldown, timeRange, startDate, endDate]
  );

  // 5. Click vào 1 dòng ngày trong Bảng Đối Soát Dòng Tiền → mở Modal chi tiết đơn của ngày đó
  const handleSelectReconciliationRow = useCallback(
    (row: DailyReconciliationRow) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Đối Soát Đơn Hàng — Ngày ${row.label}`,
        subtitle: `Chi tiết các đơn hàng phát sinh trong ngày ${row.label} (Kênh: ${reconciliationMethod === 'ALL' ? 'Tất cả' : reconciliationMethod})`,
        specificDate: row.date,
        statusGroup: 'ALL',
        paymentMethod: reconciliationMethod === 'COD' ? 'CASH' : reconciliationMethod === 'VNPAY' ? 'VNPAY' : undefined,
      });
    },
    [drilldown, reconciliationMethod]
  );

  const handleExportCSV = useCallback(async () => {
    try {
      await exportEnterpriseReportToCSV({
        activeTab: 'overview',
        timeRange,
        startDate,
        endDate,
        overviewData,
        staffPerformance: [],
        warehouseData: null,
        merchandiseData: null,
        reconciliationData,
        currentUserName: 'Quản trị viên',
      });
      toast.success('Đã xuất file báo cáo doanh thu & đối soát Excel (.xlsx) thành công');
    } catch (err) {
      console.error('Lỗi khi xuất file Excel:', err);
      toast.error('Không thể xuất file báo cáo Excel');
    }
  }, [timeRange, startDate, endDate, overviewData, reconciliationData]);

  const handlePrint = useCallback(() => {
    try {
      printEnterpriseReportDocument({
        activeTab: 'overview',
        timeRange,
        startDate,
        endDate,
        overviewData,
        staffPerformance: [],
        warehouseData: null,
        merchandiseData: null,
        reconciliationData,
        currentUserName: 'Quản trị viên',
      });
    } catch (err) {
      console.error('Lỗi khi mở trình in:', err);
      toast.error('Không thể khởi tạo bản in');
    }
  }, [timeRange, startDate, endDate, overviewData, reconciliationData]);

  const reconciliationRows = reconciliationData?.dailyRows || [];
  const reconciliationTotalPages = Math.max(1, Math.ceil(reconciliationRows.length / RECONCILIATION_PAGE_SIZE));
  const paginatedReconciliationRows = useMemo(() => {
    const safePage = Math.min(reconciliationPage, Math.max(0, reconciliationTotalPages - 1));
    const startIdx = safePage * RECONCILIATION_PAGE_SIZE;
    return reconciliationRows.slice(startIdx, startIdx + RECONCILIATION_PAGE_SIZE);
  }, [reconciliationRows, reconciliationPage, reconciliationTotalPages]);

  return {
    timeRange,
    startDate,
    endDate,
    loading,
    error,
    overviewData,
    reconciliationData,
    reconciliationLoading,
    reconciliationMethod,
    setReconciliationMethod,
    reconciliationPage,
    reconciliationTotalPages,
    paginatedReconciliationRows,
    setReconciliationPage,
    revenueHoveredPoint,
    revenueHoverPos,
    setRevenueHoveredPoint,
    setRevenueHoverPos,
    volumeHoveredPoint,
    setVolumeHoveredPoint,
    handlePresetChange,
    handleCustomDateChange,
    handleRefresh,
    handleSelectRevenuePoint,
    handleSelectVolumeBar,
    handleSelectPaymentMethod,
    handleSelectStatusGroup,
    handleSelectReconciliationRow,
    handleExportCSV,
    handlePrint,
    drilldown,
  };
}
