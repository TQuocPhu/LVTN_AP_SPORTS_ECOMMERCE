'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

interface ProductFormFooterNavProps {
  activeStep: number;
  isEdit?: boolean;
  submitting: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
}

export function ProductFormFooterNav({
  activeStep,
  isEdit = false,
  submitting,
  onPrevStep,
  onNextStep,
  onSubmit,
}: ProductFormFooterNavProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
      <button
        type="button"
        onClick={onPrevStep}
        disabled={activeStep === 0}
        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold text-base rounded-xl hover:bg-slate-200 disabled:opacity-40 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Quay lại
      </button>

      {activeStep < 3 ? (
        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 px-7 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-xl shadow-sm transition-all"
        >
          Tiếp theo <ArrowRight className="w-5 h-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />{' '}
          {submitting
            ? 'Đang lưu...'
            : isEdit
            ? 'Cập Nhật Sản Phẩm'
            : 'Lưu Sản Phẩm Mới'}
        </button>
      )}
    </div>
  );
}
