'use client';

import React from 'react';
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  CreditCard,
  Edit3,
  PackageCheck,
  Building,
  ShoppingBag,
  Banknote,
  AlertCircle,
  RefreshCw,
  CircleCheck,
} from 'lucide-react';
import { AdminOrderDetail } from '@/types/admin-order';

interface AdminOrderTableProps {
  orders: AdminOrderDetail[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onOpenDetail: (id: number) => void;
  onConfirmOrder: (id: number) => void;
  onOpenUpdateStatus: (order: AdminOrderDetail) => void;
  onOpenCancel: (order: AdminOrderDetail) => void;
}

export function AdminOrderTable({
  orders,
  loading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onOpenDetail,
  onConfirmOrder,
  onOpenUpdateStatus,
  onOpenCancel,
}: AdminOrderTableProps) {
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ── Trạng thái ĐƠN HÀNG ──────────────────────────────────────────────────────
  const renderOrderStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ xác nhận</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Đã xác nhận</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Đang đóng gói</span>
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-700 border border-cyan-200">
            <Truck className="w-3.5 h-3.5" />
            <span>Đang vận chuyển</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CircleCheck className="w-3.5 h-3.5" />
            <span>Đã hoàn thành</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã hủy</span>
          </span>
        );
      case 'payment_failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>TT thất bại</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status || '---'}
          </span>
        );
    }
  };

  // ── Phương thức & Trạng thái THANH TOÁN (hoàn toàn độc lập với trạng thái đơn) ─
  const renderPaymentColumn = (method?: string, payStatus?: string) => {
    const methodLabel = method?.toUpperCase() === 'VNPAY' ? 'VNPay' : 'COD';
    const isVnPay = method?.toUpperCase() === 'VNPAY';

    let statusBadge: React.ReactNode;
    switch (payStatus?.toLowerCase()) {
      case 'completed':
        statusBadge = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Đã thanh toán
          </span>
        );
        break;
      case 'refunded':
        statusBadge = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 border border-cyan-200">
            <RefreshCw className="w-3 h-3" />
            Đã hoàn tiền
          </span>
        );
        break;
      case 'failed':
        statusBadge = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Thất bại
          </span>
        );
        break;
      case 'pending':
      default:
        statusBadge = (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ thanh toán
          </span>
        );
    }

    return (
      <div className="flex flex-col gap-1.5">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
          {isVnPay
            ? <CreditCard className="w-3.5 h-3.5 text-blue-500" />
            : <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          }
          {methodLabel}
        </span>
        {statusBadge}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Mã Đơn & Ngày Đặt</th>
              <th className="px-4 py-3.5">Khách Hàng</th>
              <th className="px-4 py-3.5">Tổng Tiền</th>
              {/* Cột Trạng thái ĐƠN HÀNG và THANH TOÁN rõ ràng, tách biệt */}
              <th className="px-4 py-3.5">Trạng Thái Đơn</th>
              <th className="px-4 py-3.5">Thanh Toán</th>
              <th className="px-4 py-3.5">Mã Vận Đơn (GHN)</th>
              <th className="px-4 py-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-28 mb-1" /><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32 mb-1" /><div className="h-3 bg-slate-200 rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-4 py-4"><div className="h-6 bg-slate-200 rounded-full w-28" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20 mb-1" /><div className="h-5 bg-slate-200 rounded-full w-24" /></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                  <td className="px-4 py-4 text-right"><div className="h-6 bg-slate-200 rounded w-20 ml-auto" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50 text-slate-400" />
                  <p className="text-base font-medium text-slate-600">Không tìm thấy đơn hàng nào phù hợp.</p>
                  <p className="text-xs mt-1">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm phía trên.</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isPending = order.status?.toLowerCase() === 'pending';
                const isDelivered = order.status?.toLowerCase() === 'delivered';
                const isCancelled = order.status?.toLowerCase() === 'cancelled';

                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Mã Đơn & Ngày */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 font-mono text-xs">
                        #{order.orderCode}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    {/* Khách Hàng */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{order.customerName || 'Khách hàng'}</div>
                      <div className="text-xs text-slate-500">{order.customerPhone}</div>
                    </td>

                    {/* Tổng Tiền */}
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">
                      {formatCurrency(order.finalAmount)}
                    </td>

                    {/* Trạng Thái ĐƠN HÀNG - Cột riêng */}
                    <td className="px-4 py-3.5">
                      {renderOrderStatusBadge(order.status)}
                    </td>

                    {/* Trạng Thái THANH TOÁN - Cột riêng, hoàn toàn độc lập */}
                    <td className="px-4 py-3.5">
                      {renderPaymentColumn(order.paymentMethod, order.paymentStatus)}
                    </td>

                    {/* Mã Vận Đơn GHN */}
                    <td className="px-4 py-3.5 text-xs">
                      {order.trackingCode ? (
                        <div className="font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-1 rounded inline-block">
                          {order.trackingCode}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa tạo vận đơn</span>
                      )}
                    </td>

                    {/* Thao Tác */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(order.id)}
                          title="Xem chi tiết đơn hàng"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isPending && (
                          <button
                            type="button"
                            onClick={() => onConfirmOrder(order.id)}
                            title="Xác nhận đơn hàng (chỉ đổi trạng thái đơn, không đổi thanh toán)"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {!isCancelled && !isDelivered && (
                          <button
                            type="button"
                            onClick={() => onOpenUpdateStatus(order)}
                            title="Cập nhật trạng thái đơn hàng"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {!isCancelled && !isDelivered && (
                          <button
                            type="button"
                            onClick={() => onOpenCancel(order)}
                            title="Hủy đơn hàng"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Integrated Pagination Footer */}
      {!loading && totalElements > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs sm:text-sm">
          <div className="text-slate-500">
            Hiển thị{' '}
            <span className="font-semibold text-slate-700">{currentPage * pageSize + 1}</span> -{' '}
            <span className="font-semibold text-slate-700">
              {Math.min((currentPage + 1) * pageSize, totalElements)}
            </span>{' '}
            trong tổng số{' '}
            <span className="font-semibold text-slate-700">{totalElements}</span> đơn hàng
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 0}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-3 py-1.5 font-medium text-slate-700">
              {currentPage + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
