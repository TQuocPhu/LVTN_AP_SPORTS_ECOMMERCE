'use client';

import React from 'react';
import { Layers, Plus, Trash2, AlertCircle, Lock } from 'lucide-react';
import { VariantAttributeManager } from '@/components/admin/product/VariantAttributeManager';
import { ProductImageUpload } from '@/components/admin/product/ProductImageUpload';
import { VariantAttributeGroup } from '@/hooks/useProductForm';
import { ProductVariant } from '@/types/product';

interface ProductFormVariantStepProps {
  isEdit?: boolean;
  attributeGroups: VariantAttributeGroup[];
  variants: ProductVariant[];
  errors: Record<string, string>;
  onAddGroup: (name: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onAddValue: (groupId: string, value: string) => void;
  onRemoveValue: (groupId: string, value: string) => void;
  onAddVariantRow: () => void;
  onUpdateVariant: (index: number, field: keyof ProductVariant, val: any) => void;
  onRemoveVariant: (index: number) => void;
}

export function ProductFormVariantStep({
  isEdit = false,
  attributeGroups,
  variants,
  errors,
  onAddGroup,
  onRemoveGroup,
  onAddValue,
  onRemoveValue,
  onAddVariantRow,
  onUpdateVariant,
  onRemoveVariant,
}: ProductFormVariantStepProps) {
  const totalCalculatedStock = variants.reduce(
    (sum, v) => sum + (Number(v.stockQuantity) || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-orange-500" /> Bước 3: Thiết lập ma trận biến thể sản phẩm
        </span>
        {isEdit && (
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1 border border-amber-200">
            <Lock className="w-3.5 h-3.5" /> Tồn kho kho hàng được bảo vệ
          </span>
        )}
      </h2>

      {/* Dynamic Attribute Groups Manager */}
      <VariantAttributeManager
        attributeGroups={attributeGroups}
        onAddGroup={onAddGroup}
        onRemoveGroup={onRemoveGroup}
        onAddValue={onAddValue}
        onRemoveValue={onRemoveValue}
      />

      {/* Generated Variants Table Editor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Danh sách biến thể ({variants.length} dòng)
            </label>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200/80 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tổng tồn kho sản phẩm: {totalCalculatedStock} cái (Tự động cộng dồn)
            </span>
          </div>

          <button
            type="button"
            onClick={onAddVariantRow}
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200/60 transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm biến thể thủ công
          </button>
        </div>

        {errors.variants && (
          <p className="text-sm font-semibold text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {errors.variants}
          </p>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="p-3.5">Mã SKU</th>
                <th className="p-3.5">Màu</th>
                <th className="p-3.5">Size / Thuộc tính</th>
                <th className="p-3.5">Giá bán (đ)</th>
                <th className="p-3.5">Giá nhập (đ)</th>
                <th className="p-3.5">Số lượng tồn kho</th>
                <th className="p-3.5">Ảnh biến thể</th>
                <th className="p-3.5 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((varItem, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="p-3">
                    <input
                      type="text"
                      value={varItem.sku}
                      onChange={(e) => onUpdateVariant(idx, 'sku', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm font-semibold focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={varItem.color || ''}
                      onChange={(e) => onUpdateVariant(idx, 'color', e.target.value)}
                      placeholder="Mặc định"
                      className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={varItem.size}
                      onChange={(e) => onUpdateVariant(idx, 'size', e.target.value)}
                      className="w-36 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={varItem.price}
                      onChange={(e) => onUpdateVariant(idx, 'price', Number(e.target.value))}
                      className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={varItem.costPrice}
                      onChange={(e) =>
                        onUpdateVariant(idx, 'costPrice', Number(e.target.value))
                      }
                      className="w-32 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-3">
                    {isEdit ? (
                      <div className="relative">
                        <input
                          type="number"
                          disabled
                          value={varItem.stockQuantity}
                          className="w-24 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 cursor-not-allowed opacity-80"
                          title="Số lượng kho được điều chỉnh tại Quản lý kho hàng"
                        />
                        <Lock className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={varItem.stockQuantity}
                        onChange={(e) =>
                          onUpdateVariant(idx, 'stockQuantity', Number(e.target.value))
                        }
                        className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:ring-1 focus:ring-orange-500"
                      />
                    )}
                  </td>
                  <td className="p-3">
                    <ProductImageUpload
                      compact
                      multiple
                      images={varItem.images || []}
                      onImagesChange={(urls) => onUpdateVariant(idx, 'images', urls)}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRemoveVariant(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa biến thể"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
