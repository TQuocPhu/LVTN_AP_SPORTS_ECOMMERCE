'use client';

import React from 'react';
import {
  ShieldAlert,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  User,
  ExternalLink,
} from 'lucide-react';
import { SupportConversation } from '@/types/support-chat';

interface Props {
  isOpen: boolean;
  isProcessing: boolean;
  conversation: SupportConversation | null;
  banCustomer: boolean;
  adminNote: string;
  errorMessage?: string | null;
  onBanCustomerChange: (val: boolean) => void;
  onAdminNoteChange: (val: string) => void;
  onClose: () => void;
  onProcess: () => void;
  onReject: () => void;
  onOpenPreviewModal?: (url: string) => void;
}

/**
 * Pure Presentation Modal dành riêng cho Ban Quản Trị (Admin) xem xét và phê duyệt/bác bỏ
 * báo cáo vi phạm khách hàng do Nhân viên gửi lên.
 * Tuân thủ Layer Architecture: Không chứa useState/useEffect nội bộ.
 */
export default function AdminReportReviewModalUI({
  isOpen,
  isProcessing,
  conversation,
  banCustomer,
  adminNote,
  errorMessage,
  onBanCustomerChange,
  onAdminNoteChange,
  onClose,
  onProcess,
  onReject,
  onOpenPreviewModal,
}: Props) {
  if (!isOpen || !conversation) return null;

  const hasEvidence =
    conversation.pendingReportEvidenceUrls &&
    conversation.pendingReportEvidenceUrls.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-4 px-6 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Thẩm Tra Báo Cáo Vi Phạm
              </h3>
              <p className="text-xs text-slate-500">
                Xem xét bằng chứng và đưa ra quyết định xử phạt tài khoản khách hàng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung báo cáo */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Thông báo lỗi nếu có */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Khối tóm tắt thông tin đối tượng & người báo cáo */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">
                Khách hàng bị báo cáo:
              </span>
              <p className="font-bold text-slate-800">{conversation.customerName}</p>
              <p className="text-slate-500 font-mono text-[11px]">{conversation.customerEmail}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] mb-0.5 font-medium">
                Nhân viên gửi báo cáo:
              </span>
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{conversation.pendingReportedByStaffName || 'Nhân viên trực tổng đài'}</span>
              </p>
              {conversation.pendingReportCreatedAt && (
                <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(conversation.pendingReportCreatedAt).toLocaleString('vi-VN')}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Lý do báo cáo vi phạm */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nội dung & Lý do vi phạm do nhân viên cung cấp:
            </label>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-medium">
              {conversation.pendingReportReason || 'Không có mô tả chi tiết'}
            </div>
          </div>

          {/* Bằng chứng hình ảnh */}
          {hasEvidence && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Bằng chứng hình ảnh đính kèm ({conversation.pendingReportEvidenceUrls!.length} ảnh):
              </label>
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {conversation.pendingReportEvidenceUrls!.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative group w-24 h-24 rounded-xl overflow-hidden border border-slate-300 shrink-0 bg-slate-100 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                    onClick={() => onOpenPreviewModal?.(url)}
                    title="Bấm để phóng to xem rõ bằng chứng"
                  >
                    <img
                      src={url}
                      alt={`Bằng chứng vi phạm #${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tùy chọn khóa vĩnh viễn tài khoản */}
          <div className="p-3.5 rounded-xl bg-red-50/50 border border-red-200">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={banCustomer}
                onChange={(e) => onBanCustomerChange(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-red-900 block">
                  Khóa tài khoản khách hàng (Chuyển trạng thái sang BANNED)
                </span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  Khi kích hoạt, tài khoản của khách hàng sẽ bị cấm đăng nhập vĩnh viễn vào hệ thống, ca hỗ trợ này sẽ tự động đóng lại.
                </span>
              </div>
            </label>
          </div>

          {/* Ghi chú phản hồi của Admin */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú xử lý của Quản trị viên:
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => onAdminNoteChange(e.target.value)}
              placeholder="Nhập lý do phê duyệt hoặc lý do bác bỏ báo cáo (Bắt buộc khi bác bỏ để nhân viên nắm thông tin)..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2.5">
            {/* Nút Bác Bỏ Báo Cáo */}
            <button
              type="button"
              onClick={onReject}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-red-700 hover:border-red-300 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Bác Bỏ Báo Cáo</span>
            </button>

            {/* Nút Phê Duyệt & Xử Phạt */}
            <button
              type="button"
              onClick={onProcess}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Phê Duyệt Vi Phạm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

