'use client';

import React from 'react';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';
import { AdminOrderDetail } from '@/types/admin-order';

interface AdminOrderCancelModalProps {
  isOpen: boolean;
  order: AdminOrderDetail | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminOrderCancelModal({
  isOpen,
  order,
  reason,
  onReasonChange,
  isSubmitting,
  onClose,
  onConfirm,
}: AdminOrderCancelModalProps) {
  if (!isOpen || !order) return null;

  const isVnPay = order.paymentMethod?.toUpperCase() === 'VNPAY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Xác Nhận Hủy Đơn Hàng #{order.orderCode}
              </h3>
              <p className="text-xs text-rose-600">
                Hành động này sẽ hủy đơn hàng và hoàn lại số lượng tồn kho
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {isVnPay && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <p className="font-bold">Lưu ý mô phỏng hoàn tiền VNPay:</p>
              <p className="mt-0.5">
                Đơn hàng này thanh toán qua VNPay. Hệ thống sẽ tự động cập nhật trạng thái thanh toán thành REFUNDED (Đã hoàn tiền) và hoàn trả lượt dùng Voucher (nếu có).
              </p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Lý do hủy đơn hàng <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Nhập chi tiết lý do hủy đơn (ví dụ: Khách yêu cầu hủy, Hết hàng đột xuất, Không liên lạc được khách...)"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting || !reason.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Xác Nhận Hủy Đơn</span>
          </button>
        </div>
      </div>
    </div>
  );
}
