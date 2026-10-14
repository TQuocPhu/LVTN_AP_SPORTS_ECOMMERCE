'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportController } from '@/controllers/report-controller';
import {
  ReportFilterParams,
  ReportTabType,
  RevenueOverviewReportResponse,
  StaffPerformanceReportResponse,
  TimeRangePreset,
  TopMerchandiseReportResponse,
  WarehouseReportResponse,
} from '@/types/report';
import { UserResponse } from '@/types/auth';
import { toast } from 'sonner';

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
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'overview' && overviewData) {
      csvContent += 'BÁO CÁO DOANH THU & ĐƠN HÀNG AP SPORTS\n';
      csvContent += `Tổng doanh thu hoàn thành,${overviewData.totalDeliveredRevenue}\n`;
      csvContent += `Tổng doanh thu thuần,${overviewData.totalNetRevenue}\n`;
      csvContent += `Tổng số đơn hàng,${overviewData.totalOrders}\n`;
      csvContent += `Đơn hoàn thành,${overviewData.completedOrders}\n`;
      csvContent += `Tỷ lệ giao thành công,${overviewData.successRate}%\n`;
      csvContent += `Giá trị đơn trung bình (AOV),${overviewData.averageOrderValue}\n`;
      csvContent += `Tiền mặt COD,${overviewData.cashPaymentRevenue}\n`;
      csvContent += `Thanh toán VNPay,${overviewData.vnpayPaymentRevenue}\n\n`;

      csvContent += 'NGÀY,DOANH THU,SỐ ĐƠN,ĐƠN HOÀN THÀNH,ĐƠN HỦY\n';
      overviewData.timeSeries.forEach((pt) => {
        csvContent += `${pt.date},${pt.revenue},${pt.orderCount},${pt.completedCount},${pt.cancelledCount}\n`;
      });
    } else if (activeTab === 'staff') {
      csvContent += 'BẢNG XẾP HẠNG DOANH SỐ & HIỆU SUẤT NHÂN VIÊN\n';
      csvContent += 'MÃ NV,HỌ TÊN,EMAIL,VAI TRÒ,ĐƠN TIẾP NHẬN,ĐƠN THÀNH CÔNG,TỶ LỆ THÀNH CÔNG,DOANH THU HOÀN THÀNH,AOV,HOA HỒNG ƯỚC TÍNH,THƯỞNG KPI,ĐÁNH GIÁ\n';
      staffPerformance.forEach((s) => {
        csvContent += `${s.employeeCode},"${s.staffName}",${s.staffEmail},${s.staffRole},${s.totalHandledOrders},${s.completedOrders},${s.successRate}%,${s.deliveredRevenue},${s.averageOrderValue},${s.estimatedCommission},${s.kpiBonus},${s.performanceBadge}\n`;
      });
    } else if (activeTab === 'warehouse' && warehouseData) {
      csvContent += 'BÁO CÁO KHO VẬN & TỒN KHO\n';
      csvContent += `Tổng giá trị vốn tồn kho,${warehouseData.totalInventoryValue}\n`;
      csvContent += `Tổng số lượng tồn kho,${warehouseData.totalStockQuantity}\n`;
      csvContent += `Số biến thể sắp hết,${warehouseData.lowStockVariantCount}\n`;
      csvContent += `Số biến thể hết hàng,${warehouseData.outOfStockVariantCount}\n\n`;
      csvContent += 'SKU,TÊN SẢN PHẨM,KÍCH CỠ,MÀU SẮC,GIÁ BÁN,GIÁ VỐN,SỐ LƯỢNG TỒN\n';
      warehouseData.lowStockVariants.forEach((v) => {
        csvContent += `${v.sku},"${v.productName}",${v.size || ''},${v.color || ''},${v.price},${v.costPrice || 0},${v.stockQuantity}\n`;
      });
    } else if (activeTab === 'merchandise' && merchandiseData) {
      csvContent += 'TOP SẢN PHẨM BÁN CHẠY NHẤT\n';
      csvContent += 'TÊN SẢN PHẨM,SỐ LƯỢNG ĐÃ BÁN,DOANH THU\n';
      merchandiseData.topProducts.forEach((p) => {
        csvContent += `"${p.productName}",${p.totalQuantitySold},${p.totalRevenue}\n`;
      });
      csvContent += '\nCƠ CẤU DOANH THU THEO DANH MỤC\n';
      csvContent += 'DANH MỤC,SỐ LƯỢNG BÁN,DOANH THU,TỶ TRỌNG (%)\n';
      merchandiseData.categoryBreakdown.forEach((c) => {
        csvContent += `"${c.categoryName}",${c.totalQuantitySold},${c.totalRevenue},${c.percentage}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_Cao_${activeTab}_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file báo cáo CSV thành công');
  };

  const handlePrint = () => {
    window.print();
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
