'use client';

import React from 'react';
import { Contact } from '@/types/contact';
import { RichTextEditor } from '@/components/admin/product/RichTextEditor';
import { X, Mail, Send, Loader2, User, Phone, Clock, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReplyContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  replyMessage: string;
  onReplyMessageChange: (val: string) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
}

export function ReplyContactModal({
  isOpen,
  onClose,
  contact,
  replyMessage,
  onReplyMessageChange,
  loading,
  error,
  onSubmit,
}: ReplyContactModalProps) {
  if (!isOpen || !contact) return null;

  const isAlreadyReplied = contact.status === 'replied';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              isAlreadyReplied ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
            }`}>
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{isAlreadyReplied ? 'Chi Tiết Phản Hồi Liên Hệ' : 'Phản Hồi Thắc Mắc Khách Hàng'}</span>
                {isAlreadyReplied && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Đã phản hồi
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAlreadyReplied
                  ? 'Thông tin chi tiết nội dung đã phản hồi qua email cho khách hàng'
                  : 'Câu trả lời sẽ được gửi trực tiếp đến hộp thư Email của khách hàng qua Spring Mail'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Banner notification if already replied */}
          {isAlreadyReplied && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Yêu cầu liên hệ này đã được phản hồi hoàn tất!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Đã gửi Email vào lúc <strong className="font-mono">{formatDate(contact.repliedAt)}</strong>
                  {contact.repliedByName && <> bởi nhân viên <strong>{contact.repliedByName}</strong></>}.
                </p>
              </div>
            </div>
          )}

          {/* Customer Metadata Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <User className="w-4 h-4 text-orange-500" />
                <span>{contact.name}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-orange-500" />
                  {contact.email}
                </span>
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    {contact.phone}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(contact.createdAt)}</span>
              </div>
            </div>

            {/* Original Question Content */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                <span>Nội dung khách hàng đã gửi:</span>
              </label>
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium whitespace-pre-wrap leading-relaxed shadow-2xs">
                "{contact.message}"
              </div>
            </div>
          </div>

          {/* Reply Content: Read-Only HTML if already replied, else RichTextEditor */}
          {isAlreadyReplied ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Nội dung email đã phản hồi khách hàng:</span>
              </label>

              <div
                className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 prose prose-slate max-w-none shadow-2xs leading-relaxed overflow-x-auto min-h-[120px]"
                dangerouslySetInnerHTML={{ __html: contact.replyMessage || '<p className="text-slate-400 italic">Chưa có nội dung phản hồi.</p>' }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-orange-500" />
                <span>Nội dung phản hồi Email (Rich Text HTML Editor):</span>
              </label>

              <RichTextEditor
                value={replyMessage}
                onChange={onReplyMessageChange}
                error={error}
              />

              {error && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1 animate-fade-in pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {isAlreadyReplied ? (
            <>
              <span className="text-xs text-slate-400 font-medium italic">
                * Phiếu liên hệ này đã hoàn tất (không cho phép gửi lại).
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={onSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Đang gửi Email phản hồi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi Email Phản Hồi Khách Hàng</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
