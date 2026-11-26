'use client';

import React from 'react';
import Link from 'next/link';
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
import { StaffPersonalReportView } from './StaffPersonalReportView';
import { AdminChartDrilldownModal } from './AdminChartDrilldownModal';
import { UserCheck, Warehouse, ArrowRight } from 'lucide-react';

/**
 * 1. VIEW THEO DÕI ĐƠN HÀNG PHỤ TRÁCH DÀNH CHO NHÂN VIÊN BÁN HÀNG (STAFF)
 * Đã ẩn hoàn toàn phần tính hoa hồng / hiệu suất nhân viên.
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
            Bạn đang xem thống kê đơn hàng xác nhận & phụ trách của tài khoản ({user?.name || user?.email}).
          </span>
        </div>
        <span className="font-mono text-[10px] bg-white px-2.5 py-0.5 rounded-full border border-orange-300 font-bold text-orange-700">
          STAFF ORDERS
        </span>
      </div>
      <StaffPersonalReportView
        timeRange={staffReportState.timeRange}
        statusFilter={staffReportState.statusFilter}
        loading={staffReportState.loading}
        performance={staffReportState.performance}
        revenue={staffReportState.revenue}
        myOrders={staffReportState.myOrders}
        ordersPage={staffReportState.ordersPage}
        totalOrders={staffReportState.totalOrders}
        totalPages={staffReportState.totalPages}
        onPresetChange={staffReportState.handlePresetChange}
        onStatusFilterChange={staffReportState.handleStatusFilterChange}
        onPageChange={staffReportState.handlePageChange}
        onRefresh={staffReportState.handleRefresh}
      />
    </div>
  );
}

/**
 * 2. VIEW BÁO CÁO DOANH THU & ĐƠN HÀNG CHUYÊN SÂU DÀNH CHO QUẢN TRỊ VIÊN (ADMIN)
 * Chỉ tập trung duy nhất vào Doanh thu & Đơn hàng (các báo cáo Kho và Sản phẩm đã được tách
 * về đúng các menu dropdown Kho Vận và Bán Hàng & Sản Phẩm), hỗ trợ click biểu đồ mở Modal bảng chi tiết.
 */
function AdminRevenueReportsView() {
  const {
    timeRange,
    startDate,
    endDate,
    loading,
    overviewData,
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
    handleExportCSV,
    handlePrint,
    drilldown,
  } = useAdminReports({ enabled: true });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header */}
      <ReportHeader
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
        loading={loading}
      />

      {/* 2. Thanh Bộ Lọc Kỳ Báo Cáo Doanh Thu */}
      <ReportFilterBar
        timeRange={timeRange}
        onPresetChange={handlePresetChange}
        startDate={startDate}
        endDate={endDate}
        onCustomDateChange={handleCustomDateChange}
      />

      {/* 3. KPI Cards & 4 Biểu Đồ Tương Tác Click Mở Modal Bảng Chi Tiết */}
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
            onSelectPoint={handleSelectRevenuePoint}
          />
          <OrderVolumeBarChart
            data={overviewData?.timeSeries || []}
            loading={loading}
            hoveredPoint={volumeHoveredPoint}
            onHoverPoint={setVolumeHoveredPoint}
            onSelectBar={handleSelectVolumeBar}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <PaymentMethodPieChart
            cashRevenue={overviewData?.cashPaymentRevenue || 0}
            vnpayRevenue={overviewData?.vnpayPaymentRevenue || 0}
            onSelectPaymentMethod={handleSelectPaymentMethod}
          />
          <OrderStatusDistributionChart
            data={overviewData}
            loading={loading}
            onSelectStatusGroup={handleSelectStatusGroup}
          />
        </div>
      </div>

      {/* 4. Modal Bảng Thống Kê Đơn Hàng Chi Tiết Khi Click Vào Bất Kỳ Nút Giao Biểu Đồ Nào */}
      <AdminChartDrilldownModal
        isOpen={drilldown.isOpen}
        loading={drilldown.loading}
        isExporting={drilldown.isExporting}
        activeRequest={drilldown.activeRequest}
        page={drilldown.page}
        totalElements={drilldown.totalElements}
        totalPages={drilldown.totalPages}
        orders={drilldown.orders}
        stocks={drilldown.stocks}
        transactions={drilldown.transactions}
        onPageChange={drilldown.handlePageChange}
        onExportExcel={drilldown.handleExportDrilldownExcel}
        onClose={drilldown.closeDrilldown}
      />
    </div>
  );
}

/**
 * MAIN ENTRY COMPONENT: Định tuyến giao diện báo cáo chuẩn xác theo Role (Strict RBAC),
 * hoàn toàn không chứa useState / useEffect trực tiếp trong Component.
 */
export function AdminReportsUI() {
  const { user, loading } = useAdminAuth();

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
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 p-8 space-y-4">
        <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto border border-orange-100">
          <Warehouse className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Báo Cáo Kho Hàng Đã Chuyển Về Cụm Kho Vận</h2>
          <p className="text-slate-500 text-sm mt-1">
            Mục Báo Cáo Kho Hàng dành cho Thủ kho hiện được bố trí chuyên biệt trong menu <strong>Kho Vận &rarr; Báo Cáo Kho Hàng</strong>.
          </p>
        </div>
        <Link
          href="/admin/inventory/reports"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
        >
          <span>Đi tới Báo Cáo Kho Hàng</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return <AdminRevenueReportsView />;
}
