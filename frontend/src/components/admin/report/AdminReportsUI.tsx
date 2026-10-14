'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdminReports } from '@/hooks/useAdminReports';
import { ReportHeader } from './ReportHeader';
import { ReportFilterBar } from './ReportFilterBar';
import { ReportKpiCards } from './ReportKpiCards';
import { RevenueTimeSeriesChart } from './RevenueTimeSeriesChart';
import { PaymentMethodPieChart } from './PaymentMethodPieChart';
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
    merchandiseData,
    warehouseData,
    handleTabChange,
    handlePresetChange,
    handleCustomDateChange,
    handleStaffChange,
    handleRefresh,
    handleExportCSV,
    handlePrint,
  } = useAdminReports();

  // If logged in as STAFF: render StaffPersonalReportView directly with header
  if (isStaff) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <ReportHeader
          onRefresh={handleRefresh}
          onExportCSV={handleExportCSV}
          onPrint={handlePrint}
          loading={loading}
        />
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-800 dark:text-orange-300 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              Bạn đang xem báo cáo cá nhân với tài khoản Nhân viên bán hàng ({user?.name || user?.email}).
            </span>
          </div>
          <span className="font-mono text-[10px] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-orange-300 dark:border-orange-700/50">
            STAFF VIEW
          </span>
        </div>
        <StaffPersonalReportView />
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
          <ReportKpiCards data={overviewData} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <RevenueTimeSeriesChart
                data={overviewData?.timeSeries || []}
                loading={loading}
              />
            </div>
            <div className="lg:col-span-4">
              <PaymentMethodPieChart
                cashRevenue={overviewData?.cashPaymentRevenue || 0}
                vnpayRevenue={overviewData?.vnpayPaymentRevenue || 0}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6">
          <StaffLeaderboardTable data={staffPerformance} loading={loading} />
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
