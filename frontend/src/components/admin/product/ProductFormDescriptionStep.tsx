'use client';

import React from 'react';
import { FileText, Plus, Trash2, Sparkles } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/product/RichTextEditor';
import { SpecPair } from '@/hooks/useProductForm';
import { useProductAiContent } from '@/hooks/useProductAiContent';

interface ProductFormDescriptionStepProps {
  productName?: string;
  description: string;
  specifications: SpecPair[];
  onDescriptionChange: (val: string) => void;
  onAddSpecRow: () => void;
  onRemoveSpecRow: (index: number) => void;
  onSpecChange: (index: number, field: 'key' | 'value', val: string) => void;
}

export function ProductFormDescriptionStep({
  productName,
  description,
  specifications,
  onDescriptionChange,
  onAddSpecRow,
  onRemoveSpecRow,
  onSpecChange,
}: ProductFormDescriptionStepProps) {
  const { isGenerating, handleGenerateAiDescription } = useProductAiContent();

  const handleTriggerAi = () => {
    // Chuyển danh sách thông số kỹ thuật thành attributes gửi cho AI
    const attributesMap: Record<string, string> = {};
    specifications.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        attributesMap[spec.key.trim()] = spec.value.trim();
      }
    });

    handleGenerateAiDescription(
      {
        productName: productName || '',
        attributes: Object.keys(attributesMap).length > 0 ? attributesMap : undefined,
      },
      (html) => {
        onDescriptionChange(html);
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
        <FileText className="w-6 h-6 text-orange-500" /> Bước 2: Mô tả sản phẩm & Thông số kỹ thuật
      </h2>

      {/* Rich Text Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">
            Mô tả chi tiết sản phẩm (Định dạng HTML Rich Text)
          </label>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleTriggerAi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
            title="Sử dụng Gemini Flash AI để tự động viết mô tả sản phẩm chuẩn SEO"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'AI đang viết bài...' : '✨ AI Sinh Mô Tả Chuẩn SEO'}
          </button>
        </div>
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
