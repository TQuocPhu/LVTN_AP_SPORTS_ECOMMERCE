'use client';

import React from 'react';
import { Warehouse, Calendar, RefreshCw, ShieldAlert } from 'lucide-react';
import { useWarehouseReportsPage } from '@/hooks/useWarehouseReportsPage';
import { TIME_RANGE_OPTIONS } from '@/hooks/useAdminReports';
import { VietnameseDateInput } from '@/components/common/VietnameseDateInput';
import { WarehouseStockReportView } from '@/components/admin/report/WarehouseStockReportView';
import { AdminChartDrilldownModal } from '@/components/admin/report/AdminChartDrilldownModal';

/**
 * Giao diện Báo Cáo Kho Hàng chuyên biệt (/admin/inventory/reports) thuộc cụm Kho Vận.
 * Giao diện sáng cố định chuẩn Admin, không dùng useState/useEffect trực tiếp trong Component.
 */
export function WarehouseReportsContentUI() {
  const {
    user,
    authLoading,
    hasAccess,
    timeRange,
    startDate,
    endDate,
    loading,
    warehouseData,
    handlePresetChange,
    handleCustomDateChange,
    handleRefresh,
    handleSelectStockStatus,
    handleSelectTransactionFlow,
    drilldown,
  } = useWarehouseReportsPage();

  if (authLoading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Đang kiểm tra phân quyền báo cáo kho...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 p-8 space-y-4">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Quyền Truy Cập Bị Từ Chối</h2>
          <p className="text-slate-500 text-sm mt-1">
            Trang Báo Cáo Kho Hàng chỉ dành cho Quản trị viên (ADMIN) và Quản lý kho (WAREHOUSE_MANAGER).
            Tài khoản vai trò <span className="font-bold text-slate-800">{user?.roleName}</span> không có quyền xem mục này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Trang Báo Cáo Kho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-xl">
              <Warehouse className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Báo Cáo Tồn Kho & Luân Chuyển Hàng Hóa
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích giá trị vốn tồn kho, cảnh báo SKU chạm ngưỡng báo động và cân đối nhập xuất theo kỳ (Nhấp vào biểu đồ để xem bảng chi tiết).
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          <span>Làm mới số liệu</span>
        </button>
      </div>

      {/* Thanh Bộ Lọc Kỳ Báo Cáo Kho */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            Kỳ Báo Cáo:
          </span>
          {TIME_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handlePresetChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                timeRange === opt.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {timeRange === 'CUSTOM' && (
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-400 font-medium">Từ:</span>
            <VietnameseDateInput
              value={startDate}
              onChange={(val) => handleCustomDateChange(val, endDate)}
              themeVariant="admin"
              sizeVariant="bare"
            />
            <span className="text-slate-400 font-medium">Đến:</span>
            <VietnameseDateInput
              value={endDate}
              min={startDate || undefined}
              onChange={(val) => handleCustomDateChange(startDate, val)}
              themeVariant="admin"
              sizeVariant="bare"
            />
          </div>
        )}
      </div>

      {/* Nội dung biểu đồ & bảng cảnh báo kho */}
      <WarehouseStockReportView
        data={warehouseData}
        loading={loading}
        onSelectStockStatus={handleSelectStockStatus}
        onSelectTransactionFlow={handleSelectTransactionFlow}
      />

      {/* Modal Bảng Chi Tiết Khi Click Vào Biểu Đồ Kho */}
      <AdminChartDrilldownModal
        isOpen={drilldown.isOpen}
        loading={drilldown.loading}
        activeRequest={drilldown.activeRequest}
        page={drilldown.page}
        totalElements={drilldown.totalElements}
        totalPages={drilldown.totalPages}
        orders={drilldown.orders}
        stocks={drilldown.stocks}
        transactions={drilldown.transactions}
        onPageChange={drilldown.handlePageChange}
        onClose={drilldown.closeDrilldown}
      />
    </div>
  );
}
