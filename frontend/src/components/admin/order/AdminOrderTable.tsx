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
  ShieldCheck,
  RotateCcw,
  Lock,
  UserCheck,
} from 'lucide-react';
import { AdminOrderDetail } from '@/types/admin-order';
import { ADMIN_ORDER_STATUS_MAP, getAdminPaymentStatusMeta } from '@/constants/admin-order-status';

interface AdminOrderTableProps {
  orders: AdminOrderDetail[];
  loading: boolean;
  currentUserId?: number;
  currentUserRole?: string;
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
  currentUserId,
  currentUserRole,
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

  // ── Trạng thái ĐƠN HÀNG (đầy đủ 10 trạng thái khớp OrderStatus.java) ──────────
  const renderOrderStatusBadge = (status?: string) => {
    const key = status?.toLowerCase() || '';
    const meta = ADMIN_ORDER_STATUS_MAP[key];

    const iconMap: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3.5 h-3.5" />,
      confirmed: <CheckCircle className="w-3.5 h-3.5" />,
      processing: <PackageCheck className="w-3.5 h-3.5" />,
      shipped: <Building className="w-3.5 h-3.5" />,
      shipping: <Truck className="w-3.5 h-3.5" />,
      delivered: <CircleCheck className="w-3.5 h-3.5" />,
      completed: <ShieldCheck className="w-3.5 h-3.5" />,
      cancelled: <XCircle className="w-3.5 h-3.5" />,
      returned: <RotateCcw className="w-3.5 h-3.5" />,
      payment_failed: <AlertCircle className="w-3.5 h-3.5" />,
    };

    if (!meta) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {status || '---'}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClass}`}
      >
        {iconMap[key]}
        <span>{meta.label}</span>
      </span>
    );
  };

  // ── Phương thức & Trạng thái THANH TOÁN (hoàn toàn độc lập với trạng thái đơn) ─
  const renderPaymentColumn = (method?: string, payStatus?: string) => {
    const methodLabel = method?.toUpperCase() === 'VNPAY' ? 'VNPay' : 'COD';
    const isVnPay = method?.toUpperCase() === 'VNPAY';
    const payMeta = getAdminPaymentStatusMeta(payStatus);

    const statusBadge = (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${payMeta.badgeClass}`}>
        {payMeta.value === 'refunded' ? (
          <RefreshCw className="w-3 h-3" />
        ) : payMeta.value === 'failed' ? (
          <XCircle className="w-3 h-3" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${payMeta.dotClass || 'bg-current'}`} />
        )}
        {payMeta.label}
      </span>
    );

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
                const statusLower = order.status?.toLowerCase() || '';
                const isPending = statusLower === 'pending';
                const isDelivered = statusLower === 'delivered';
                const isCancelled = statusLower === 'cancelled';
                const isTerminal =
                  isCancelled ||
                  isDelivered ||
                  statusLower === 'completed' ||
                  statusLower === 'returned';
                const isPaymentFailed = statusLower === 'payment_failed';
                const isUnpaidVnPay =
                  order.paymentMethod?.toUpperCase() === 'VNPAY' &&
                  order.paymentStatus?.toLowerCase() !== 'completed';
                const assignedStaffId = order.processedByStaff?.id;
                const assignedStaffName =
                  order.processedByStaff?.name || order.processedByStaff?.email;
                const isLockedByOtherStaff =
                  currentUserRole?.toUpperCase() === 'STAFF' &&
                  assignedStaffId !== undefined &&
                  assignedStaffId !== null &&
                  assignedStaffId !== currentUserId;

                return (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Mã Đơn & Ngày + Nhân viên xác nhận */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 font-mono text-xs">
                        #{order.orderCode}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(order.createdAt)}
                      </div>
                      {assignedStaffName && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            <UserCheck className="w-3 h-3 text-sky-600" />
                            <span>NV: {assignedStaffName}</span>
                          </span>
                        </div>
                      )}
                      {order.packVerified && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                            <PackageCheck className="w-3 h-3 text-indigo-600" />
                            <span>Đã đóng gói</span>
                          </span>
                        </div>
                      )}
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
                            disabled={isUnpaidVnPay}
                            onClick={() => !isUnpaidVnPay && onConfirmOrder(order.id)}
                            title={
                              isUnpaidVnPay
                                ? 'Đơn VNPay chưa hoàn tất thanh toán, chưa thể duyệt đơn'
                                : 'Xác nhận đơn hàng (chỉ đổi trạng thái đơn, không đổi thanh toán)'
                            }
                            className={`p-1.5 rounded-lg transition-all ${
                              isUnpaidVnPay
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-emerald-600 hover:bg-emerald-50 cursor-pointer'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {isLockedByOtherStaff ? (
                          <span
                            title={`Đơn hàng đã do nhân viên [${assignedStaffName}] xác nhận và phụ trách. Bạn không thể đổi trạng thái hoặc hủy đơn của nhân viên khác.`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Khác NV duyệt</span>
                          </span>
                        ) : (
                          <>
                            {!isTerminal && !isPaymentFailed && !(isPending && isUnpaidVnPay) && (
                              <button
                                type="button"
                                onClick={() => onOpenUpdateStatus(order)}
                                title="Cập nhật trạng thái đơn hàng"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {!isTerminal && (
                              <button
                                type="button"
                                onClick={() => onOpenCancel(order)}
                                title="Hủy đơn hàng"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
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
