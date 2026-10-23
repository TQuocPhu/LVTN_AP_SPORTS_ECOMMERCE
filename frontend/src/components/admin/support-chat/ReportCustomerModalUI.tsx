'use client';

import React from 'react';
import {
  AlertTriangle,
  X,
  Upload,
  Loader2,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  isReporting: boolean;
  customerName: string;
  reason: string;
  files: File[];
  previews: string[];
  errorMessage?: string | null;
  onReasonChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onQuickReasonSelect?: (reason: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const QUICK_VIOLATION_REASONS = [
  'Xúc phạm, lăng mạ nhân viên tư vấn',
  'Quấy rối, đe dọa nhân phẩm',
  'Spam tin nhắn rác liên tục',
  'Lừa đảo, gạ giao dịch chuyển khoản ngoài shop',
];

export default function ReportCustomerModalUI({
  isOpen,
  isReporting,
  customerName,
  reason,
  files,
  previews,
  errorMessage,
  onReasonChange,
  onQuickReasonSelect,
  onFileChange,
  onRemoveFile,
  onClose,
  onSubmit,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Modal báo cáo vi phạm khách hàng"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none"
    >
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-sm text-red-950">Báo Cáo Khách Hàng Vi Phạm</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isReporting}
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Bạn đang báo cáo hành vi của khách hàng{' '}
              <span className="font-bold text-slate-800">{customerName}</span>. Báo cáo này sẽ gửi trực tiếp đến Quản trị viên (Admin) qua WebSocket để Admin xem xét xử lý/khóa tài khoản.
            </p>
          </div>

          {/* Lý do */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="report-reason" className="block text-xs font-semibold text-slate-700">
                Lý do vi phạm <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-500" /> Chọn nhanh lý do
              </span>
            </div>

            {/* Quick Reason Chips */}
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {QUICK_VIOLATION_REASONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onQuickReasonSelect?.(preset)}
                  disabled={isReporting}
                  className="px-2.5 py-1 text-[11px] font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200/80 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Bấm để tự động điền lý do này"
                >
                  <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              id="report-reason"
              rows={3}
              value={reason}
              onChange={onReasonChange}
              placeholder="Mô tả cụ thể hành vi vi phạm (ví dụ: dùng từ ngữ xúc phạm, quấy rối, spam, đe dọa...)..."
              disabled={isReporting}
              className="w-full p-3 rounded-xl text-xs bg-slate-50 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-red-500 transition-colors"
            />
          </div>

          {/* Đính kèm ảnh bằng chứng (Cloudinary Storage: ap-sports-e-commerce/support-chat/reports/) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Ảnh bằng chứng vi phạm ({files.length}/3)
              </span>
              <span className="text-[11px] text-slate-400">Tối đa 3 ảnh JPEG/PNG</span>
            </div>

            {/* Previews */}
            {previews.length > 0 && (
              <div className="flex items-center gap-3">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
                    <img src={src} alt="Bằng chứng" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveFile(idx)}
                      disabled={isReporting}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Button: Chỉ hiện khi chưa đủ 3 ảnh */}
            {files.length < 3 && (
              <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer transition-colors text-slate-500">
                <Upload className="w-5 h-5 mb-1 text-slate-400" />
                <span className="text-xs">Bấm để tải ảnh bằng chứng vi phạm ({files.length}/3)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Lưu vào Cloudinary reports/
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={onFileChange}
                  disabled={isReporting}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isReporting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-150 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isReporting || !reason.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white shadow-md shadow-red-600/30 transition-all cursor-pointer"
            >
              {isReporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Gửi Báo Cáo Cho Admin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
