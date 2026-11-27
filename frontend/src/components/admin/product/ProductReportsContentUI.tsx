'use client';

import React from 'react';
import { Package, Calendar, RefreshCw, ShieldAlert } from 'lucide-react';
import { useProductReportsPage } from '@/hooks/useProductReportsPage';
import { TIME_RANGE_OPTIONS } from '@/hooks/useAdminReports';
import { VietnameseDateInput } from '@/components/common/VietnameseDateInput';
import { TopMerchandiseView } from '@/components/admin/report/TopMerchandiseView';
import { AdminChartDrilldownModal } from '@/components/admin/report/AdminChartDrilldownModal';
import { AdminExportExcelButton } from '@/components/admin/common/AdminExportExcelButton';

/**
 * Giao diện Thống Kê Sản Phẩm & Danh Mục (/admin/products/reports) thuộc cụm Bán Hàng & Sản Phẩm.
 * Giao diện sáng cố định chuẩn Admin, không dùng useState/useEffect trực tiếp trong Component.
 */
export function ProductReportsContentUI() {
  const {
    user,
    authLoading,
    hasAccess,
    timeRange,
    startDate,
    endDate,
    loading,
    isExporting,
    merchandiseData,
    handlePresetChange,
    handleCustomDateChange,
    handleRefresh,
    handleExportExcel,
    handleSelectProduct,
    handleSelectCategory,
    drilldown,
  } = useProductReportsPage();

  if (authLoading) {
    return (
      <div className="py-24 text-center text-slate-400 space-y-3">
        <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Đang kiểm tra phân quyền thống kê sản phẩm...</p>
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
            Trang Thống Kê Sản Phẩm chỉ dành cho Quản trị viên (ADMIN) và Nhân viên bán hàng (STAFF).
            Tài khoản vai trò <span className="font-bold text-slate-800">{user?.roleName}</span> không có quyền xem mục này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Trang Thống Kê Sản Phẩm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Thống Kê Sản Phẩm Bán Chạy & Tỷ Trọng Ngành Hàng
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi sức tiêu thụ từng mặt hàng thể thao và cơ cấu doanh thu theo danh mục (Nhấp vào sản phẩm hoặc thanh danh mục để xem bảng đơn hàng chi tiết).
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <AdminExportExcelButton
            onClick={handleExportExcel}
            isExporting={isExporting}
            disabled={loading || !merchandiseData}
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            <span>Làm mới số liệu</span>
          </button>
        </div>
      </div>

      {/* Thanh Bộ Lọc Kỳ Thống Kê */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-orange-500" />
            Kỳ Thống Kê:
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

      {/* Nội dung biểu đồ & bảng Top Sản Phẩm */}
      <TopMerchandiseView
        data={merchandiseData}
        loading={loading}
        onSelectProduct={handleSelectProduct}
        onSelectCategory={handleSelectCategory}
      />

      {/* Modal Bảng Chi Tiết Đơn Hàng Khi Click Vào Sản Phẩm Hoặc Danh Mục */}
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
