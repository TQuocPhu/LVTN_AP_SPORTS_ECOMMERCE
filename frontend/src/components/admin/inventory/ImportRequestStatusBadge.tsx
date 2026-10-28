import React from 'react';
import { ImportRequestStatus } from '@/types/import-request';
import { Clock, CheckCircle2, XCircle, PackageCheck } from 'lucide-react';

interface ImportRequestStatusBadgeProps {
  status: ImportRequestStatus;
}

/**
 * Component hiển thị nhãn trạng thái của Yêu Cầu Nhập Kho
 */
export function ImportRequestStatusBadge({ status }: ImportRequestStatusBadgeProps) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
          Chờ duyệt
        </span>
      );
    case 'APPROVED':
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Đã nhập kho
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Bị từ chối
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
}

