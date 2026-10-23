'use client';

import React from 'react';
import Link from 'next/link';
import {
  Headphones,
  SendHorizontal,
  Image as ImageIcon,
  X,
  Star,
  Loader2,
  Clock,
  CheckCircle2,
  Lock,
  User,
  ShieldCheck,
  ShieldAlert,
  Maximize2,
  History,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { useCustomerSupportChat } from '@/hooks/useCustomerSupportChat';

export default function LiveSupportTabUI() {
  const {
    isAuthenticated,
    authLoading,
    conversation,
    messages,
    isLoading,
    isSending,
    isUploadingImage,
    inputText,
    setInputText,
    ratingStars,
    setRatingStars,
    feedbackNote,
    setFeedbackNote,
    isSubmittingRating,
    previewModalImg,
    setPreviewModalImg,
    errorMessage,
    selectedImagePreview,
    messagesEndRef,
    handleSelectImage,
    clearSelectedImage,
    handleFormSubmit,
    handleRatingSubmit,
    startNewConversation,
    // Lịch sử
    isViewingHistory,
    historyList,
    isLoadingHistory,
    selectedHistoryConv,
    historyMessages,
    openHistory,
    viewHistoryItem,
    closeHistory,
  } = useCustomerSupportChat();

  // 1. Loading kiểm tra phiên
  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
        <p className="text-xs">Đang kiểm tra thông tin tài khoản...</p>
      </div>
    );
  }

  // 2. Nếu chưa đăng nhập: Hiển thị Prompt Đăng Nhập
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/30 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-[280px]">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Yêu cầu Đăng Nhập Tài Khoản
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Để đảm bảo tính bảo mật, hỗ trợ tra cứu đơn hàng cá nhân và ngăn ngừa vi phạm, vui lòng đăng nhập trước khi kết nối trực tiếp với chuyên viên.
          </p>
        </div>
        <Link
          href="/login?redirect=support"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <User className="w-4 h-4" />
          <span>Đăng nhập ngay</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Hệ thống bảo vệ quyền riêng tư AP Sports</span>
        </div>
      </div>
    );
  }

  // 3. MÀN HÌNH XEM LỊCH SỬ CÁC CA TRÒ CHUYỆN CỦA KHÁCH
  if (isViewingHistory) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60 dark:bg-slate-950/40">
        {/* Header Lịch sử */}
        <div className="px-3 py-2 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs backdrop-blur-xs">
          <button
            type="button"
            onClick={closeHistory}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-orange-500 font-medium cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại cuộc trò chuyện</span>
          </button>
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
            Lịch sử hỗ trợ
          </span>
        </div>

        {/* Nội dung lịch sử: Chi tiết ca đã chọn hoặc Danh sách các ca */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
          {isLoadingHistory && (
            <div className="flex items-center justify-center py-8 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang tải lịch sử...
            </div>
          )}

          {/* Chi tiết ca lịch sử đã chọn */}
          {!isLoadingHistory && selectedHistoryConv && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedHistoryConv.subject}
                  </span>
                  {selectedHistoryConv.rating && (
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {selectedHistoryConv.rating}★
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  {new Date(selectedHistoryConv.createdAt).toLocaleString('vi-VN')}
                </p>
                {selectedHistoryConv.feedbackNote && (
                  <p className="text-[10px] italic text-slate-500">
                    &ldquo;{selectedHistoryConv.feedbackNote}&rdquo;
                  </p>
                )}
              </div>

              {/* Danh sách tin nhắn của ca này */}
              <div className="space-y-2">
                {historyMessages.map((msg) => {
                  const isUser = msg.senderRole === 'CUSTOMER';
                  const isSystem = msg.senderRole === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-1.5">
                        <span className="text-[10px] bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-3 py-0.5 rounded-full text-center max-w-[90%]">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                        }`}
                      >
                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                        {msg.attachmentUrl && (
                          <img
                            src={msg.attachmentUrl}
                            alt="Ảnh"
                            className="mt-1.5 max-h-40 rounded-lg cursor-pointer"
                            onClick={() => setPreviewModalImg(msg.attachmentUrl || null)}
                          />
                        )}
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            isUser ? 'text-orange-100' : 'text-slate-400'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Danh sách các ca trong lịch sử */}
          {!isLoadingHistory && !selectedHistoryConv && (
            historyList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                <p>Bạn chưa có cuộc trò chuyện nào trong lịch sử</p>
              </div>
            ) : (
              historyList.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => viewHistoryItem(conv)}
                  className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {conv.subject}
                    </span>
                    {conv.rating ? (
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {conv.rating}★
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {conv.status === 'RESOLVED' ? 'Đã hoàn tất' : 'Đã đóng'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(conv.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    {conv.staffName && (
                      <span>Chuyên viên: {conv.staffName}</span>
                    )}
                  </div>
                </button>
              ))
            )
          )}
        </div>
      </div>
    );
  }

  // 4. MÀN HÌNH CHAT LIVE THƯỜNG
  const isResolvedOrClosed =
    conversation?.status === 'RESOLVED' || conversation?.status === 'CLOSED';
  const hasRated = conversation?.rating !== null && conversation?.rating !== undefined;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60 dark:bg-slate-950/40 relative">
      {/* Status Bar */}
      <div className="px-3 py-2 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs backdrop-blur-xs">
        <div className="flex items-center gap-2">
          {!conversation ? (
            <>
              <Headphones className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                Tư vấn viên AP Sports
              </span>
            </>
          ) : conversation.status === 'WAITING' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> Đang chờ chuyên viên tiếp nhận...
              </span>
            </>
          ) : conversation.status === 'IN_PROGRESS' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                {conversation.staffName
                  ? `Chuyên viên: ${conversation.staffName}`
                  : 'Đã kết nối với chuyên viên tư vấn'}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 text-[11px]">Ca hỗ trợ đã hoàn tất</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {conversation?.orderCode ? (
            <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-mono">
              Đơn #{conversation.orderCode}
            </span>
          ) : !conversation ? (
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
              Trực tuyến
            </span>
          ) : null}

          {/* Nút Xem Lịch Sử Các Ca Trước */}
          <button
            type="button"
            onClick={openHistory}
            className="p-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Xem lại lịch sử các ca hỗ trợ"
          >
            <History className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scrollable Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
        {isLoading && (
          <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang tải dữ liệu...
          </div>
        )}

        {/* Khách chưa có tin nhắn nào hoặc chưa tạo ca */}
        {!isLoading && (!conversation || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center shadow-inner">
              <Headphones className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-[260px]">
              <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                Chào bạn! Bạn cần tư vấn về điều gì?
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Nhập tin nhắn hoặc đính kèm ảnh bên dưới để kết nối trực tiếp với đội ngũ chuyên viên của AP Sports.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.senderRole === 'CUSTOMER';
          const isSystem = msg.senderRole === 'SYSTEM';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-[10px] bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-center max-w-[90%] leading-relaxed">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar Tư vấn viên: Logo AP Sports chính thức */}
              {!isUser && (
                <div
                  className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 border border-orange-400/40 shadow-xs text-[10px] font-black tracking-tight"
                  title="AP Sports Support"
                >
                  AP
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-none'
                }`}
              >
                {!isUser && (
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mb-0.5 flex items-center gap-1">
                    <span>AP Sports Support</span>
                    {msg.senderName && (
                      <span className="text-[9px] font-normal text-slate-400">({msg.senderName})</span>
                    )}
                  </p>
                )}

                {msg.isViolation ? (
                  <div className={`p-2 rounded-xl text-xs italic flex items-center gap-1.5 ${
                    isUser ? 'bg-orange-600/60 text-white/90' : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                    <span>{msg.content || msg.maskedContent || '[Tin nhắn đã bị ẩn do vi phạm chuẩn mực ngôn từ]'}</span>
                  </div>
                ) : (
                  msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {msg.attachmentUrl && (
                  <div className="mt-1.5 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 relative group">
                    <img
                      src={msg.attachmentUrl}
                      alt="Ảnh đính kèm"
                      className="max-h-48 w-auto object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setPreviewModalImg(msg.attachmentUrl || null)}
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewModalImg(msg.attachmentUrl || null)}
                      className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Phóng to ảnh"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <span
                  className={`block text-[9px] mt-1 text-right ${
                    isUser ? 'text-orange-100' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Khung đánh giá dịch vụ khi ca hoàn tất */}
        {isResolvedOrClosed && !hasRated && (
          <div className="p-3.5 my-2 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-transparent border border-orange-300 dark:border-orange-800 text-center space-y-2.5">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Chuyên viên đã hoàn tất hỗ trợ. Quý khách vui lòng đánh giá chất lượng phục vụ:
            </p>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingStars(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= ratingStars
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <form onSubmit={handleRatingSubmit} className="space-y-2">
              <input
                type="text"
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Góp ý thêm về chuyên viên (không bắt buộc)..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500"
              />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingRating ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                </button>
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Bỏ qua
                </button>
              </div>
            </form>
          </div>
        )}

        {hasRated && (
          <div className="p-3 my-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-600 dark:text-emerald-400 space-y-2">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Cảm ơn quý khách! Bạn đã đánh giá {conversation?.rating} sao cho ca hỗ trợ này.</span>
            </div>
            <button
              type="button"
              onClick={startNewConversation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-xs transition-all cursor-pointer"
            >
              Bắt đầu cuộc trò chuyện mới
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview */}
      {selectedImagePreview && (
        <div className="p-2 px-3 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={selectedImagePreview}
              alt="Preview"
              className="w-10 h-10 object-cover rounded-lg border border-orange-500/40"
            />
            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
              Sẵn sàng tải lên Cloudinary
            </span>
          </div>
          <button
            type="button"
            onClick={clearSelectedImage}
            className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Hủy ảnh"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="px-3 py-1.5 bg-red-500/10 dark:bg-red-950/40 border-t border-red-500/30 text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Bar */}
      <footer className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        {isResolvedOrClosed && !hasRated ? (
          <div className="py-1 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ca hỗ trợ đã hoàn tất. Quý khách vui lòng đánh giá dịch vụ bên trên.
            </p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="flex items-end gap-2">
            <label
              htmlFor="support-chat-image-input"
              className="w-9 h-9 mb-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
              title="Đính kèm hình ảnh trao đổi"
            >
              <ImageIcon className="w-4 h-4" />
              <input
                id="support-chat-image-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleSelectImage}
                className="hidden"
                disabled={isSending || isUploadingImage}
              />
            </label>

            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (inputText.trim() || selectedImagePreview) {
                    handleFormSubmit(e);
                  }
                }
              }}
              placeholder={
                isUploadingImage
                  ? 'Đang nén & tải ảnh lên Cloudinary...'
                  : !conversation
                  ? 'Nhập tin nhắn để kết nối với tư vấn viên...'
                  : 'Nhắn tin (Enter để gửi, Shift+Enter xuống dòng)...'
              }
              disabled={isSending || isUploadingImage}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 dark:focus:border-orange-500 transition-colors resize-none min-h-[38px] max-h-28 overflow-y-auto"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !selectedImagePreview) || isSending || isUploadingImage}
              className="w-9 h-9 mb-0.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              title="Gửi tin nhắn"
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
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={previewModalImg}
              alt="Phóng to"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewModalImg(null)}
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
