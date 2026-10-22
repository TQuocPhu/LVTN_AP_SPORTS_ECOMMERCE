'use client';

import React from 'react';
import Link from 'next/link';
import { useSportsAdvisor } from '@/hooks/useSportsAdvisor';
import { Bot, X, Send, Sparkles, ShoppingBag, ExternalLink, RefreshCw } from 'lucide-react';

interface AiSportsAdvisorWidgetProps {
  activeProductSlug?: string;
}

/**
 * UI Component: Trợ lý AI Sports Advisor (Agent 1)
 * Tuân thủ nghiêm ngặt: KHÔNG chứa useState/useEffect nội bộ, nhận toàn bộ dữ liệu & actions từ useSportsAdvisor hook.
 */
export const AiSportsAdvisorWidget: React.FC<AiSportsAdvisorWidgetProps> = ({ activeProductSlug }) => {
  const {
    isOpen,
    messages,
    inputValue,
    isLoading,
    messagesEndRef,
    toggleOpen,
    handleInputChange,
    handleSendMessage,
  } = useSportsAdvisor(activeProductSlug);

  const quickPrompts = [
    '👟 Tư vấn size giày đá bóng',
    '🏸 Chọn vợt cầu lông cho người mới',
    '👕 Quần áo tập gym thoáng mát',
    '⚽ Sản phẩm nào đang được ưa chuộng?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 1. Cửa sổ Chat Trợ lý AI */}
      {isOpen && (
        <div className="mb-4 w-96 max-w-[calc(100vw-2rem)] h-[540px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide">AP Sports AI Advisor</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                </div>
                <p className="text-xs text-blue-100">Tư vấn size & đồ thể thao chuẩn xác</p>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Danh sách tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-blue-600 animate-pulse ml-0.5 align-middle rounded-xs" />
                    )}
                  </p>
                </div>

                {/* Render Thẻ Gợi Ý Sản Phẩm (Nếu AI có đính kèm) */}
                {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                  <div className="mt-2 w-full space-y-1.5">
                    {msg.suggestedProducts.map((p, idx) => (
                      <Link
                        key={idx}
                        href={p.link}
                        className="flex items-center justify-between p-2.5 bg-white border border-blue-100 hover:border-blue-400 rounded-xl transition-all hover:shadow-md group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                              {p.name}
                            </p>
                            <p className="text-[11px] font-bold text-red-500">{p.price}</p>
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 font-medium flex items-center gap-1 flex-shrink-0 ml-2">
                          Xem <ExternalLink className="w-3 h-3" />
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicator khi AI đang phản hồi */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-white p-3 rounded-2xl w-fit border border-slate-100">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                <span>AP Sports AI đang phân tích dữ liệu...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Gợi ý câu hỏi nhanh (Quick Chips) */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-full transition-colors flex-shrink-0 border border-slate-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Khung nhập tin nhắn */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Hỏi về chiều cao, cân nặng, size chân..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-blue-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md flex-shrink-0"
              title="Gửi câu hỏi"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Nút kích hoạt mở Widget (Floating Action Button) */}
      <button
        onClick={toggleOpen}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/30"
        title="Tư vấn thể thao cùng AI"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
        <span className="font-semibold text-sm tracking-wide">✨ AI Tư Vấn Thể Thao</span>
      </button>
    </div>
  );
};
