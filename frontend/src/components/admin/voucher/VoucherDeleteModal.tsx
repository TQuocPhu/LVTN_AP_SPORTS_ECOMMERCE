import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Voucher } from '@/types/voucher';

interface VoucherDeleteModalProps {
  isOpen: boolean;
  deletingVoucher: Voucher | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Component VoucherDeleteModal: Modal xác nhận xóa mã giảm giá cho Admin.
 */
export const VoucherDeleteModal: React.FC<VoucherDeleteModalProps> = ({
  isOpen,
  deletingVoucher,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !deletingVoucher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <span>Xác nhận xóa mã giảm giá</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-700">
            Bạn có chắc chắn muốn xóa mã giảm giá{' '}
            <span className="font-mono font-bold text-slate-900 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {deletingVoucher.code}
            </span>{' '}
            không?
          </p>
          <p className="text-xs text-slate-500">
            Hành động này không thể hoàn tác. Các đơn hàng đã sử dụng mã này trong quá khứ sẽ không bị ảnh hưởng.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50/50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </button>
        </div>
      </div>
    </div>
  );
};
