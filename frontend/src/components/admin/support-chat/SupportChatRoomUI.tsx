'use client';

import React from 'react';
import {
  SendHorizontal,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Maximize2,
  MessageSquareOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { SupportConversation, SupportMessage } from '@/types/support-chat';

interface Props {
  conversation: SupportConversation | null;
  messages: SupportMessage[];
  inputText: string;
  previewModalImg: string | null;
  isLoadingMessages: boolean;
  isSending: boolean;
  isUploadingImage: boolean;
  isResolving: boolean;
  selectedImagePreview: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  // AI Smart Reply props (Agent 5)
  aiSuggestions?: string[];
  isLoadingAiSuggestions?: boolean;
  onFetchAiSuggestions?: () => void;
  onApplyAiSuggestion?: (suggestion: string) => void;
  // Content Moderation & Báo Cáo Nhanh
  revealedMessageIds?: Record<number, boolean>;
  onToggleRevealOriginalContent?: (msgId: number) => void;
  onQuickReport?: (msg: SupportMessage) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onOpenPreviewModal: (url: string | null) => void;
  onClosePreviewModal: () => void;
  onSelectImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onOpenResolveModal: () => void;
  onOpenReportModal: () => void;
}

export default function SupportChatRoomUI({
  conversation,
  messages,
  inputText,
  previewModalImg,
  isLoadingMessages,
  isSending,
  isUploadingImage,
  isResolving,
  selectedImagePreview,
  messagesEndRef,
  aiSuggestions,
  isLoadingAiSuggestions,
  onFetchAiSuggestions,
  onApplyAiSuggestion,
  revealedMessageIds = {},
  onToggleRevealOriginalContent,
  onQuickReport,
  onInputChange,
  onOpenPreviewModal,
  onClosePreviewModal,
  onSelectImage,
  onClearImage,
  onSubmit,
  onOpenResolveModal,
  onOpenReportModal,
}: Props) {
  const [isAiSuggestionsOpen, setIsAiSuggestionsOpen] = React.useState(true);

  React.useEffect(() => {
    if (aiSuggestions && aiSuggestions.length > 0) {
      setIsAiSuggestionsOpen(true);
    }
  }, [aiSuggestions]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-500">
        <MessageSquareOff className="w-12 h-12 mb-3 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">Chưa chọn cuộc trò chuyện nào</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Vui lòng chọn một khách hàng từ danh sách &ldquo;Đang phụ trách&rdquo; hoặc bấm tiếp nhận ca mới từ &ldquo;Hàng đợi&rdquo;.
        </p>
      </div>
    );
  }

  const isClosed = conversation.status === 'RESOLVED' || conversation.status === 'CLOSED';

  return (
    <div className="flex-1 min-w-0 flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Room Header */}
      <header className="p-3.5 px-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-200 overflow-hidden shadow-2xs shrink-0">
            {conversation.customerAvatar ? (
              <img src={conversation.customerAvatar} alt={conversation.customerName} className="w-full h-full object-cover" />
            ) : (
              <span>{conversation.customerName ? conversation.customerName.charAt(0).toUpperCase() : 'K'}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800">{conversation.customerName}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-600 border border-slate-200">
                Ca #{conversation.id}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  conversation.status === 'IN_PROGRESS'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : conversation.status === 'WAITING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : conversation.status === 'RESOLVED'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {conversation.status === 'IN_PROGRESS'
                  ? 'Đang hỗ trợ'
                  : conversation.status === 'WAITING'
                  ? 'Chờ tiếp nhận'
                  : conversation.status === 'RESOLVED'
                  ? 'Đã hoàn tất'
                  : conversation.status === 'CLOSED'
                  ? 'Đã đóng ca'
                  : conversation.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[260px]">
              {conversation.customerEmail}
            </p>
          </div>
        </div>

        {/* Action Controls: Report & Resolve */}
        <div className="flex items-center gap-2">
          {/* Nút Báo Cáo Vi Phạm (Chỉ Staff/Admin) */}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all cursor-pointer shadow-2xs hover:border-red-300"
            title="Báo cáo khách hàng vi phạm lên Ban Quản Trị"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Báo Cáo Vi Phạm</span>
          </button>

          {/* Nút Hoàn Tất Ca */}
          {!isClosed && (
            <button
              type="button"
              onClick={onOpenResolveModal}
              disabled={isResolving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Đánh dấu hoàn tất ca hỗ trợ"
            >
              {isResolving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Hoàn Tất Ca</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-slate-100/50">
        {isLoadingMessages && (
          <div className="flex items-center justify-center py-8 text-slate-500 text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2 text-orange-600" /> Đang tải lịch sử trò chuyện...
          </div>
        )}

        {messages.map((msg) => {
          const isStaff = msg.senderRole === 'STAFF';
          const isSystem = msg.senderRole === 'SYSTEM';
          const isMsgViolation = Boolean(
            msg.isViolation ||
            (msg as any).violation ||
            (msg.content && msg.content.includes('[Tin nhắn đã bị ẩn do vi phạm chuẩn mực ngôn từ]'))
          );

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-[11px] bg-slate-200/90 text-slate-600 px-3.5 py-1 rounded-full text-center max-w-[85%] border border-slate-300/60 shadow-2xs">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isStaff ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar Khách Hàng (khi khách nhắn) */}
              {!isStaff && (
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-200 shadow-2xs">
                  {msg.senderAvatar || conversation.customerAvatar ? (
                    <img
                      src={msg.senderAvatar || conversation.customerAvatar}
                      alt={conversation.customerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{conversation.customerName ? conversation.customerName.charAt(0).toUpperCase() : 'K'}</span>
                  )}
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isStaff
                    ? 'bg-orange-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                }`}
              >
                {!isStaff && (
                  <div className="text-[10px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    <span className="font-bold text-slate-800">{conversation.customerName}</span>
                    <span className="text-slate-400 font-normal">({conversation.customerEmail})</span>
                  </div>
                )}

                {isStaff && (
                  <div className="text-[10px] font-semibold text-orange-200 mb-1 text-right">
                    {msg.senderName || 'Bạn (Nhân viên tư vấn)'}
                  </div>
                )}

                {/* Banner cảnh báo nếu tin nhắn vi phạm chuẩn mực ngôn từ */}
                {isMsgViolation && (
                  <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 border border-rose-200 text-rose-900 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-rose-700">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Vi phạm: {msg.violationReason || 'Chuẩn mực ngôn từ'}</span>
                      </div>

                      {/* 2 NÚT HÀNH ĐỘNG DÀNH CHO NHÂN VIÊN: XEM CHI TIẾT & BÁO CÁO NHANH */}
                      {!isStaff && (
                        <div className="flex items-center gap-1.5">
                          {/* NÚT 1: CON MẮT XEM CHI TIẾT VI PHẠM (CHỈ HIỂN THỊ KHI VI PHẠM) */}
                          <button
                            type="button"
                            onClick={() => onToggleRevealOriginalContent?.(msg.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                              revealedMessageIds[msg.id]
                                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                : 'bg-white text-rose-700 hover:bg-rose-100 border border-rose-300'
                            }`}
                            title="Bấm để xem trích xuất từ ngữ vi phạm bị chặn"
                          >
                            {revealedMessageIds[msg.id] ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                                <span>Ẩn chi tiết</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-rose-600" />
                                <span>Xem chi tiết vi phạm</span>
                              </>
                            )}
                          </button>

                          {/* NÚT 2: BÁO CÁO NHANH LÊN ADMIN */}
                          {onQuickReport && (
                            <button
                              type="button"
                              onClick={() => onQuickReport(msg)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                              title="Báo cáo nhanh tin nhắn vi phạm này tới Ban Quản Trị"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-white" />
                              <span>Báo cáo nhanh</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* KHUNG TRÍCH XUẤT NỘI DUNG GỐC CHỨA TỪ NGỮ BỊ BAN KHI BẤM CON MẮT */}
                    {revealedMessageIds[msg.id] && (
                      <div className="mt-2 pt-2 border-t border-rose-200 text-xs animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-2.5 rounded-lg bg-white border border-rose-300 text-rose-950 space-y-1 shadow-2xs">
                          <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Trích xuất từ ngữ bị cấm (Nội dung gốc):
                            </span>
                          </div>
                          <div className="p-2 rounded-md bg-rose-50 border border-rose-200 font-mono text-[13px] text-rose-950 font-semibold select-text">
                            {msg.originalContent || msg.content || '(Không có nội dung)'}
                          </div>
                          {msg.violationReason && (
                            <p className="text-[11px] text-slate-600 pt-0.5">
                              <span className="font-semibold text-rose-800">Lý do AI gắn cờ:</span> {msg.violationReason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hiển thị nội dung tin nhắn: không bị xuống dòng thừa */}
                {isMsgViolation ? (
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs italic flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{msg.maskedContent || '[Tin nhắn đã bị ẩn do vi phạm chuẩn mực ngôn từ]'}</span>
                  </div>
                ) : (
                  msg.content && <p className="whitespace-pre-wrap text-slate-800 break-words leading-relaxed">{msg.content.trim()}</p>
                )}

                {msg.attachmentUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 relative group">
                    <img
                      src={msg.attachmentUrl}
                      alt="Ảnh đính kèm"
                      className="max-h-60 w-auto object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => onOpenPreviewModal(msg.attachmentUrl || null)}
                    />
                    <button
                      type="button"
                      onClick={() => onOpenPreviewModal(msg.attachmentUrl || null)}
                      className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Giờ gửi tin nhắn */}
                <span
                  className={`block text-[9px] mt-1 text-right ${
                    isStaff ? 'text-orange-200' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Avatar Nhân viên / Admin (khi nhân viên nhắn) */}
              {isStaff && (
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-orange-500 shadow-2xs">
                  {msg.senderAvatar ? (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(msg.senderName || 'NV').charAt(0).toUpperCase()}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview (Trước khi gửi) */}
      {selectedImagePreview && (
        <div className="p-2 px-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={selectedImagePreview}
              alt="Preview"
              className="w-11 h-11 object-cover rounded-lg border border-orange-500/50 shadow-xs"
            />
            <span className="text-xs text-slate-600 truncate max-w-[300px]">
              Ảnh đính kèm sẽ nén & lưu vào Cloudinary messages/
            </span>
          </div>
          <button
            type="button"
            onClick={onClearImage}
            className="w-7 h-7 rounded-full bg-white hover:bg-red-600 text-slate-600 hover:text-white border border-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Thanh gợi ý câu trả lời thông minh của AI (Agent 5) - Tách từng dòng, wrap tự nhiên, không tràn layout */}
      {!isClosed && (
        <div className="px-3.5 py-2.5 bg-gradient-to-b from-indigo-50/70 to-slate-50 border-t border-indigo-100/80 w-full min-w-0 transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={onFetchAiSuggestions}
                disabled={isLoadingAiSuggestions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
                title="Bấm để AI đọc ngữ cảnh cuộc trò chuyện và tạo 3 phương án trả lời"
              >
                <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isLoadingAiSuggestions ? 'animate-spin' : ''}`} />
                <span>{isLoadingAiSuggestions ? 'Đang tạo câu trả lời...' : 'AI Gợi Ý'}</span>
              </button>
              <span className="text-[11px] text-slate-500 font-medium truncate">
                {aiSuggestions && aiSuggestions.length > 0
                  ? 'Gợi ý phản hồi nhanh (nhấp để chọn):'
                  : 'Bấm nút để AI phân tích tin nhắn và gợi ý 3 phương án trả lời'}
              </span>
            </div>

            {aiSuggestions && aiSuggestions.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {aiSuggestions.length} phương án
                </span>
                <button
                  type="button"
                  onClick={() => setIsAiSuggestionsOpen(!isAiSuggestionsOpen)}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title={isAiSuggestionsOpen ? 'Thu gọn' : 'Mở rộng'}
                >
                  {isAiSuggestionsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Danh sách 3 câu trả lời tách thành từng dòng riêng biệt, tự wrap không vỡ giao diện */}
          {aiSuggestions && aiSuggestions.length > 0 && isAiSuggestionsOpen && (
            <div className="flex flex-col gap-1.5 mt-2.5 w-full min-w-0 max-h-48 overflow-y-auto pr-1">
              {aiSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onApplyAiSuggestion && onApplyAiSuggestion(sug)}
                  className="w-full text-left p-2.5 rounded-lg bg-white border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-950 transition-all shadow-2xs flex items-start gap-2.5 group cursor-pointer min-w-0"
                  title="Nhấp để áp dụng câu trả lời vào ô soạn thảo"
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                    Gợi ý {idx + 1}
                  </span>
                  <span className="text-xs leading-relaxed whitespace-normal break-words flex-1 min-w-0 font-normal text-slate-700 group-hover:text-slate-900">
                    {sug}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                    Chọn ↵
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat Input Bar */}
      <footer className="p-3 bg-white border-t border-slate-200 shadow-2xs">
        {isClosed ? (
          <div className="py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-1">
            <p className="text-xs text-slate-600 font-medium">
              Ca hỗ trợ này đã hoàn tất. Bạn đang xem lại toàn bộ lịch sử trao đổi.
            </p>
            {conversation.rating && (
              <p className="text-[11px] text-amber-600 font-semibold flex items-center justify-center gap-1">
                <span>Khách hàng đánh giá: {conversation.rating}★</span>
                {conversation.feedbackNote && (
                  <span className="text-slate-500 font-normal">({conversation.feedbackNote})</span>
                )}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <label
              htmlFor="staff-support-image-input"
              className="w-10 h-10 mb-0.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer border border-slate-200 transition-colors"
              title="Đính kèm ảnh minh họa cho khách"
            >
              <ImageIcon className="w-4 h-4" />
              <input
                id="staff-support-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onSelectImage}
                className="hidden"
                disabled={isSending || isUploadingImage}
              />
            </label>

            <textarea
              rows={1}
              value={inputText}
              onChange={onInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (inputText.trim() || selectedImagePreview) {
                    onSubmit(e);
                  }
                }
              }}
              placeholder={
                isUploadingImage
                  ? 'Đang nén & tải ảnh lên Cloudinary...'
                  : 'Nhập tin nhắn phản hồi (Enter gửi, Shift+Enter xuống dòng)...'
              }
              disabled={isSending || isUploadingImage}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-orange-500 transition-colors resize-none min-h-[42px] max-h-32 overflow-y-auto"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImagePreview) || isSending || isUploadingImage}
              className="w-10 h-10 mb-0.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all shadow-md shadow-orange-600/20 cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              title="Gửi phản hồi"
            >
              {isSending || isUploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SendHorizontal className="w-4 h-4" />
              )}
            </button>
          </form>
        )}
      </footer>

      {/* Modal Phóng To Ảnh */}
      {previewModalImg && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={onClosePreviewModal}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewModalImg}
              alt="Phóng to"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={onClosePreviewModal}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-orange-500 transition-colors shadow-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
