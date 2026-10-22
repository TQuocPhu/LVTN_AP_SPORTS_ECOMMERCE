'use client';

import React from 'react';
import { Layers, Plus, Trash2, AlertCircle, Lock, Building2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { VariantAttributeManager } from '@/components/admin/product/VariantAttributeManager';
import { ProductImageUpload } from '@/components/admin/product/ProductImageUpload';
import { VariantAttributeGroup } from '@/hooks/useProductForm';
import { ProductVariant } from '@/types/product';
import { Supplier } from '@/types/inventory';

interface ProductFormVariantStepProps {
  isEdit?: boolean;
  canCreateImport?: boolean;
  hasInitialStock?: boolean;
  setHasInitialStock?: (val: boolean) => void;
  supplierId?: number;
  setSupplierId?: (id: number) => void;
  importNote?: string;
  setImportNote?: (note: string) => void;
  suppliers?: Supplier[];
  loadingSuppliers?: boolean;
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
  canCreateImport = false,
  hasInitialStock = false,
  setHasInitialStock,
  supplierId,
  setSupplierId,
  importNote = '',
  setImportNote,
  suppliers = [],
  loadingSuppliers = false,
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
  const isStockInputAllowed = !isEdit && canCreateImport && hasInitialStock;

  const totalCalculatedStock = isStockInputAllowed
    ? variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
    : isEdit
    ? variants.reduce((sum, v) => sum + (Number(v.stockQuantity) || 0), 0)
    : 0;

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

      {/* Inbound Stock Management Section (During Creation) */}
      {!isEdit && (
        <>
          {!canCreateImport ? (
            /* Staff Role Notification Banner */
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 shadow-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Phân quyền Nhân viên (Staff): Tồn kho được quản lý tập trung qua Kho hàng
                </h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Tài khoản Staff không có thẩm quyền tạo phiếu nhập kho hoặc can thiệp giá vốn. Sản phẩm mới sẽ được tạo với số lượng ban đầu là <strong>0 (Hết hàng)</strong>. Quản lý kho sẽ lập phiếu nhập hàng chính quy sau đó.
                </p>
              </div>
            </div>
          ) : (
            /* Admin & Warehouse Manager Inbound Receipt Box */
            <div className="p-5 bg-gradient-to-br from-orange-50/60 via-white to-slate-50 border border-orange-200/70 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Khởi tạo Tồn kho & Lập Phiếu Nhập Kho ban đầu
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                        Chứng từ kho chính quy
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tự động ghi nhận vào sổ cái kho và báo cáo thống kê ngay khi lưu sản phẩm
                    </p>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-white px-3.5 py-1.5 rounded-xl border border-orange-200/80 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={hasInitialStock}
                    onChange={(e) => setHasInitialStock?.(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  <span className="text-sm font-bold text-slate-800">
                    Lập phiếu nhập kho ngay
                  </span>
                </label>
              </div>

              {hasInitialStock && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-orange-100/80">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Nhà cung cấp hàng hóa <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={supplierId || ''}
                      onChange={(e) => setSupplierId?.(Number(e.target.value))}
                      disabled={loadingSuppliers}
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
                        errors.supplierId ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200'
                      }`}
                    >
                      <option value="" disabled>-- Chọn Nhà Cung Cấp ({suppliers.length} đối tác) --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                    {errors.supplierId && (
                      <p className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.supplierId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Ghi chú phiếu nhập kho (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={importNote}
                      onChange={(e) => setImportNote?.(e.target.value)}
                      placeholder="VD: Nhập kho kiện hàng ban đầu khai trương..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

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

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <th className="p-3.5">Mã SKU</th>
                <th className="p-3.5">Màu</th>
                <th className="p-3.5">Size / Thuộc tính</th>
                <th className="p-3.5">Giá bán (đ)</th>
                <th className="p-3.5">Giá vốn / Đơn giá nhập (đ)</th>
                <th className="p-3.5">
                  {isEdit ? 'Số lượng tồn kho' : isStockInputAllowed ? 'Số lượng nhập kho ban đầu' : 'Số lượng tồn kho'}
                </th>
                <th className="p-3.5">Ảnh biến thể</th>
                <th className="p-3.5 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((varItem, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
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
                      value={varItem.size || ''}
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
                          className="w-28 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 cursor-not-allowed opacity-80"
                          title="Số lượng kho được điều chỉnh tại Quản lý kho hàng"
                        />
                        <Lock className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    ) : isStockInputAllowed ? (
                      <input
                        type="number"
                        min="0"
                        value={varItem.stockQuantity}
                        onChange={(e) =>
                          onUpdateVariant(idx, 'stockQuantity', Math.max(0, Number(e.target.value)))
                        }
                        placeholder="0"
                        className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="number"
                          disabled
                          value={0}
                          className="w-28 px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-400 cursor-not-allowed opacity-80"
                          title={!canCreateImport ? 'Nhân viên không có quyền nhập kho ban đầu' : 'Tồn kho được tạo là 0'}
                        />
                        <Lock className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
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
