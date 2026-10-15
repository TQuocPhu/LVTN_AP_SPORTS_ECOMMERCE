'use client';

import React from 'react';
import {
  CheckCircle2,
  X,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  isResolving: boolean;
  conversationId?: number;
  customerName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResolveConversationModalUI({
  isOpen,
  isResolving,
  conversationId,
  customerName,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Modal xác nhận hoàn tất ca hỗ trợ"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none"
    >
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-emerald-950">Hoàn Tất Ca Hỗ Trợ</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isResolving}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-base text-slate-800">
              Kết thúc ca tư vấn #{conversationId}?
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Bạn đang chuẩn bị hoàn tất ca hỗ trợ cho khách hàng{' '}
              <span className="font-semibold text-slate-800">{customerName || 'khách hàng'}</span>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2 text-left">
            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Sau khi xác nhận, phiên trò chuyện sẽ được chốt trạng thái <span className="font-semibold text-emerald-700">Đã hoàn tất</span> và hệ thống sẽ tự động gửi lời mời đánh giá chất lượng phục vụ tới khách hàng.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isResolving}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isResolving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isResolving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Xác Nhận Hoàn Tất</span>
          </button>
        </div>
      </div>
    </div>
  );
}
