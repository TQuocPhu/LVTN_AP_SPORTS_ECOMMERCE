'use client';

import React from 'react';
import {
  MessageCircle,
  X,
  SendHorizontal,
  Bot,
  User,
  Sparkles,
  Minus,
  CheckCircle2,
  ChevronUp,
} from 'lucide-react';
import { useChatbot, QUICK_PROMPTS } from '@/hooks/useChatbot';

export default function ChatbotWidgetUI() {
  const {
    isOpen,
    inputText,
    messages,
    isTyping,
    isScrolled,
    messagesEndRef,
    setInputText,
    toggleChatbot,
    closeChatbot,
    selectQuickPrompt,
    smoothScrollToTop,
    handleSubmit,
  } = useChatbot();

  return (
    <aside
      aria-label="Cụm nút hỗ trợ người dùng & Trợ lý ảo"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-end gap-3.5"
    >
      {/* ========================================================
          1. CỬA SỔ KHUNG CHAT (MỞ NGANG SANG BÊN TRÁI CỤM NÚT)
         ======================================================== */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Cửa sổ trò chuyện AP Sports Assistant"
          className="w-[calc(100vw-5.5rem)] sm:w-[380px] md:w-[410px] h-[540px] sm:h-[560px] max-h-[85vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 animate-in fade-in slide-in-from-right-8"
        >
          {/* Header */}
          <header className="p-3.5 sm:p-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-xs sm:text-sm tracking-wide">AP Sports Assistant</h3>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                </div>
                <p className="text-[10px] sm:text-[11px] text-orange-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                  <span>Trợ lý AI thể thao 24/7</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={closeChatbot}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer text-white"
                title="Thu nhỏ"
                aria-label="Thu nhỏ"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={closeChatbot}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer text-white"
                title="Đóng hộp chat"
                aria-label="Đóng hộp chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* Body: Messages List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-slate-50/60 dark:bg-slate-950/40">
            {/* Quick Prompts Chips */}
            <div className="space-y-1.5 pt-0.5 pb-1.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Gợi ý nhanh cho bạn:
              </p>
              <div className="flex flex-col gap-1.5">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectQuickPrompt(prompt)}
                    className="text-left text-xs px-3 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-orange-400 dark:hover:border-orange-500 text-slate-700 dark:text-slate-200 transition-all shadow-2xs hover:translate-x-1 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Render Messages */}
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser ? 'text-orange-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-1.5 text-xs flex items-center space-x-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer: Input Bar */}
          <footer className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500 dark:focus:border-orange-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all shadow-md shadow-orange-500/20 cursor-pointer disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                title="Gửi câu hỏi"
                aria-label="Gửi câu hỏi"
              >
                <SendHorizontal className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1.5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Sẵn sàng kết nối AI
              </span>
              <span>AP Sports Storefront</span>
            </div>
          </footer>
        </div>
      )}

      {/* ========================================================
          2. CỘT DỌC 2 BUTTON BÊN PHẢI (CHATBOT TRÒN, TOP HÌNH THOI)
         ======================================================== */}
      <div className="flex flex-col items-center gap-3.5 shrink-0">
        {/* NÚT 1 (Ở TRÊN): NÚT NỔI CHATBOT TRÒN HOÀN HẢO */}
        <button
          type="button"
          onClick={toggleChatbot}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white shadow-xl shadow-orange-500/35 hover:shadow-orange-500/55 hover:scale-108 active:scale-95 transition-all duration-300 border-2 border-white/30 dark:border-white/20 cursor-pointer"
          aria-label={isOpen ? 'Đóng cửa sổ trợ lý ảo' : 'Mở trò chuyện với trợ lý ảo AP Sports'}
        >
          {/* Animated Ripple Pulse khi đóng */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-orange-400 opacity-25 group-hover:opacity-50 animate-ping -z-10" />
          )}

          {/* Icon toggle */}
          {isOpen ? (
            <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-orange-600 rounded-full" />
            </div>
          )}

          {/* Tooltip khi hover */}
          {!isOpen && (
            <span className="hidden sm:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-[11px] font-bold tracking-wide whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              AP Sports AI
            </span>
          )}
        </button>

        {/* NÚT 2 (Ở DƯỚI): NÚT BACK TO TOP HÌNH THOI (DIAMOND SHAPE) */}
        <div className="relative group p-1 flex items-center justify-center">
          <button
            type="button"
            onClick={smoothScrollToTop}
            className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rotate-45 rounded-lg bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl hover:-translate-y-1 active:scale-90 transition-all duration-300 cursor-pointer backdrop-blur-md ${
              isScrolled
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-40 hover:opacity-100'
            }`}
            title="Trượt lên đầu trang"
            aria-label="Trượt lên đầu trang"
          >
            {/* Icon ChevronUp xoay ngược -45 độ để hướng thẳng lên trời */}
            <ChevronUp className="w-5 h-5 sm:w-5 sm:h-5 -rotate-45 stroke-[2.8] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" />
          </button>

          {/* Tooltip khi hover (nằm ở thẻ cha không bị xoay, thẳng hàng ngang sang trái y hệt chatbot) */}
          <span className="hidden sm:inline-block absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-[11px] font-bold tracking-wide whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Về đầu trang
          </span>
        </div>
      </div>
    </aside>
  );
}
