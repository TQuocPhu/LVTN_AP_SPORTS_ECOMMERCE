'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportController } from '@/controllers/report-controller';
import {
  ReportFilterParams,
  ReportTabType,
  RevenueOverviewReportResponse,
  StaffPerformanceReportResponse,
  TimeRangePreset,
  TimeSeriesPointResponse,
  TopMerchandiseReportResponse,
  WarehouseReportResponse,
} from '@/types/report';
import { UserResponse } from '@/types/auth';
import { toast } from 'sonner';

import {
  exportEnterpriseReportToCSV,
  printEnterpriseReportDocument,
} from '@/utils/reportExportPrinter';

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
  { key: 'overview', label: 'Doanh Thu & Dòng Tiền', iconName: 'DollarSign' },
  { key: 'staff', label: 'Hiệu Suất Nhân Viên', iconName: 'Users' },
  { key: 'warehouse', label: 'Kho Vận & Tồn Kho', iconName: 'Warehouse' },
  { key: 'merchandise', label: 'Sản Phẩm & Danh Mục', iconName: 'Package' },
];

export function useAdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTabType>('overview');
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('LAST_30_DAYS');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [staffId, setStaffId] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [overviewData, setOverviewData] = useState<RevenueOverviewReportResponse | null>(null);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformanceReportResponse[]>([]);
  const [merchandiseData, setMerchandiseData] = useState<TopMerchandiseReportResponse | null>(null);
  const [warehouseData, setWarehouseData] = useState<WarehouseReportResponse | null>(null);
  const [staffList, setStaffList] = useState<UserResponse[]>([]);

  // State tìm kiếm và lọc nhân viên (chuyển từ component ra hook)
  const [staffSearchTerm, setStaffSearchTerm] = useState<string>('');

  // State hover tooltip của biểu đồ chuỗi thời gian doanh thu
  const [revenueHoveredPoint, setRevenueHoveredPoint] = useState<TimeSeriesPointResponse | null>(null);
  const [revenueHoverPos, setRevenueHoverPos] = useState<{ x: number; y: number } | null>(null);

  // State hover tooltip của biểu đồ sản lượng đơn hàng
  const [volumeHoveredPoint, setVolumeHoveredPoint] = useState<TimeSeriesPointResponse | null>(null);

  const filterParams: ReportFilterParams = useMemo(() => {
    return {
      timeRange,
      startDate: timeRange === 'CUSTOM' ? startDate : undefined,
      endDate: timeRange === 'CUSTOM' ? endDate : undefined,
      staffId: staffId !== null ? staffId : undefined,
    };
  }, [timeRange, startDate, endDate, staffId]);

  // Load danh sách nhân viên để phục vụ dropdown
  useEffect(() => {
    let isMounted = true;
    reportController
      .getStaffDropdownList()
      .then((res) => {
        if (isMounted && res.data) {
          setStaffList(res.data);
        }
      })
      .catch((err) => {
        console.error('Không thể nạp danh sách nhân viên:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi song song theo tab để tối ưu hiệu năng
      if (activeTab === 'overview') {
        const res = await reportController.getRevenueOverview(filterParams);
        if (res.data) setOverviewData(res.data);
      } else if (activeTab === 'staff') {
        const res = await reportController.getStaffPerformance(filterParams);
        if (res.data) setStaffPerformance(res.data);
      } else if (activeTab === 'warehouse') {
        const res = await reportController.getWarehouseReport(filterParams);
        if (res.data) setWarehouseData(res.data);
      } else if (activeTab === 'merchandise') {
        const res = await reportController.getTopMerchandise(filterParams);
        if (res.data) setMerchandiseData(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải dữ liệu báo cáo thống kê';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filterParams]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Danh sách nhân viên sau khi tìm kiếm (tính toán thuần trong hook)
  const filteredStaffPerformance = useMemo(() => {
    if (!staffSearchTerm.trim()) return staffPerformance;
    const q = staffSearchTerm.toLowerCase();
    return staffPerformance.filter(
      (s) =>
        s.staffName.toLowerCase().includes(q) ||
        s.staffEmail.toLowerCase().includes(q) ||
        (s.employeeCode && s.employeeCode.toLowerCase().includes(q))
    );
  }, [staffPerformance, staffSearchTerm]);

  // Thống kê tổng hợp hiệu suất nhân viên (cho các card KPI phụ)
  const staffSummaryKpis = useMemo(() => {
    const totalStaff = staffPerformance.length;
    const topPerformer = staffPerformance.length > 0 ? staffPerformance[0] : null;
    const totalCommissionPaid = staffPerformance.reduce(
      (sum, s) => sum + (Number(s.estimatedCommission) || 0),
      0
    );
    const avgSuccessRate =
      totalStaff > 0
        ? Math.round(
            staffPerformance.reduce((sum, s) => sum + (Number(s.successRate) || 0), 0) /
              totalStaff
          )
        : 0;

    return {
      totalStaff,
      topPerformer,
      totalCommissionPaid,
      avgSuccessRate,
    };
  }, [staffPerformance]);

  const handleTabChange = (tab: ReportTabType) => {
    setActiveTab(tab);
  };

  const handlePresetChange = (preset: TimeRangePreset) => {
    setTimeRange(preset);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setTimeRange('CUSTOM');
  };

  const handleStaffChange = (id: number | null) => {
    setStaffId(id);
  };

  const handleRefresh = () => {
    loadReportData();
    toast.success('Đã làm mới dữ liệu báo cáo');
  };

  const handleExportCSV = () => {
    try {
      exportEnterpriseReportToCSV({
        activeTab,
        timeRange,
        startDate,
        endDate,
        overviewData,
        staffPerformance,
        warehouseData,
        merchandiseData,
        currentUserName: 'Quản trị viên',
      });
      toast.success('Đã xuất file báo cáo CSV thành công (chuẩn UTF-8)');
    } catch (err) {
      console.error('Lỗi khi xuất file CSV:', err);
      toast.error('Không thể xuất file báo cáo CSV');
    }
  };

  const handlePrint = () => {
    try {
      printEnterpriseReportDocument({
        activeTab,
        timeRange,
        startDate,
        endDate,
        overviewData,
        staffPerformance,
        warehouseData,
        merchandiseData,
        currentUserName: 'Quản trị viên',
      });
    } catch (err) {
      console.error('Lỗi khi chuẩn bị bản in:', err);
      toast.error('Không thể khởi tạo bản in báo cáo');
    }
  };

  return {
    activeTab,
    timeRange,
    startDate,
    endDate,
    staffId,
    staffList,
    loading,
    error,
    overviewData,
    staffPerformance,
    filteredStaffPerformance,
    staffSummaryKpis,
    staffSearchTerm,
    setStaffSearchTerm,
    revenueHoveredPoint,
    revenueHoverPos,
    setRevenueHoveredPoint,
    setRevenueHoverPos,
    volumeHoveredPoint,
    setVolumeHoveredPoint,
    merchandiseData,
    warehouseData,
    handleTabChange,
    handlePresetChange,
    handleCustomDateChange,
    handleStaffChange,
    handleRefresh,
    handleExportCSV,
    handlePrint,
  };
}
