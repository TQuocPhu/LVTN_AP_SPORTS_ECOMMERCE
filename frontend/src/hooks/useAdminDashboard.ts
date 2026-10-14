'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardController } from '@/controllers/dashboard-controller';
import { AdminDashboardData } from '@/types/dashboard';
import { useAdminAuth } from '@/hooks/useAdminAuth';
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
      toast.error(msg);
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
  };
}
