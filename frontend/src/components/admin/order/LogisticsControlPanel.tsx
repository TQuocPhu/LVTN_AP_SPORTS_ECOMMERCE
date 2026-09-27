'use client';

import React from 'react';
import {
  CheckCircle2,
  PackageCheck,
  XCircle,
  Truck,
  ExternalLink,
  ShieldCheck,
  Clock,
  Warehouse,
  Package,
} from 'lucide-react';
import { OrderStatus } from '@/types/order';

interface LogisticsControlPanelProps {
  currentStatus: string;
  trackingCode?: string;
  onUpdateStatus: (newStatus: OrderStatus, note?: string) => Promise<void>;
  onProgressChange?: (progress: number) => void;
  updating?: boolean;
}

export function LogisticsControlPanel({
  currentStatus,
  trackingCode,
  onUpdateStatus,
  updating = false,
}: LogisticsControlPanelProps) {
  const status = currentStatus?.toLowerCase() || '';

  const isPending = status === 'pending';
  const isConfirmed = status === 'confirmed';
  const isProcessing = status === 'processing';
  const isShippedOrShipping = status === 'shipped' || status === 'shipping';
  const isDelivered = status === 'delivered' || status === 'completed';
  const isCancelled = status === 'cancelled';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center gap-2 font-black uppercase text-xs text-slate-900">
          <Truck className="w-4 h-4 text-orange-600" />
          <span>Bảng Điều Phối Đơn Hàng & Vận Chuyển AP Sports</span>
        </div>

        {trackingCode && (
          <span className="font-mono text-[11px] font-bold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded border border-cyan-300">
            Vận đơn: {trackingCode}
          </span>
        )}
      </div>

      {/* State Machine Action Buttons for Admin / Staff */}
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

          {/* Action 2: Pack & Export Store Warehouse (Only for confirmed) */}
          {isConfirmed && (
            <button
              type="button"
              disabled={updating}
              onClick={() =>
                onUpdateStatus('processing', 'Đơn hàng đang được đóng gói xuất kho AP Sports')
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{updating ? 'Đang Xử Lý...' : 'Xuất Kho AP Sports (Đóng Gói)'}</span>
            </button>
          )}

          {/* Action 3: Cancel Order (Only if not yet shipped) */}
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
          <span>Phân Định Trách Nhiệm Logistics Thực Tế (Clean Logistics Pipeline)</span>
        </div>
        <p className="text-[11px] text-amber-800 leading-relaxed">
          - <strong>Chủ Shop AP Sports</strong> thực hiện <i>Xác Nhận Đơn</i> $\rightarrow$ <i>Xuất Kho Đóng Gói</i>.<br />
          - <strong>Bưu Cục GHN & Shipper</strong> điều phối chuyến xe giao hàng và cập nhật vị trí GPS trên hệ thống.<br />
          - Admin và Khách Hàng xem trực tiếp vị trí xe di chuyển real-time trên bản đồ OSRM bên dưới.
        </p>
      </div>
    </div>
  );
}
