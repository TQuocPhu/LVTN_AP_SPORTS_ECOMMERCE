'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardController } from '@/controllers/dashboard-controller';
import { AdminDashboardData } from '@/types/dashboard';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useChartDrilldownModal } from '@/hooks/useChartDrilldownModal';
import { toast } from 'sonner';

// =========================================================================
// CÁC HẰNG SỐ CẤU HÌNH MỤC TIÊU DOANH THU & KẾ HOẠCH KPI HỆ THỐNG AP SPORTS
// =========================================================================

/**
 * Mục tiêu doanh thu tháng cơ sở (Baseline Monthly Revenue Target): 250.000.000 VND (250 triệu đồng).
 * CĂN CỨ VÀ LÝ DO LỰA CHỌN:
 * 1. Quy mô kinh doanh bán lẻ thời trang & phụ kiện thể thao AP SPORTS: Giá trị đơn hàng trung bình (AOV)
 *    dao động từ 500.000 đ đến 1.200.000 đ/đơn. Với năng lực tiếp nhận và hoàn tất bình quân 10-15 đơn hàng/ngày
 *    (~350 - 400 đơn/tháng), mức doanh thu kỳ vọng chuẩn của cửa hàng đạt khoảng 200 - 300 triệu đồng.
 * 2. Mức 250 triệu đồng là mục tiêu thách thức vừa phải (SMART KPI Target), tạo động lực thi đua cho đội ngũ
 *    kinh doanh và thủ kho đạt hiệu suất cao mà hoàn toàn khả thi, không bị phi thực tế.
 */
export const DEFAULT_MONTHLY_REVENUE_TARGET = 250_000_000;

/**
 * Giới hạn hiển thị số dòng trên các bảng Widget tại Dashboard: TỐI ĐA 5 DÒNG (Top 5).
 * CĂN CỨ:
 * Dashboard là Bảng Chỉ Huy Nhanh (Executive Overview), chỉ cần hiển thị 5 bản ghi nổi bật nhất để người quản lý
 * nắm bắt tình hình trong 5 giây, tránh làm tải nặng giao diện và phân tán sự chú ý.
 */
export const DASHBOARD_WIDGET_ROW_LIMIT = 5;

