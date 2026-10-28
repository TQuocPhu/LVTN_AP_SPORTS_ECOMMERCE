'use client';

import React from 'react';
import {
  Layers,
  Plus,
  Trash2,
  AlertCircle,
  Lock,
  Building2,
  SendHorizontal,
  Zap,
  PackageX,
} from 'lucide-react';
import { VariantAttributeManager } from '@/components/admin/product/VariantAttributeManager';
import { ProductImageUpload } from '@/components/admin/product/ProductImageUpload';
import { VariantAttributeGroup } from '@/hooks/useProductForm';
import { ProductVariant } from '@/types/product';
import { Supplier } from '@/types/inventory';
import { InboundActionType } from '@/types/import-request';
import { parseVariantAttributes } from '@/utils/variant-attribute-helper';

interface ProductFormVariantStepProps {
  isEdit?: boolean;
  canCreateImport?: boolean;
  isStockInputAllowed?: boolean;
  totalCalculatedStock?: number;
  inboundAction?: InboundActionType;
  setInboundAction?: (action: InboundActionType) => void;
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

/**
 * Hiển thị thẻ thuộc tính biến thể thể thao thuần túy (không chứa logic JSON parsing trong component)
 */
function VariantAttributesDisplay({
  attributes,
  color,
  size,
}: {
  attributes?: string;
  color?: string;
  size?: string;
}) {
  const parsedList = parseVariantAttributes(attributes, color, size);

  if (parsedList.length === 0) {
    return <span className="text-xs italic text-slate-400">Tiêu chuẩn</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 max-w-xs">
      {parsedList.map((attr, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
        >
          {attr.name ? (
            <>
              <span className="text-slate-500">{attr.name}:</span>
              <span className="text-orange-600 font-bold">{attr.value}</span>
            </>
          ) : (
            <span className="text-orange-600 font-bold">{attr.value}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function ProductFormVariantStep({
  isEdit = false,
  canCreateImport = false,
  isStockInputAllowed = false,
  totalCalculatedStock = 0,
  inboundAction = 'NONE',
  setInboundAction,
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
  return (
    <div className="space-y-6 w-full mx-auto">
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

      {/* TÙY CHỌN NHẬP KHO BAN ĐẦU THEO PHÂN QUYỀN (CHỈ DÀNH CHO ADMIN VÀ WAREHOUSE_MANAGER) */}
      {!isEdit && canCreateImport && (
        <div className="p-5 bg-gradient-to-br from-slate-50 via-white to-orange-50/40 border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Quy trình Xử lý Tồn kho Ban đầu
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                    Phân quyền chặt chẽ
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Quản trị viên và Quản lý kho có thẩm quyền lập phiếu nhập kho nhanh hoặc gửi yêu cầu nhập kho.
                </p>
              </div>
            </div>
          </div>

          {/* Các lựa chọn Inbound Action */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {/* Lựa chọn 1: LẬP PHIẾU NHẬP KHO NHANH (Chỉ dành cho ADMIN) */}
            {canCreateImport ? (
              <label
                className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  inboundAction === 'DIRECT_IMPORT'
                    ? 'border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="inboundAction"
                  value="DIRECT_IMPORT"
                  checked={inboundAction === 'DIRECT_IMPORT'}
                  onChange={() => setInboundAction?.('DIRECT_IMPORT')}
                  className="mt-1 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <Zap className="w-4 h-4 text-orange-500" /> Nhập kho nhanh
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Lập phiếu nhập kho chính thức và cộng dồn tồn kho ngay lập tức.
                  </p>
                </div>
              </label>
            ) : (
              <div className="p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 opacity-60 flex items-start gap-3 cursor-not-allowed">
                <Lock className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-sm font-bold text-slate-400">Nhập kho nhanh (Bị khoá)</div>
                  <p className="text-xs text-slate-400 mt-0.5">Chỉ Quản trị viên mới có thẩm quyền này.</p>
                </div>
              </div>
            )}

            {/* Lựa chọn 2: GỬI YÊU CẦU NHẬP KHO (Dành cho cả ADMIN và STAFF) */}
            <label
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                inboundAction === 'IMPORT_REQUEST'
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="inboundAction"
                value="IMPORT_REQUEST"
                checked={inboundAction === 'IMPORT_REQUEST'}
                onChange={() => setInboundAction?.('IMPORT_REQUEST')}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <SendHorizontal className="w-4 h-4 text-blue-500" /> Gửi yêu cầu nhập kho
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Bắn WebSocket tức thì tới Quản lý kho để kiểm đếm thực tế và duyệt.
                </p>
              </div>
            </label>

            {/* Lựa chọn 3: CHƯA NHẬP KHO */}
            <label
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                inboundAction === 'NONE'
                  ? 'border-slate-500 bg-slate-50/80 shadow-xs ring-1 ring-slate-400'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="inboundAction"
                value="NONE"
                checked={inboundAction === 'NONE'}
                onChange={() => setInboundAction?.('NONE')}
                className="mt-1 text-slate-600 focus:ring-slate-500"
              />
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  <PackageX className="w-4 h-4 text-slate-500" /> Chưa nhập kho
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Sản phẩm được lưu với số lượng ban đầu là 0 (Hết hàng).
                </p>
              </div>
            </label>
          </div>

          {/* Form phụ khi chọn LẬP PHIẾU NHẬP KHO NHANH (Chỉ DIRECT_IMPORT mới cần chọn Nhà cung cấp) */}
          {inboundAction === 'DIRECT_IMPORT' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 animate-in fade-in duration-200">
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
                  Ghi chú chứng từ nhập kho
                </label>
                <input
                  type="text"
                  value={importNote}
                  onChange={(e) => setImportNote?.(e.target.value)}
                  placeholder="VD: Nhập lô hàng ban đầu, kiểm tra kỹ tem mác..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          )}

          {/* Form phụ khi chọn GỬI YÊU CẦU NHẬP KHO (Bắn WebSocket tới Quản lý kho, KHÔNG chọn Nhà cung cấp) */}
          {inboundAction === 'IMPORT_REQUEST' && (
            <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-800">
                <SendHorizontal className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Yêu cầu nhập kho sẽ được <strong>bắn WebSocket realtime</strong> tới Ban Quản lý kho để tiến hành kiểm đếm số lượng thực tế và phê duyệt. Bước này <strong>không cần chọn nhà cung cấp</strong>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ghi chú gửi tới Quản lý kho (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={importNote}
                  onChange={(e) => setImportNote?.(e.target.value)}
                  placeholder="VD: Hàng mới về cần kiểm đếm gấp để kịp lên kệ mở bán..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thông báo phân quyền dành cho Nhân viên (Staff) */}
      {!isEdit && !canCreateImport && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 text-xs text-slate-600">
          <div className="p-2 bg-slate-200 text-slate-700 rounded-xl flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Phân quyền tồn kho sản phẩm</h4>
            <p className="mt-0.5 text-slate-500">
              Tài khoản Nhân viên chỉ thiết lập thông tin cơ bản và ma trận biến thể sản phẩm. Nghiệp vụ lập phiếu nhập kho hoặc gửi yêu cầu nhập kho thuộc thẩm quyền của Quản trị viên và Quản lý kho.
            </p>
          </div>
        </div>
      )}

      {/* BẢNG BIẾN THỂ SẢN PHẨM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Danh sách biến thể ({variants.length} dòng)
            </label>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200/80 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {inboundAction === 'IMPORT_REQUEST'
                ? `Tổng số lượng đề xuất: ${totalCalculatedStock} cái`
                : `Tổng tồn kho: ${totalCalculatedStock} cái`}
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
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-xs">
                <th className="p-3.5 min-w-[240px]">Mã SKU</th>
                <th className="p-3.5 min-w-[160px]">Thuộc tính biến thể</th>
                <th className="p-3.5 w-32">Giá bán (đ)</th>
                <th className="p-3.5 w-32">Giá vốn dự kiến (đ)</th>
                <th className="p-3.5 w-28 text-center">
                  {isEdit
                    ? 'Số lượng tồn kho'
                    : inboundAction === 'DIRECT_IMPORT'
                    ? 'SL nhập ngay'
                    : inboundAction === 'IMPORT_REQUEST'
                    ? 'SL đề xuất nhập'
                    : 'Số lượng tồn kho'}
                </th>
                <th className="p-3.5 w-24 text-center">Ảnh biến thể</th>
                <th className="p-3.5 w-14 text-right">Xóa</th>
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
                      placeholder="Mã SKU biến thể..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 tracking-wide focus:ring-1 focus:ring-orange-500"
                    />
                  </td>

                  {/* Cột Thuộc tính biến thể động (Attributes) - Hiển thị dạng badge đẹp, loại bỏ hoàn toàn JSON thô */}
                  <td className="p-3">
                    <VariantAttributesDisplay
                      attributes={varItem.attributes || undefined}
                      color={varItem.color || undefined}
                      size={varItem.size || undefined}
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      value={varItem.price}
                      onChange={(e) => onUpdateVariant(idx, 'price', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:ring-1 focus:ring-orange-500"
                    />
                  </td>

                  <td className="p-3">
                    <input
                      type="number"
                      value={varItem.costPrice}
                      onChange={(e) =>
                        onUpdateVariant(idx, 'costPrice', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-1 focus:ring-orange-500"
                    />
                  </td>

                  <td className="p-3 text-center">
                    {isEdit ? (
                      <div className="relative inline-block w-full">
                        <input
                          type="number"
                          disabled
                          value={varItem.stockQuantity}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-500 cursor-not-allowed opacity-80 text-center"
                          title="Số lượng kho được điều chỉnh tại Quản lý kho hàng"
                        />
                        <Lock className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
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
                        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-bold text-center focus:ring-2 ${
                          inboundAction === 'IMPORT_REQUEST'
                            ? 'text-blue-600 border-blue-200 focus:ring-blue-500/20 focus:border-blue-500'
                            : 'text-emerald-600 border-emerald-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                        }`}
                      />
                    ) : (
                      <div className="relative inline-block w-full">
                        <input
                          type="number"
                          disabled
                          value={0}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-400 cursor-not-allowed opacity-80 text-center"
                          title="Tồn kho khởi tạo là 0"
                        />
                        <Lock className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
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
