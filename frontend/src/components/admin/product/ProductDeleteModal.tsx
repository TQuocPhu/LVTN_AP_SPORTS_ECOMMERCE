'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface ProductDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ProductDeleteModal({
  isOpen,
  onClose,
  onConfirm,
}: ProductDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Xác nhận xóa sản phẩm?</h3>
          <p className="text-sm text-slate-500">
            Hành động này sẽ xóa vĩnh viễn sản phẩm cùng tất cả biến thể và hình ảnh liên quan khỏi hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-md shadow-rose-600/20 transition-colors text-sm"
          >
            Xóa Vĩnh Viễn
          </button>
        </div>
      </div>
    </div>
  );
}
