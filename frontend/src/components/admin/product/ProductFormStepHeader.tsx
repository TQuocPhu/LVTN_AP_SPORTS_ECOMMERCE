'use client';

import React from 'react';
import { Package, FileText, Layers, Check } from 'lucide-react';

interface ProductFormStepHeaderProps {
  activeStep: number;
  onStepClick: (stepIndex: number) => void;
}

export function ProductFormStepHeader({
  activeStep,
  onStepClick,
}: ProductFormStepHeaderProps) {
  const steps = [
    { number: 1, title: 'Thông tin cơ bản', icon: Package },
    { number: 2, title: 'Mô tả & Thông số', icon: FileText },
    { number: 3, title: 'Ma trận biến thể', icon: Layers },
    { number: 4, title: 'Xác nhận & Lưu', icon: Check },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-200 pb-6">
      {steps.map((st, idx) => {
        const Icon = st.icon;
        const isActive = activeStep === idx;
        const isCompleted = activeStep > idx;

        return (
          <button
            key={st.number}
            type="button"
            onClick={() => onStepClick(idx)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
              isActive
                ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                : isCompleted
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : st.number}
            </div>

            <div className="min-w-0">
              <span className="text-[11px] uppercase font-bold tracking-wider opacity-70 block">
                Bước {st.number}
              </span>
              <span className="text-xs sm:text-sm font-bold truncate block">
                {st.title}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
