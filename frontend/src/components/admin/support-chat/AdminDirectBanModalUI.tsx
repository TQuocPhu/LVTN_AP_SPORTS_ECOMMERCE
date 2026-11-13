'use client';

import React from 'react';
import { ShieldAlert, X, AlertTriangle, Loader2, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  isBanning: boolean;
  customerName?: string;
  customerEmail?: string;
  customerId?: number;
  reason: string;
  errorMessage?: string | null;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Pure Presentation Modal dành riêng cho Ban Quản Trị (Admin) chủ động Khóa Tài Khoản khách hàng
 * khi phát hiện hành vi vi phạm nghiêm trọng trong cuộc trò chuyện hỗ trợ trực tiếp.
 * Tuân thủ Layer Architecture: Không chứa useState/useEffect nội bộ.
 */
export default function AdminDirectBanModalUI({
  isOpen,
  isBanning,
  customerName = 'Khách hàng',
  customerEmail,
  customerId,
  reason,
  errorMessage,
  onReasonChange,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-4 px-6 bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Khóa Tài Khoản Khách Hàng (Admin)
              </h3>
              <p className="text-xs text-slate-500">
                Xử phạt trực tiếp hành vi vi phạm chuẩn mực của khách hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBanning}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung xác nhận */}
        <div className="p-6 space-y-4">
          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Thông tin đối tượng bị khóa */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">
                Khách hàng bị xử phạt:
              </span>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{customerName}</span>
              </p>
              {customerEmail && (
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">{customerEmail}</p>
              )}
            </div>
            {customerId && (
              <span className="px-2 py-1 rounded-md bg-slate-200/70 font-mono font-bold text-[11px] text-slate-700">
                ID #{customerId}
              </span>
            )}
          </div>

          {/* Hộp cảnh báo hậu quả */}
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-red-900 text-xs leading-relaxed">
            <p className="font-bold mb-1 flex items-center gap-1 text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              Lưu ý quan trọng:
            </p>
            <p>
              Hành động này sẽ chuyển trạng thái tài khoản của khách hàng sang{' '}
              <span className="font-bold uppercase underline">BANNED</span> (bị cấm đăng nhập và mua sắm), đồng thời tự động kết thúc phiên trò chuyện tư vấn hiện tại.
            </p>
          </div>

          {/* Nhập lý do khóa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lý do xử phạt / khóa tài khoản:
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Nhập lý do khách hàng vi phạm (Ví dụ: Ngôn từ xúc phạm, đe dọa, spam nội dung cấm...)..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isBanning}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isBanning}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50"
          >
            {isBanning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>Xác Nhận Khóa Tài Khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}

