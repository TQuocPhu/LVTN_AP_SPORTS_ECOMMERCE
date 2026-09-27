'use client';

import React from 'react';
import { Edit3, X, RefreshCw } from 'lucide-react';
import { AdminOrderDetail } from '@/types/admin-order';

interface AdminOrderUpdateStatusModalProps {
  isOpen: boolean;
  order: AdminOrderDetail | null;
  newStatus: string;
  onStatusChange: (status: string) => void;
  note: string;
  onNoteChange: (note: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdminOrderUpdateStatusModal({
  isOpen,
  order,
  newStatus,
  onStatusChange,
  note,
  onNoteChange,
  isSubmitting,
  onClose,
  onConfirm,
}: AdminOrderUpdateStatusModalProps) {
  if (!isOpen || !order) return null;

  const currentStat = order.status?.toLowerCase() || '';

  const getValidNextStatusOptions = (curr: string) => {
    switch (curr) {
      case 'pending':
        return [
          { value: 'confirmed', label: '1. Xác Nhận Đơn Hàng' },
          { value: 'cancelled', label: 'Hủy Đơn Hàng' },
        ];
      case 'confirmed':
        return [
          { value: 'processing', label: '2. Xuất Kho AP Sports (Đóng Gói)' },
          { value: 'cancelled', label: 'Hủy Đơn Hàng' },
        ];
      case 'processing':
        return [
          { value: 'shipped', label: '3. Bàn Giao Bưu Cục GHN (Shipped)' },
          { value: 'cancelled', label: 'Hủy Đơn Hàng' },
        ];
      case 'shipped':
        return [{ value: 'shipping', label: '4. Xe Tải Xuất Phát (Shipping)' }];
      case 'shipping':
        return [{ value: 'delivered', label: '5. Đã Giao Thành Công (Delivered)' }];
      default:
        return [];
    }
  };

  const statusOptions = getValidNextStatusOptions(currentStat);

  // Thông báo nghiệp vụ thanh toán theo trạng thái đơn được chọn
  const paymentNote: Record<string, { text: string; color: string }> = {
    confirmed:  { text: 'Trạng thái đơn → Đã xác nhận. Thanh toán không thay đổi.', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    processing: { text: 'Trạng thái đơn → Đang đóng gói. Thanh toán không thay đổi.', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    shipping:   { text: 'Trạng thái đơn → Đang vận chuyển. Thanh toán không thay đổi.', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
    delivered:  { text: 'Trạng thái đơn → Hoàn thành. Đơn COD sẽ tự động đánh dấu Đã thanh toán. Đơn VNPay giữ nguyên.', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    cancelled:  { text: 'Hủy đơn: Tồn kho sẽ được hoàn trả. Đơn đã thanh toán VNPay → Refunded; đơn COD/chưa thanh toán → Failed.', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Cập Nhật Trạng Thái Đơn #{order.orderCode}
              </h3>
              <p className="text-xs text-slate-500">
                Trạng thái hiện tại: <span className="font-bold uppercase text-orange-600">{order.status}</span>
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
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Chọn trạng thái mới <span className="text-rose-500">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Ghi chú cập nhật (Tùy chọn)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Nhập ghi chú hoặc lý do thay đổi trạng thái..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
            disabled={isSubmitting || !newStatus}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>Cập Nhật Trạng Thái</span>
          </button>
        </div>
      </div>
    </div>
  );
}
