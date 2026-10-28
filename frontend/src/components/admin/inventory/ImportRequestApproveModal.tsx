import React from 'react';
import Image from 'next/image';
import { ImportRequest, ImportRequestItem, ApproveItemPayload } from '@/types/import-request';
import { Supplier } from '@/types/inventory';
import { X, Check, PackageCheck, AlertCircle, Package, Building2 } from 'lucide-react';
import { formatVariantDisplay } from '@/utils/variant-attribute-helper';

export interface ModalApproveItemDisplay extends ImportRequestItem {
  approvedQuantity: number;
  actualCostPrice: number;
}

interface ImportRequestApproveModalProps {
  isOpen: boolean;
  request: ImportRequest | null;
  items: ModalApproveItemDisplay[];
  totalApprovedQuantity: number;
  approveNote: string;
  setApproveNote: (note: string) => void;
  suppliers: Supplier[];
  selectedSupplierId?: number;
  onSelectSupplier: (id?: number) => void;
  loadingSuppliers?: boolean;
  submitting: boolean;
  onClose: () => void;
  onUpdateApproveItem: (itemId: number, field: keyof ApproveItemPayload, val: any) => void;
  onSubmit: () => void;
}

/**
 * Modal phê duyệt kiểm đếm nhập kho thực tế
 * Tuân thủ Layer Architecture: Chỉ nhận props hiển thị thuần túy, không có logic tính toán hay state trong component
 */
export function ImportRequestApproveModal({
  isOpen,
  request,
  items,
  totalApprovedQuantity,
  approveNote,
  setApproveNote,
  suppliers,
  selectedSupplierId,
  onSelectSupplier,
  loadingSuppliers = false,
  submitting,
  onClose,
  onUpdateApproveItem,
  onSubmit,
}: ImportRequestApproveModalProps) {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Kiểm Đếm & Duyệt Nhập Kho: <span className="font-mono text-emerald-700">{request.code}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Xác nhận số lượng thực tế kiểm đếm tại kho và chốt đơn giá vốn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Sau khi xác nhận, hệ thống sẽ tự động sinh <strong>Phiếu Nhập Kho (PNK)</strong>, ghi sổ cái kho, cộng dồn tồn kho thực tế và bắn WebSocket thông báo đến người đề xuất.
            </span>
          </div>

          {/* Chọn Nhà Cung Cấp (Bắt buộc để lập Phiếu Nhập Kho) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange-500" />
                Nhà cung cấp nhập hàng <span className="text-rose-500">*</span>
              </label>
              {loadingSuppliers && (
                <span className="text-xs text-slate-400 animate-pulse">Đang nạp nhà cung cấp...</span>
              )}
            </div>

            <select
              value={selectedSupplierId || ''}
              onChange={(e) => onSelectSupplier(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
            >
              <option value="">-- Chọn Nhà cung cấp để lập phiếu nhập kho --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} {s.phone ? `(${s.phone})` : ''}
                </option>
              ))}
            </select>

            {!selectedSupplierId && (
              <p className="text-xs font-semibold text-rose-500 flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5" /> Bắt buộc chọn Nhà cung cấp để tạo phiếu nhập kho hợp lệ.
              </p>
            )}
          </div>

          {/* Bảng kiểm đếm từng biến thể */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-xs">
                  <th className="p-3">Biến thể / Thuộc tính</th>
                  <th className="p-3 text-center">SL Đề xuất</th>
                  <th className="p-3 text-center">SL Thực nhận</th>
                  <th className="p-3 text-right">Đơn giá vốn thực tế (đ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                          {it.image ? (
                            <Image src={it.image} alt={it.sku} fill sizes="32px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-xs text-slate-900">{it.sku}</span>
                          <div className="text-xs text-slate-600 font-medium">
                            {formatVariantDisplay(it.attributes, it.variantName)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-center font-bold text-slate-500">
                      {it.requestedQuantity} cái
                    </td>

                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={it.approvedQuantity}
                        onChange={(e) =>
                          onUpdateApproveItem(it.id, 'approvedQuantity', Math.max(0, Number(e.target.value)))
                        }
                        className="w-24 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-emerald-700 text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </td>

                    <td className="p-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={it.actualCostPrice}
                        onChange={(e) =>
                          onUpdateApproveItem(it.id, 'actualCostPrice', Math.max(0, Number(e.target.value)))
                        }
                        className="w-32 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800 text-right focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ghi chú duyệt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Ghi chú kiểm đếm / Lưu ý kho (Tùy chọn)
            </label>
            <input
              type="text"
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              placeholder="VD: Hàng nguyên seal, kiểm đủ 100% đúng số lượng tem..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="text-xs font-semibold text-slate-600">
            Tổng thực nhập: <strong className="text-emerald-700 text-sm">{totalApprovedQuantity}</strong> cái
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={submitting || totalApprovedQuantity === 0 || !selectedSupplierId}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
            >
              {submitting ? (
                <>Đang ghi sổ cái...</>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Xác Nhận Nhập Kho
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
