'use client';

import React from 'react';
import {
  X,
  Tag,
  Truck,
  Percent as PercentIcon,
  Calendar,
  ShoppingBag,
  Users,
  Edit3,
  CheckCircle2,
  Clock,
  Ban,
  Receipt,
} from 'lucide-react';
import { AdminVoucherDetail, Voucher } from '@/types/voucher';
import { ADMIN_ORDER_STATUS_MAP } from '@/constants/admin-order-status';

interface VoucherDetailModalProps {
  isOpen: boolean;
  viewingVoucher: Voucher | null;
  voucherDetail: AdminVoucherDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onEdit: (voucher: Voucher) => void;
}

/**
 * Component VoucherDetailModal: Modal Xem chi tiết cấu hình, tiến trình phát hành
 * và danh sách đơn hàng thực tế đã áp dụng Mã Giảm Giá (Giao diện sáng cố định chuẩn Admin).
 * Tuân thủ nghiêm ngặt kiến trúc 7 tầng: không chứa useState / useEffect trực tiếp.
 */
export const VoucherDetailModal: React.FC<VoucherDetailModalProps> = ({
  isOpen,
  viewingVoucher,
  voucherDetail,
  isLoading,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !viewingVoucher) return null;

  const v = voucherDetail?.voucher || viewingVoucher;
  const active = v.isActive ?? v.active ?? v.status !== 'disabled';

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDateVi = (dateStr?: string | null) => {
    if (!dateStr) return 'Không giới hạn (Vĩnh viễn)';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStatusPill = () => {
    if (!active || v.status === 'disabled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <Ban className="w-3.5 h-3.5 text-slate-500" />
          Tạm dừng
        </span>
      );
    }
    if (v.status === 'scheduled') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Sắp diễn ra
        </span>
      );
    }
    if (v.status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
          <Ban className="w-3.5 h-3.5 text-rose-600" />
          {v.displayStatus || 'Hết hạn / Hết lượt'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Đang diễn ra
      </span>
    );
  };

  const discountHeadline =
    v.type === 'PERCENT'
      ? `Giảm ${v.value}%${v.maxDiscountAmount ? ` (Tối đa ${formatCurrency(v.maxDiscountAmount)})` : ''}`
      : v.type === 'FREESHIP'
      ? `Miễn phí vận chuyển tối đa ${formatCurrency(v.value)}`
      : `Giảm trực tiếp ${formatCurrency(v.value)}`;

  const recentOrders = voucherDetail?.recentAppliedOrders || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
              {v.type === 'FREESHIP' ? (
                <Truck className="w-6 h-6" />
              ) : v.type === 'PERCENT' ? (
                <PercentIcon className="w-6 h-6" />
              ) : (
                <Tag className="w-6 h-6" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-black text-lg sm:text-xl text-slate-900">
                  Chi Tiết Mã Giảm Giá
                </h3>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-mono text-xs font-black rounded-lg border border-amber-300">
                  {v.code}
                </span>
                {renderStatusPill()}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{v.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Nội dung chi tiết */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* 1. Thẻ Ticket tổng quan chương trình */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-slate-50 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                {v.type === 'FREESHIP'
                  ? 'Voucher Hỗ Trợ Phí Vận Chuyển'
                  : v.type === 'PERCENT'
                  ? 'Voucher Chiết Khấu Theo Phần Trăm'
                  : 'Voucher Giảm Tiền Trực Tiếp'}
              </span>
              <div className="text-xl font-black text-slate-900">{discountHeadline}</div>
              <p className="text-xs text-slate-600">
                Đơn hàng tối thiểu: <strong className="text-slate-900">{formatCurrency(v.minOrderValue || 0)}</strong> •{' '}
                Phạm vi:{' '}
                <strong className="text-slate-900">
                  {v.type === 'FREESHIP' || v.categoryScope === 'FREESHIP'
                    ? 'Áp dụng Phí Vận Chuyển'
                    : 'Áp dụng Toàn Bộ Sản Phẩm'}
                </strong>
              </p>
              {v.description && (
                <p className="text-xs text-slate-500 pt-1 italic">“{v.description}”</p>
              )}
            </div>

            {/* Tiến trình lượt phát hành */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 min-w-[230px] space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Đã dùng / Tổng phát hành</span>
                <span className="text-amber-700">
                  {v.usedCount} / {v.usageLimit ? v.usageLimit : '∞'}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-600 transition-all"
                  style={{ width: `${Math.min(100, v.usagePercentage || 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Tỷ lệ sử dụng: {v.usagePercentage || 0}%</span>
                <span>
                  Còn lại:{' '}
                  <strong className="text-slate-800">
                    {voucherDetail?.remainingGlobalUses !== undefined &&
                    voucherDetail?.remainingGlobalUses !== null
                      ? `${voucherDetail.remainingGlobalUses} lượt`
                      : v.usageLimit
                      ? `${Math.max(0, v.usageLimit - v.usedCount)} lượt`
                      : 'Không giới hạn'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 2. Lưới 4 chỉ số thống kê hiệu quả thực tế */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
                Đơn Hợp Lệ Đã Áp Mã
              </div>
              <div className="text-xl font-black text-slate-900 mt-1.5">
                {isLoading ? '...' : voucherDetail?.validAppliedOrdersCount ?? v.usedCount}{' '}
                <span className="text-xs font-medium text-slate-500">đơn</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Hoàn tất giao:{' '}
                <strong className="text-emerald-700">
                  {isLoading ? '...' : voucherDetail?.completedAppliedOrdersCount ?? 0} đơn
                </strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-rose-600" />
                Tổng Tiền Đã Giảm
              </div>
              <div className="text-xl font-black text-rose-600 mt-1.5">
                {isLoading ? '...' : formatCurrency(voucherDetail?.totalDiscountGranted || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Ngân sách khuyến mãi thực tế
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Doanh Thu Đơn Áp Mã
              </div>
              <div className="text-xl font-black text-emerald-700 mt-1.5">
                {isLoading ? '...' : formatCurrency(voucherDetail?.totalOrderRevenueGenerated || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Tính trên đơn đã giao thành công
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                Giới Hạn / Tài Khoản
              </div>
              <div className="text-xl font-black text-slate-900 mt-1.5">
                {v.userUsageLimit || 1}{' '}
                <span className="text-xs font-medium text-slate-500">lượt / khách</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Chống lạm dụng mã khuyến mãi
              </div>
            </div>
          </div>

          {/* 3. Thời gian hiệu lực & Dấu vết hệ thống */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                Thời gian bắt đầu hiệu lực:
              </div>
              <div className="text-slate-600 pl-5.5 font-medium">{formatDateVi(v.startsAt)}</div>
            </div>

            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                Thời gian kết thúc / Hết hạn:
              </div>
              <div className="text-slate-600 pl-5.5 font-medium">{formatDateVi(v.expiresAt)}</div>
            </div>

            {v.createdAt && (
              <div className="text-slate-500 pt-2 border-t border-slate-100">
                Ngày khởi tạo: <strong className="text-slate-700">{formatDateVi(v.createdAt)}</strong>
              </div>
            )}
            {v.updatedAt && (
              <div className="text-slate-500 pt-2 border-t border-slate-100">
                Cập nhật gần nhất: <strong className="text-slate-700">{formatDateVi(v.updatedAt)}</strong>
              </div>
            )}
          </div>

          {/* 4. Bảng danh sách đơn hàng gần đây đã áp dụng mã giảm giá này */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Danh Sách Đơn Hàng Đã Áp Dụng Mã [{v.code}]
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {recentOrders.length} đơn gần nhất
              </span>
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Đang tải lịch sử đơn hàng áp dụng mã...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Chưa có đơn hàng nào áp dụng mã giảm giá này.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 sticky top-0 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3.5">Mã Đơn</th>
                      <th className="py-2.5 px-3.5">Khách Hàng</th>
                      <th className="py-2.5 px-3.5 text-right">Tiền Hàng</th>
                      <th className="py-2.5 px-3.5 text-right">Được Giảm</th>
                      <th className="py-2.5 px-3.5 text-right">Thành Tiền</th>
                      <th className="py-2.5 px-3.5 text-center">Trạng Thái</th>
                      <th className="py-2.5 px-3.5 text-right">Ngày Đặt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((ord) => {
                      const statusMeta = ADMIN_ORDER_STATUS_MAP[ord.status?.toLowerCase() || ''];
                      return (
                        <tr key={ord.orderId} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900">
                            #{ord.orderCode}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-800">{ord.customerName}</div>
                            {ord.customerPhone && (
                              <div className="text-[11px] text-slate-400">{ord.customerPhone}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3.5 text-right text-slate-600">
                            {formatCurrency(ord.totalPrice)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-bold text-rose-600">
                            -{formatCurrency(ord.discountAmount)}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-black text-slate-900">
                            {formatCurrency(ord.finalAmount)}
                          </td>
                          <td className="py-2.5 px-3.5 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                statusMeta?.badgeClass ||
                                'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {statusMeta?.label || ord.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right text-slate-500 whitespace-nowrap">
                            {formatDateVi(ord.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => onEdit(v)}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Chỉnh sửa mã này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
