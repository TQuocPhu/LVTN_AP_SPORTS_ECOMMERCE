'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { CategoryResponse } from '@/types/category';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  category: CategoryResponse | null;
  actionLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CategoryDeleteModal({
  isOpen,
  category,
  actionLoading,
  onClose,
  onConfirm,
}: CategoryDeleteModalProps) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Xác Nhận Xóa Danh Mục?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <strong className="text-slate-900 font-bold">"{category.name}"</strong>? Hành động này không thể hoàn tác.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-left text-[11px] text-amber-800">
            * Lưu ý: Hệ thống sẽ từ chối xóa nếu danh mục này đang chứa <strong>danh mục con</strong> hoặc đang có <strong>sản phẩm thuộc danh mục</strong>.
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={actionLoading}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Đang xóa...' : 'Xóa ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
