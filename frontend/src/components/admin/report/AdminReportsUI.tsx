'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdminReports } from '@/hooks/useAdminReports';
import { useStaffReports, STAFF_TIME_PRESETS } from '@/hooks/useStaffReports';
import { reportController } from '@/controllers/report-controller';
import { TimeRangePreset, WarehouseReportResponse } from '@/types/report';
import { ReportHeader } from './ReportHeader';
import { ReportFilterBar } from './ReportFilterBar';
import { ReportKpiCards } from './ReportKpiCards';
import { RevenueTimeSeriesChart } from './RevenueTimeSeriesChart';
import { OrderVolumeBarChart } from './OrderVolumeBarChart';
import { PaymentMethodPieChart } from './PaymentMethodPieChart';
import { OrderStatusDistributionChart } from './OrderStatusDistributionChart';
import { StaffLeaderboardTable } from './StaffLeaderboardTable';
import { TopMerchandiseView } from './TopMerchandiseView';
import { WarehouseStockReportView } from './WarehouseStockReportView';
import { StaffPersonalReportView } from './StaffPersonalReportView';
import { UserCheck, Warehouse, Calendar } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 1. VIEW BÁO CÁO CÁ NHÂN DÀNH CHO NHÂN VIÊN BÁN HÀNG (STAFF)
 * Tách biệt hoàn toàn thành Sub-component riêng biệt:
 * - CHỈ kích hoạt hook useStaffReports (/api/v1/staff/reports/**).
 * - TUYỆT ĐỐI không gọi useAdminReports (/api/v1/admin/reports/**) để triệt tiêu 100% lỗi 403 Access Denied.
 */
function StaffReportsView({ user }: { user: any }) {
  const staffReportState = useStaffReports({ enabled: true });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <ReportHeader
        onRefresh={staffReportState.handleRefresh}
        onExportCSV={staffReportState.handleExportCSV}
        onPrint={staffReportState.handlePrint}
        loading={staffReportState.loading}
      />
      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            Bạn đang xem báo cáo cá nhân với tài khoản Nhân viên bán hàng ({user?.name || user?.email}).
          </span>
        </div>
        <span className="font-mono text-[10px] bg-white px-2.5 py-0.5 rounded-full border border-orange-300 font-bold text-orange-700">
          STAFF VIEW
        </span>
      </div>
      <StaffPersonalReportView
        timeRange={staffReportState.timeRange}
        loading={staffReportState.loading}
        performance={staffReportState.performance}
        revenue={staffReportState.revenue}
        myOrders={staffReportState.myOrders}
        onPresetChange={staffReportState.handlePresetChange}
        onRefresh={staffReportState.handleRefresh}
      />
    </div>
  );
}

/**
 * 2. VIEW BÁO CÁO KHO VẬN DÀNH CHO THỦ KHO (WAREHOUSE_MANAGER)
 * Gọi trực tiếp API được cấp quyền cho thủ kho: /api/v1/warehouse/reports/inventory
 */
function WarehouseReportsView({ user }: { user: any }) {
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('LAST_30_DAYS');
  const [loading, setLoading] = useState<boolean>(true);
  const [warehouseData, setWarehouseData] = useState<WarehouseReportResponse | null>(null);

  const fetchWarehouseData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await reportController.getWarehouseInventory({ timeRange });
      if (res.data) setWarehouseData(res.data);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải báo cáo kho vận');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchWarehouseData();
  }, [fetchWarehouseData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <ReportHeader
        onRefresh={fetchWarehouseData}
        onExportCSV={() => toast.info('Tính năng xuất CSV kho hàng đang được hoàn thiện')}
        onPrint={() => window.print()}
        loading={loading}
      />
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Bạn đang xem báo cáo kho hàng với tài khoản Quản lý kho ({user?.name || user?.email}).
          </span>
        </div>
        <span className="font-mono text-[10px] bg-white px-2.5 py-0.5 rounded-full border border-blue-300 font-bold text-blue-700">
          WAREHOUSE VIEW
        </span>
      </div>

      {/* Bộ lọc thời gian cho Quản lý kho */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-black uppercase text-slate-500">
            Kỳ Báo Cáo Kho Vận:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STAFF_TIME_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setTimeRange(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === p.value
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <WarehouseStockReportView data={warehouseData} loading={loading} />
    </div>
  );
}

/**
 * 3. VIEW BÁO CÁO DOANH NGHIỆP TOÀN DIỆN DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
 */
function AdminFullReportsView({ user }: { user: any }) {
  const adminReportState = useAdminReports({ enabled: true });

  const {
    activeTab,
    timeRange,
    startDate,
    endDate,
    staffId,
    staffList,
    loading,
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
  } = adminReportState;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <ReportHeader
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        loading={loading}
      />

      {/* 2. Global Filter Bar */}
      <ReportFilterBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        timeRange={timeRange}
        onPresetChange={handlePresetChange}
        startDate={startDate}
        endDate={endDate}
        onCustomDateChange={handleCustomDateChange}
        staffId={staffId}
        onStaffChange={handleStaffChange}
        staffList={staffList}
        isAdmin={true}
      />

      {/* 3. Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <ReportKpiCards data={overviewData} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <RevenueTimeSeriesChart
              data={overviewData?.timeSeries || []}
              loading={loading}
              hoveredPoint={revenueHoveredPoint}
              hoverPos={revenueHoverPos}
              onHoverPoint={(pt, pos) => {
                setRevenueHoveredPoint(pt);
                setRevenueHoverPos(pos);
              }}
            />
            <OrderVolumeBarChart
              data={overviewData?.timeSeries || []}
              loading={loading}
              hoveredPoint={volumeHoveredPoint}
              onHoverPoint={setVolumeHoveredPoint}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <PaymentMethodPieChart
              cashRevenue={overviewData?.cashPaymentRevenue || 0}
              vnpayRevenue={overviewData?.vnpayPaymentRevenue || 0}
            />
            <OrderStatusDistributionChart
              data={overviewData}
              loading={loading}
            />
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6">
          <StaffLeaderboardTable
            data={staffPerformance}
            filteredData={filteredStaffPerformance}
            searchTerm={staffSearchTerm}
            onSearchChange={setStaffSearchTerm}
            summaryKpis={staffSummaryKpis}
            loading={loading}
          />
        </div>
      )}

      {activeTab === 'warehouse' && (
        <div className="space-y-6">
          <WarehouseStockReportView data={warehouseData} loading={loading} />
        </div>
      )}

      {activeTab === 'merchandise' && (
        <div className="space-y-6">
          <TopMerchandiseView data={merchandiseData} loading={loading} />
        </div>
      )}
    </div>
  );
}

/**
 * MAIN ENTRY COMPONENT: Định tuyến giao diện báo cáo chuẩn xác theo Role (Strict RBAC)
 */
export function AdminReportsUI() {
  const { user, loading } = useAdminAuth();

  // Tránh tình trạng mount nhầm view Admin khi thông tin phiên đăng nhập còn đang nạp
  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Đang nạp phân quyền báo cáo...</p>
      </div>
    );
  }

  const roleName = user?.roleName?.toUpperCase();

  if (roleName === 'STAFF') {
    return <StaffReportsView user={user} />;
  }

  if (roleName === 'WAREHOUSE_MANAGER') {
    return <WarehouseReportsView user={user} />;
  }

  return <AdminFullReportsView user={user} />;
}