export function useAdminDashboard() {
  const { user } = useAdminAuth();
  const drilldown = useChartDrilldownModal();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tab chuyển đổi nhanh giữa các biểu đồ Tầng 2 (Dual-line KPI vs Funnel vs Cohort)
  const [activeChartTab, setActiveChartTab] = useState<'KPI' | 'FUNNEL' | 'COHORT'>('KPI');

  // Xác định vai trò của user
  const roleName = user?.roleName || 'ADMIN';
  const isAdmin = roleName === 'ADMIN';
  const isStaff = roleName === 'STAFF';
  const isWarehouse = roleName === 'WAREHOUSE_MANAGER';

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await dashboardController.getDashboardData();
      if (res.data) {
        setData(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu bảng điều khiển tổng quan';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    loadDashboardData(true);
    toast.success('Đã cập nhật chỉ số thời gian thực mới nhất');
  };

  // =========================================================================
  // CÁC HÀM MỞ MODAL BẢNG CHI TIẾT KHI CLICK VÀO BIỂU ĐỒ TRÊN DASHBOARD
  // =========================================================================

  // 1. Click điểm ngày trên Biểu đồ Đường Tiến độ KPI Tháng
  const handleSelectKpiDay = useCallback(
    (dateIso: string, label?: string) => {
      if (!dateIso) return;
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Đơn Hàng Phát Sinh Doanh Thu — ${label || dateIso}`,
        subtitle: `Các đơn hàng hợp lệ (không tính đơn hủy/hoàn/lỗi thanh toán) được đặt trong ngày ${dateIso}, khớp đúng mức tăng của đường tiến độ KPI`,
        specificDate: dateIso,
        statusGroup: 'VALID',
      });
    },
    [drilldown]
  );

  // 2. Click tầng Phễu Mua Hàng Thực Tế (Bước 2, 3, 4)
  const handleSelectFunnelStep = useCallback(
    (step: number, stepTitle: string) => {
      if (step === 1) {
        drilldown.openDrilldown({
          mode: 'STOCKS',
          title: 'Danh Sách Sản Phẩm & Biến Thể Đang Kinh Doanh',
          subtitle: 'Đối chiếu danh mục biến thể phục vụ chuyển đổi giỏ hàng khách hàng',
          stockFilter: 'ALL',
          useAdminStocksEndpoint: true,
        });
        return;
      }
      const statusGroup =
        step === 2 ? 'PLACED' : step === 3 ? 'SHIPPING_FUNNEL' : 'COMPLETED';
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Bảng Đơn Hàng Phễu Chuyển Đổi — ${stepTitle}`,
        subtitle: 'Danh sách đơn hàng thực tế đang nằm tại bước chuyển đổi này',
        timeRange: 'ALL_TIME',
        statusGroup,
      });
    },
    [drilldown]
  );

  // 3. Click cột Tuần trên Biểu đồ So sánh Doanh thu Theo Tuần (Tuần 1..4 của Tháng bất kỳ)
  const handleSelectWeeklyBar = useCallback(
    (monthKey: string | undefined, weekIndex: number, monthLabel: string, periodName: string) => {
      const fallbackNow = new Date();
      const [yStr, mStr] = (monthKey || `${fallbackNow.getFullYear()}-${String(fallbackNow.getMonth() + 1).padStart(2, '0')}`).split('-');
      const year = Number(yStr) || fallbackNow.getFullYear();
      const month = Number(mStr) || fallbackNow.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();

      const startDay = weekIndex === 0 ? 1 : weekIndex === 1 ? 8 : weekIndex === 2 ? 15 : 22;
      const endDay = weekIndex === 0 ? 7 : weekIndex === 1 ? 14 : weekIndex === 2 ? 21 : lastDay;

      const pad = (n: number) => String(n).padStart(2, '0');
      const startIso = `${year}-${pad(month)}-${pad(Math.min(startDay, lastDay))}`;
      const endIso = `${year}-${pad(month)}-${pad(Math.min(endDay, lastDay))}`;

      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Bảng Đơn Hàng Doanh Thu — ${periodName} (${monthLabel})`,
        subtitle: `Chi tiết đơn hàng hoàn tất từ ${pad(startDay)}/${pad(month)}/${year} đến ${pad(endDay)}/${pad(month)}/${year}`,
        timeRange: 'CUSTOM',
        startDate: startIso,
        endDate: endIso,
        statusGroup: 'COMPLETED',
      });
    },
    [drilldown]
  );

  // 4. Click lát cắt hoặc thẻ Danh mục trên Biểu đồ Tròn Cơ cấu Danh mục Sản phẩm
  const handleSelectCategorySlice = useCallback(
    (categoryId: number, categoryName: string) => {
      drilldown.openDrilldown({
        mode: 'STOCKS',
        title: `Bảng Sản Phẩm & Biến Thể Thuộc Danh Mục — ${categoryName}`,
        subtitle: 'Danh sách chi tiết mã SKU, phân loại biến thể, giá bán và tồn kho hiện tại',
        stockFilter: 'ALL',
        categoryId,
        useAdminStocksEndpoint: true,
      });
    },
    [drilldown]
  );

  // 5. Click cột Nhập / Xuất kho 7 ngày (Role WAREHOUSE_MANAGER)
  const handleSelectWarehouseDayBar = useCallback(
    (rawDateLabel: string, txFilter: 'IMPORT' | 'EXPORT') => {
      let specificDate: string | undefined;
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDateLabel)) {
        specificDate = rawDateLabel;
      } else if (/^\d{1,2}\/\d{1,2}$/.test(rawDateLabel)) {
        const [d, m] = rawDateLabel.split('/');
        const year = new Date().getFullYear();
        specificDate = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      drilldown.openDrilldown({
        mode: 'TRANSACTIONS',
        title: `Bảng Phiếu ${txFilter === 'IMPORT' ? 'Nhập Kho' : 'Xuất Kho'} — Ngày ${rawDateLabel}`,
        subtitle: 'Chi tiết mặt hàng biến thể, số lượng và người thực hiện giao dịch kho',
        txFilter,
        specificDate,
        timeRange: specificDate ? undefined : 'LAST_7_DAYS',
      });
    },
    [drilldown]
  );

  // 6. Click lát cắt Trạng thái Đơn phụ trách (Role STAFF)
  const handleSelectStaffStatusSlice = useCallback(
    (statusName: string) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Đơn Hàng Phụ Trách — Trạng Thái: ${statusName}`,
        subtitle: 'Danh sách các đơn hàng do chính tài khoản của bạn xác nhận và quản lý',
        timeRange: 'ALL_TIME',
        statusGroup: statusName,
      });
    },
    [drilldown]
  );

  // 7. Click mặt hàng trên Biểu đồ Top 10 Bóng Đá
  const handleSelectFootballProduct = useCallback(
    (productId: number, productName: string) => {
      drilldown.openDrilldown({
        mode: 'ORDERS',
        title: `Bảng Đơn Hàng Đã Mua — ${productName}`,
        subtitle: 'Danh sách khách hàng, biến thể kích thước/màu sắc và số lượng đã tiêu thụ',
        timeRange: 'ALL_TIME',
        statusGroup: 'COMPLETED',
        productId,
      });
    },
    [drilldown]
  );

  return {
    user,
    roleName,
    isAdmin,
    isStaff,
    isWarehouse,
    data,
    loading,
    refreshing,
    error,
    activeChartTab,
    setActiveChartTab,
    handleRefresh,
    handleSelectKpiDay,
    handleSelectFunnelStep,
    handleSelectWeeklyBar,
    handleSelectCategorySlice,
    handleSelectWarehouseDayBar,
    handleSelectStaffStatusSlice,
    handleSelectFootballProduct,
    drilldown,
  };
}
