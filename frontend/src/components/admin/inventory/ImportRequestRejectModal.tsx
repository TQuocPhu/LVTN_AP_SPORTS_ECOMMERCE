import React from 'react';
import { ImportRequest } from '@/types/import-request';
import { X, AlertOctagon } from 'lucide-react';

interface ImportRequestRejectModalProps {
  isOpen: boolean;
  request: ImportRequest | null;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

/**
 * Modal từ chối Yêu Cầu Nhập Kho
 * Tuân thủ Layer Architecture: Không useState/useEffect
 */
export function ImportRequestRejectModal({
  isOpen,
  request,
  rejectReason,
  setRejectReason,
  submitting,
  onClose,
  onSubmit,
}: ImportRequestRejectModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Từ Chối Yêu Cầu Nhập Kho
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{request.code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Vui lòng nêu rõ lý do từ chối để thông báo qua WebSocket đến người gửi yêu cầu (
            <strong>{request.requestedByUserName}</strong>):
          </p>

          <div>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Nhà cung cấp giao thiếu hàng, sai mã biến thể màu sắc, chưa có hóa đơn VAT..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !rejectReason.trim()}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            {submitting ? 'Đang xử lý...' : 'Xác Nhận Từ Chối'}
          </button>
        </div>
      </div>
    </div>
  );
}

