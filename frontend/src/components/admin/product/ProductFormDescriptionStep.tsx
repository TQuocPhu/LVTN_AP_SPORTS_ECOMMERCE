'use client';

import React from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/product/RichTextEditor';
import { SpecPair } from '@/hooks/useProductForm';

interface ProductFormDescriptionStepProps {
  description: string;
  specifications: SpecPair[];
  onDescriptionChange: (val: string) => void;
  onAddSpecRow: () => void;
  onRemoveSpecRow: (index: number) => void;
  onSpecChange: (index: number, field: 'key' | 'value', val: string) => void;
}

export function ProductFormDescriptionStep({
  description,
  specifications,
  onDescriptionChange,
  onAddSpecRow,
  onRemoveSpecRow,
  onSpecChange,
}: ProductFormDescriptionStepProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
        <FileText className="w-6 h-6 text-orange-500" /> Bước 2: Mô tả sản phẩm & Thông số kỹ thuật
      </h2>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
          Mô tả chi tiết sản phẩm (Định dạng HTML Rich Text)
        </label>
        <RichTextEditor value={description} onChange={onDescriptionChange} />
      </div>

      {/* Dynamic Specifications Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Thông số kỹ thuật động (Key-Value)
          </label>
          <button
            type="button"
            onClick={onAddSpecRow}
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200/60 transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm dòng thông số
          </button>
        </div>

        <div className="space-y-3">
          {specifications.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Tên thông số (Ví dụ: Chất liệu)"
                value={spec.key}
                onChange={(e) => onSpecChange(idx, 'key', e.target.value)}
                className="w-1/3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <input
                type="text"
                placeholder="Giá trị (Ví dụ: Da tổng hợp Microfiber cao cấp)"
                value={spec.value}
                onChange={(e) => onSpecChange(idx, 'value', e.target.value)}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => onRemoveSpecRow(idx)}
                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="Xóa dòng thông số"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
