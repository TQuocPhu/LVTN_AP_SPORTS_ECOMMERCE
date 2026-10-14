'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdminReports } from '@/hooks/useAdminReports';
import { useStaffReports } from '@/hooks/useStaffReports';
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
import { UserCheck } from 'lucide-react';

export function AdminReportsUI() {
  const { user } = useAdminAuth();
  const isAdmin = user?.roleName === 'ADMIN';
  const isStaff = user?.roleName === 'STAFF';
  const isWarehouse = user?.roleName === 'WAREHOUSE_MANAGER';

  const adminReportState = useAdminReports();
  const staffReportState = useStaffReports();

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

  // If logged in as STAFF: render StaffPersonalReportView with hook props
  if (isStaff) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <ReportHeader
          onRefresh={staffReportState.handleRefresh}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
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

  // If logged in as WAREHOUSE_MANAGER: render WarehouseStockReportView
  if (isWarehouse) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <ReportHeader
          onRefresh={handleRefresh}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
          loading={loading}
        />
        <ReportFilterBar
          activeTab="warehouse"
          onTabChange={handleTabChange}
          timeRange={timeRange}
          onPresetChange={handlePresetChange}
          startDate={startDate}
          endDate={endDate}
          onCustomDateChange={handleCustomDateChange}
          staffId={staffId}
          onStaffChange={handleStaffChange}
          staffList={staffList}
          isAdmin={false}
        />
        <WarehouseStockReportView data={warehouseData} loading={loading} />
      </div>
    );
  }

  // Default: ADMIN view (Full enterprise control & tabs)
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
        isAdmin={isAdmin}
      />

      {/* 3. Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <ReportKpiCards data={overviewData} loading={loading} />

          {/* Row 1: Symmetrical Charts (Revenue Curve vs Order Volume Bars) */}
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

          {/* Row 2: Symmetrical Charts (Payment Methods vs Order Statuses) */}
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
