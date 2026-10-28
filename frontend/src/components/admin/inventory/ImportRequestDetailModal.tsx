import React from 'react';
import Image from 'next/image';
import { ImportRequest } from '@/types/import-request';
import { ImportRequestStatusBadge } from './ImportRequestStatusBadge';
import { X, Building2, User, Calendar, FileText, Check, AlertOctagon, Package, Hash } from 'lucide-react';
import { parseVariantAttributes, formatDateTime } from '@/utils/variant-attribute-helper';

interface ImportRequestDetailModalProps {
  isOpen: boolean;
  request: ImportRequest | null;
  canApprove: boolean;
  onClose: () => void;
  onOpenApprove: (req: ImportRequest) => void;
  onOpenReject: (req: ImportRequest) => void;
}

/**
 * Hiển thị thuộc tính biến thể thể thao thuần túy qua helper
 */
function ItemAttributesDisplay({
  attributes,
  variantName,
  color,
  size,
}: {
  attributes?: string;
  variantName?: string;
  color?: string;
  size?: string;
}) {
  if (variantName && !variantName.trim().startsWith('{')) {
    return <span className="font-semibold text-slate-800 text-xs">{variantName}</span>;
  }

  const parsedList = parseVariantAttributes(attributes || variantName, color, size);
  if (parsedList.length === 0) {
    return <span className="text-xs text-slate-400 italic">Mặc định</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {parsedList.map((attr, idx) => (
        <span
          key={idx}
          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
        >
          {attr.name ? (
            <>
              <span className="text-slate-400">{attr.name}:</span> {attr.value}
            </>
          ) : (
            attr.value
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Modal hiển thị chi tiết Yêu Cầu Nhập Kho
 * Tuân thủ Layer Architecture: Chỉ nhận props, không tính toán logic trong component
 */
export function ImportRequestDetailModal({
  isOpen,
  request,
  canApprove,
  onClose,
  onOpenApprove,
  onOpenReject,
}: ImportRequestDetailModalProps) {
  if (!isOpen || !request) return null;

  const isPending = request.status === 'PENDING';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Chi Tiết Yêu Cầu Nhập Kho: <span className="font-mono text-orange-600">{request.code}</span>
                </h3>
                <ImportRequestStatusBadge status={request.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sản phẩm: <strong className="text-slate-800">{request.productName}</strong>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Người Gửi Đề Xuất
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1">{request.requestedByUserName}</p>
              <p className="text-xs text-slate-500">{request.requestedByUserRole || 'STAFF'}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Nhà Cung Cấp
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1">{request.supplierName || 'Chưa chọn'}</p>
              <p className="text-xs text-slate-500">Đối tác cung ứng</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Thời Gian Tạo
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1">{formatDateTime(request.createdAt)}</p>
              <p className="text-xs text-slate-500">Ghi nhận hệ thống</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Phiếu Nhập Kho
              </span>
              <p className="font-bold text-emerald-700 font-mono text-sm mt-1">
                {request.importTicketCode || 'Chưa phát sinh'}
              </p>
              <p className="text-xs text-slate-500">
                {request.approvedByUserName ? `Duyệt bởi: ${request.approvedByUserName}` : 'Đang chờ xử lý'}
              </p>
            </div>
          </div>

          {/* Ghi chú hoặc Lý do từ chối */}
          {request.note && (
            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <FileText className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Ghi chú từ người đề xuất:</strong> {request.note}
              </div>
            </div>
          )}

          {request.rejectionReason && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Lý do từ chối:</strong> {request.rejectionReason}
              </div>
            </div>
          )}

          {/* Bảng Mặt Hàng Chi Tiết Biến Thể Thể Thao */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh Sách Biến Thể Đề Xuất Nhập Kho ({request.items.length} mặt hàng)
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-xs">
                    <th className="p-3">Mặt hàng</th>
                    <th className="p-3">Mã SKU / Barcode</th>
                    <th className="p-3">Thuộc tính biến thể</th>
                    <th className="p-3 text-center">Tồn kho hiện tại</th>
                    <th className="p-3 text-center">SL Đề xuất</th>
                    <th className="p-3 text-center">SL Thực nhập</th>
                    <th className="p-3 text-right">Đơn giá vốn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {request.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                          {it.image ? (
                            <Image src={it.image} alt={it.sku} fill sizes="36px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-mono font-bold text-xs text-slate-800">
                        <div>{it.sku}</div>
                        {it.barcode && it.barcode !== it.sku && (
                          <div className="text-[10px] text-slate-400 font-normal">{it.barcode}</div>
                        )}
                      </td>

                      <td className="p-3">
                        <ItemAttributesDisplay
                          attributes={it.attributes}
                          variantName={it.variantName}
                        />
                      </td>

                      <td className="p-3 text-center font-medium text-slate-500">
                        {it.currentStock} cái
                      </td>

                      <td className="p-3 text-center font-bold text-slate-900">
                        {it.requestedQuantity}
                      </td>

                      <td className="p-3 text-center font-bold text-emerald-600">
                        {it.approvedQuantity !== undefined && it.approvedQuantity !== null
                          ? it.approvedQuantity
                          : '-'}
                      </td>

                      <td className="p-3 text-right font-medium text-slate-800">
                        {(it.actualCostPrice || it.expectedCostPrice || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors"
          >
            Đóng
          </button>

          {isPending && canApprove && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenReject(request)}
                className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-sm rounded-xl hover:bg-rose-100 transition-colors"
              >
                Từ Chối
              </button>

              <button
                type="button"
                onClick={() => onOpenApprove(request)}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" /> Kiểm Đếm & Duyệt Nhập Kho
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
