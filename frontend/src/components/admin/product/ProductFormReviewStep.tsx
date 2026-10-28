'use client';

import React from 'react';
import { Check, Image as ImageIcon, Building2, FileText, AlertCircle, Zap, SendHorizontal, PackageX } from 'lucide-react';
import { ProductVariant } from '@/types/product';
import { InboundActionType } from '@/types/import-request';

interface ProductFormReviewStepProps {
  isEdit?: boolean;
  name: string;
  slug: string;
  price: number | '';
  unit: string;
  mainImage: string;
  categoryIds: number[];
  variants: ProductVariant[];
  hasInitialStock?: boolean;
  inboundAction?: InboundActionType;
  supplierName?: string;
  importNote?: string;
}

export function ProductFormReviewStep({
  isEdit = false,
  name,
  slug,
  price,
  unit,
  mainImage,
  categoryIds,
  variants,
  hasInitialStock = false,
  inboundAction = 'NONE',
  supplierName,
  importNote,
}: ProductFormReviewStepProps) {
  const totalCalculatedStock = variants.reduce(
    (sum, v) => sum + (Number(v.stockQuantity) || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
        <Check className="w-6 h-6 text-emerald-500" /> Bước 4:{' '}
        {isEdit ? 'Kiểm tra & Cập nhật sản phẩm' : 'Kiểm tra thông tin & Xác nhận lưu'}
      </h2>

      <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-5 shadow-sm">
        <div className="flex items-center gap-4">
          {mainImage ? (
            <img
              src={mainImage}
              alt={name}
              className="w-24 h-24 object-cover rounded-xl border border-slate-200"
            />
          ) : (
            <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{name}</h3>
            <p className="text-sm text-slate-500 font-mono">/{slug}</p>
            <p className="text-base font-bold text-orange-600 mt-1.5">
              Giá niêm yết: {Number(price)?.toLocaleString('vi-VN')} đ / {unit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm pt-4 border-t border-slate-200">
          <div>
            <span className="text-slate-500">Danh mục đã chọn:</span>
            <p className="font-bold text-slate-900 text-base mt-0.5">
              {categoryIds.length} danh mục
            </p>
          </div>
          <div>
            <span className="text-slate-500">Tổng biến thể:</span>
            <p className="font-bold text-emerald-600 text-base mt-0.5">
              {variants.length} biến thể
            </p>
          </div>
          <div>
            <span className="text-slate-500">Tổng tồn kho dự kiến:</span>
            <p className="font-bold text-emerald-600 text-base mt-0.5">
              {hasInitialStock ? totalCalculatedStock : (isEdit ? totalCalculatedStock : 0)} {unit}
            </p>
          </div>
        </div>

        {/* Inbound Ticket Preview Card */}
        {!isEdit && (
          <div className="pt-4 border-t border-slate-100">
            {inboundAction === 'DIRECT_IMPORT' && hasInitialStock && supplierName ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Lập phiếu nhập kho nhanh trực tiếp (PNK) - Tự động cộng tồn kho ngay
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500">Nhà cung cấp:</span>{' '}
                    <strong className="text-slate-900">{supplierName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Tổng số lượng nhập:</span>{' '}
                    <strong className="text-emerald-700">{totalCalculatedStock} {unit}</strong>
                  </div>
                  {importNote && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Ghi chú phiếu:</span> {importNote}
                    </div>
                  )}
                </div>
              </div>
            ) : inboundAction === 'IMPORT_REQUEST' && hasInitialStock ? (
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <SendHorizontal className="w-4 h-4 text-blue-600" />
                  Gửi yêu cầu nhập kho (YCNK) - Bắn WebSocket realtime tới Quản lý kho
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-500">Quy trình:</span>{' '}
                    <strong className="text-blue-900">Ban quản lý kho kiểm đếm thực tế & duyệt</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Tổng số lượng đề xuất:</span>{' '}
                    <strong className="text-blue-700">{totalCalculatedStock} {unit}</strong>
                  </div>
                  {importNote && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Ghi chú gửi kho:</span> {importNote}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs text-slate-600">
                <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  Sản phẩm sẽ được tạo với tồn kho <strong>0</strong> (Chưa nhập kho). Bạn có thể lập phiếu nhập kho hoặc gửi yêu cầu sau.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
