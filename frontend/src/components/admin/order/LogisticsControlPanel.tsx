'use client';

import React from 'react';
import {
  CheckCircle2,
  PackageCheck,
  XCircle,
  Truck,
  ShieldCheck,
  Scan,
  AlertCircle,
  Check,
} from 'lucide-react';
import { OrderStatus } from '@/types/order';
import { AdminOrderDetail } from '@/types/admin-order';
import { useOrderPackingScanner } from '@/hooks/useOrderPackingScanner';
import { OrderPackingScannerModal } from './OrderPackingScannerModal';

interface LogisticsControlPanelProps {
  currentStatus: string;
  trackingCode?: string;
  order?: AdminOrderDetail | null;
  onUpdateStatus: (newStatus: OrderStatus, note?: string) => Promise<void>;
  onOrderRefresh?: (updatedOrder: AdminOrderDetail) => void;
  onProgressChange?: (progress: number) => void;
  updating?: boolean;
}

export function LogisticsControlPanel({
  currentStatus,
  trackingCode,
  order = null,
  onUpdateStatus,
  onOrderRefresh,
  updating = false,
}: LogisticsControlPanelProps) {
  const status = currentStatus?.toLowerCase() || '';

  const isPending = status === 'pending';
  const isConfirmed = status === 'confirmed';
  const isProcessing = status === 'processing';
  const isPackVerified = Boolean(order?.packVerified);

  // Hook quản lý máy quét kiểm đếm Barcode
  const scanner = useOrderPackingScanner({
    order,
    onSuccess: (updated) => {
      if (onOrderRefresh) {
        onOrderRefresh(updated);
      }
    },
  });

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center gap-2 font-black uppercase text-xs text-slate-900">
          <Truck className="w-4 h-4 text-orange-600" />
          <span>Bảng Điều Phối Đơn Hàng & Vận Chuyển AP Sports</span>
        </div>

        <div className="flex items-center gap-2">
          {isPackVerified && (
            <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã kiểm đếm Barcode {order?.packedByName ? `(Thủ kho: ${order.packedByName})` : '100%'}</span>
            </span>
          )}
          {trackingCode && (
            <span className="font-mono text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded border border-cyan-300">
              Vận đơn: {trackingCode}
            </span>
          )}
        </div>
      </div>

      {/* State Machine Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Action 1: Confirm Order (Only for pending) */}
          {isPending && (
            <button
              type="button"
              disabled={updating}
              onClick={() =>
                onUpdateStatus('confirmed', 'Nhân viên AP Sports đã xác nhận đơn hàng')
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{updating ? 'Đang Xử Lý...' : 'Xác Nhận Đơn Hàng'}</span>
            </button>
          )}

          {/* Action 2: Quét Barcode Đóng Gói (Chỉ khi đã Confirmed hoặc Processing) */}
          {(isConfirmed || isProcessing) && (
            <button
              type="button"
              onClick={scanner.openModal}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                isPackVerified
                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>{isPackVerified ? 'Xem Lại Kiểm Đếm Barcode' : '📦 Quét Barcode Đóng Gói'}</span>
            </button>
          )}

          {/* Action 3: Pack & Export Store Warehouse (Chỉ khi đã Confirmed và ĐÃ KIỂM ĐẾM BARCODE 100%) */}
          {isConfirmed && (
            <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
              <button
                type="button"
                disabled={updating || !isPackVerified}
                onClick={() =>
                  onUpdateStatus('processing', 'Đơn hàng đang được đóng gói xuất kho AP Sports')
                }
                title={
                  !isPackVerified
                    ? 'Yêu cầu quét kiểm đếm Barcode đủ 100% trước khi xuất kho'
                    : 'Xuất kho đơn hàng'
                }
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs shadow-md transition-all ${
                  isPackVerified
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>{updating ? 'Đang Xử Lý...' : 'Xuất Kho AP Sports (processing)'}</span>
              </button>

              {!isPackVerified && (
                <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Khóa: Cần quét Barcode trước khi xuất kho</span>
                </span>
              )}
            </div>
          )}

          {/* Action 4: Cancel Order (Only if not yet shipped) */}
          {(isPending || isConfirmed || isProcessing) && (
            <button
              type="button"
              disabled={updating}
              onClick={() =>
                onUpdateStatus('cancelled', 'Hủy đơn hàng bởi nhân viên quản trị AP Sports')
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Hủy Đơn</span>
            </button>
          )}
        </div>
      </div>

      {/* Guidance Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
        <div className="font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Quy Trình Kiểm Soát Xuất Kho Nghiêm Ngặt (WMS Fulfillment Pipeline)</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          - <strong>Bước 1</strong>: Admin/Staff <i>Xác Nhận Đơn Hàng</i> (`confirmed`).<br />
          - <strong>Bước 2</strong>: Bộ phận kho thực hiện <i>Quét Barcode kiểm đếm 100%</i> từng mặt hàng.<br />
          - <strong>Bước 3</strong>: Nút <i>Xuất Kho AP Sports</i> (`processing`) sẽ tự động mở khóa để bàn giao cho GHN.
        </p>
      </div>

      {/* Modal Quét Barcode Đóng Gói */}
      <OrderPackingScannerModal
        isOpen={scanner.isOpen}
        onClose={scanner.closeModal}
        order={order}
        scannedMap={scanner.scannedMap}
        manualCode={scanner.manualCode}
        onManualCodeChange={scanner.setManualCode}
        onScanCode={scanner.handleScanCode}
        onReset={scanner.handleReset}
        onSubmit={scanner.handleSubmit}
        note={scanner.note}
        onNoteChange={scanner.setNote}
        loading={scanner.loading}
        totalRequired={scanner.totalRequired}
        totalScanned={scanner.totalScanned}
        isAllScanned={scanner.isAllScanned}
        progressPercentage={scanner.progressPercentage}
      />
    </div>
  );
}
