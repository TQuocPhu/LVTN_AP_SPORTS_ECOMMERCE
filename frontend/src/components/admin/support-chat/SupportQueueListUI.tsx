'use client';

import React from 'react';
import {
  Inbox,
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  RefreshCw,
  Loader2,
  History,
  Star,
} from 'lucide-react';
import { SupportConversation } from '@/types/support-chat';

interface Props {
  tab: 'active' | 'queue' | 'history';
  waitingQueue: SupportConversation[];
  myConversations: SupportConversation[];
  historyConversations: SupportConversation[];
  activeConversation: SupportConversation | null;
  isLoading: boolean;
  isAccepting: boolean;
  onTabChange: (tab: 'active' | 'queue' | 'history') => void;
  onSelect: (conv: SupportConversation) => void;
  onAccept: (id: number) => void;
  onRefresh: () => void;
}

export default function SupportQueueListUI({
  tab,
  waitingQueue,
  myConversations,
  historyConversations,
  activeConversation,
  isLoading,
  isAccepting,
  onTabChange,
  onSelect,
  onAccept,
  onRefresh,
}: Props) {
  return (
    <aside className="w-80 border-r border-slate-200 bg-white flex flex-col h-full select-none shrink-0">
      {/* Header */}
      <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          <h2 className="font-bold text-sm text-slate-800">Tổng Đài Hỗ Trợ</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : ''}`} />
        </button>
      </div>

      {/* Segmented 3-Tabs */}
      <div className="p-2 border-b border-slate-200">
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold">
          {/* Tab 1: Đang Phụ Trách */}
          <button
            type="button"
            onClick={() => onTabChange('active')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              tab === 'active'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Phụ Trách</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                tab === 'active' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {myConversations.length}
            </span>
          </button>

          {/* Tab 2: Hàng Đợi */}
          <button
            type="button"
            onClick={() => onTabChange('queue')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 relative ${
              tab === 'queue'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Hàng Đợi</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                waitingQueue.length > 0
                  ? 'bg-amber-500 text-white animate-pulse'
                  : tab === 'queue'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {waitingQueue.length}
            </span>
          </button>

          {/* Tab 3: Lịch Sử */}
          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
              tab === 'history'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Lịch Sử</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                tab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {historyConversations.length}
            </span>
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {/* NỘI DUNG TAB HÀNG ĐỢI */}
        {tab === 'queue' && (
          waitingQueue.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p>Hiện không có khách hàng chờ tiếp nhận</p>
            </div>
          ) : (
            waitingQueue.map((conv) => (
              <div
                key={conv.id}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-300 font-bold text-xs shrink-0 overflow-hidden">
                      {conv.customerAvatar ? (
                        <img
                          src={conv.customerAvatar}
                          alt={conv.customerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {conv.customerName
                            ? conv.customerName.charAt(0).toUpperCase()
                            : <User className="w-4 h-4" />}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-800 truncate max-w-[140px]">
                        {conv.customerName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {conv.customerEmail}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>
                          Chờ từ: {new Date(conv.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 line-clamp-1 italic bg-white p-1.5 rounded-lg border border-slate-200">
                  &ldquo;{conv.subject}&rdquo;
                </div>

                <button
                  type="button"
                  onClick={() => onAccept(conv.id)}
                  disabled={isAccepting}
                  className="w-full py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isAccepting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Tiếp nhận cuộc trò chuyện</span>
                </button>
              </div>
            ))
          )
        )}

        {/* NỘI DUNG TAB ĐANG PHỤ TRÁCH */}
        {tab === 'active' && (
          myConversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Inbox className="w-8 h-8 mx-auto text-slate-300" />
              <p>Bạn chưa tiếp nhận phiên trò chuyện nào</p>
            </div>
          ) : (
            myConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const hasUnread = (conv.unreadCount || 0) > 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelect(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50 border-orange-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border ${
                          isSelected
                            ? 'bg-orange-200 text-orange-800 border-orange-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {conv.customerAvatar ? (
                          <img
                            src={conv.customerAvatar}
                            alt={conv.customerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {conv.customerName
                              ? conv.customerName.charAt(0).toUpperCase()
                              : <User className="w-3.5 h-3.5" />}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`font-semibold text-xs truncate max-w-[130px] block ${
                            isSelected ? 'text-orange-950 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {conv.customerName}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[130px] block">
                          {conv.customerEmail}
                        </span>
                      </div>
                    </div>
                    {hasUnread && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-bold animate-bounce shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate pl-10.5">
                    {conv.subject}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 pl-10.5">
                    <span>
                      {new Date(conv.lastMessageAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {conv.status === 'IN_PROGRESS' ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Đang chat
                      </span>
                    ) : conv.status === 'RESOLVED' ? (
                      <span className="text-blue-600 font-semibold">Đã hoàn tất</span>
                    ) : conv.status === 'CLOSED' ? (
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        {conv.rating ? (
                          <span className="text-amber-500 font-bold flex items-center">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                            {conv.rating}★
                          </span>
                        ) : (
                          'Đã đóng ca'
                        )}
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">Chờ tiếp nhận</span>
                    )}
                  </div>
                </button>
              );
            })
          )
        )}

        {/* NỘI DUNG TAB LỊCH SỬ */}
        {tab === 'history' && (
          historyConversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-300" />
              <p>Chưa có cuộc trò chuyện nào trong lịch sử</p>
            </div>
          ) : (
            historyConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => onSelect(conv)}
                  className={`w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 border-slate-400 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-200">
                        {conv.customerAvatar ? (
                          <img
                            src={conv.customerAvatar}
                            alt={conv.customerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {conv.customerName
                              ? conv.customerName.charAt(0).toUpperCase()
                              : <User className="w-3.5 h-3.5" />}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-800 truncate max-w-[130px] block">
                          {conv.customerName}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[130px] block">
                          {conv.customerEmail}
                        </span>
                      </div>
                    </div>
                    {conv.rating && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{conv.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 truncate pl-10.5">
                    {conv.subject}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 pl-10.5">
                    <span>
                      {new Date(conv.lastMessageAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {conv.status === 'RESOLVED'
                        ? 'Đã hoàn tất'
                        : conv.status === 'CLOSED'
                        ? 'Đã đóng'
                        : conv.status}
                    </span>
                  </div>
                </button>
              );
            })
          )
        )}
      </div>
    </aside>
  );
}
