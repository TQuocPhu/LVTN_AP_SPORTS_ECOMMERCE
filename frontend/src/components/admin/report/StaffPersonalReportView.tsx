'use client';

import React from 'react';
import { STAFF_TIME_PRESETS, StaffOrderStatusFilter } from '@/hooks/useStaffReports';
import { formatCurrency } from '@/utils/formatters';
import {
  CircleCheck,
  TrendingUp,
  ShoppingBag,
  Calendar,
  RefreshCw,
  Clock,
  ArrowRight,
  Truck,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  StaffPerformanceReportResponse,
  RevenueOverviewReportResponse,
  TimeRangePreset,
} from '@/types/report';
import { AdminOrderDetail } from '@/types/admin-order';
import { ADMIN_ORDER_STATUS_MAP, getAdminPaymentStatusMeta } from '@/constants/admin-order-status';

interface StaffPersonalReportViewProps {
  timeRange: TimeRangePreset;
  statusFilter: StaffOrderStatusFilter;
  loading: boolean;
  performance: StaffPerformanceReportResponse | null;
  revenue: RevenueOverviewReportResponse | null;
  myOrders: AdminOrderDetail[];
  ordersPage: number;
  totalOrders: number;
  totalPages: number;
  onPresetChange: (preset: TimeRangePreset) => void;
  onStatusFilterChange: (status: StaffOrderStatusFilter) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const STATUS_FILTER_TABS: { key: StaffOrderStatusFilter; label: string }[] = [
  { key: 'ALL', label: 'Tất cả đơn phụ trách' },
  { key: 'DELIVERING', label: 'Đang xử lý & Đang giao' },
  { key: 'COMPLETED', label: 'Đã giao thành công' },
  { key: 'CANCELLED', label: 'Đã hủy / Hoàn trả' },
];

/**
 * Giao diện Thống Kê Đơn Hàng Phụ Trách của Nhân viên bán hàng (STAFF).
 * Đã ẩn toàn bộ mục Hoa hồng & Xếp hạng Hiệu suất theo đúng phạm vi nghiệp vụ,
 * chỉ tập trung hiển thị các đơn nhân viên xác nhận, quản lý và các đơn giao thành công.
 */
export function StaffPersonalReportView({
  timeRange,
  statusFilter,
  loading,
  performance,
  myOrders,
  ordersPage,
  totalOrders,
  totalPages,
  onPresetChange,
  onStatusFilterChange,
  onPageChange,
  onRefresh,
}: StaffPersonalReportViewProps) {
  const deliveredRevenue = performance?.deliveredRevenue || 0;
  const completedOrders = performance?.completedOrders || 0;
  const deliveringOrders = performance?.deliveringOrders || 0;
  const cancelledOrders = performance?.cancelledOrders || 0;
  const totalHandled = performance?.totalHandledOrders || 0;

  const formatDateTimeVi = (iso?: string) => {
    if (!iso) return '---';
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Thanh chọn Kỳ Thống Kê Cá Nhân */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-black uppercase text-slate-500">
            Kỳ Theo Dõi Đơn Hàng:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STAFF_TIME_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => onPresetChange(p.value)}
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

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          <span>Cập nhật</span>
        </button>
      </div>

      {/* 2. 4 Thẻ Thống Kê Quản Lý Đơn Hàng (Không hiển thị Hoa hồng / Hiệu suất) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tổng Đơn Đã Xác Nhận
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalHandled} <span className="text-xs font-medium text-slate-500">đơn</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Đơn hàng do bạn xác nhận & quản lý trong kỳ
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Đang Đóng Gói / Vận Chuyển
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {deliveringOrders} <span className="text-xs font-medium text-slate-500">đơn</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Đang lưu chuyển qua kho & bưu cục GHN
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Đơn Giao Thành Công
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CircleCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {completedOrders} <span className="text-xs font-medium text-slate-500">đơn</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Đơn đã hủy / hoàn trả: <strong className="text-rose-500">{cancelledOrders} đơn</strong>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Giá Trị Đơn Giao Thành Công
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(deliveredRevenue)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tổng giá trị các đơn hoàn tất bạn phụ trách
          </p>
        </div>
      </div>

      {/* 3. Bảng Danh Sách Đơn Hàng Nhân Viên Xác Nhận & Phụ Trách */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              Danh Sách Đơn Hàng Bạn Xác Nhận & Quản Lý ({totalOrders} đơn)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chỉ hiển thị các đơn hàng do chính tài khoản của bạn duyệt xác nhận và theo dõi trạng thái
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusFilterChange(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.key
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline ml-2"
            >
              <span>Quản lý đơn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Sản Phẩm Mua</th>
                <th className="py-3 px-4 text-right">Giá Trị Đơn</th>
                <th className="py-3 px-4 text-center">Trạng Thái Đơn</th>
                <th className="py-3 px-4 text-center">Thanh Toán</th>
                <th className="py-3 px-4 text-right">Ngày Đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>Không có đơn hàng phụ trách nào khớp bộ lọc hiện tại</span>
                  </td>
                </tr>
              ) : (
                myOrders.map((order) => {
                  const statusMeta = ADMIN_ORDER_STATUS_MAP[order.status?.toLowerCase() || ''];
                  const payMeta = getAdminPaymentStatusMeta(order.paymentStatus);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        #{order.orderCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {order.customerName || 'Khách hàng'}
                        </div>
                        {order.customerPhone && (
                          <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="text-slate-700 font-medium truncate">
                          {order.items && order.items.length > 0
                            ? `${order.items[0].productName}${
                                order.items.length > 1 ? ` (+${order.items.length - 1} SP khác)` : ''
                              }`
                            : '---'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        {formatCurrency(order.finalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusMeta?.badgeClass ||
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {statusMeta?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-bold text-slate-700 text-[11px]">
                          {order.paymentMethod?.toUpperCase() === 'VNPAY' ? 'VNPay' : 'COD'}
                        </div>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5 ${payMeta.badgeClass}`}
                        >
                          {payMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 whitespace-nowrap">
                        {formatDateTimeVi(order.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang danh sách đơn hàng phụ trách */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Trang <strong>{ordersPage + 1}</strong> / <strong>{totalPages}</strong> ({totalOrders} đơn)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={ordersPage <= 0}
                onClick={() => onPageChange(ordersPage - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
              <button
                type="button"
                disabled={ordersPage >= totalPages - 1}
                onClick={() => onPageChange(ordersPage + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
