'use client';

import React from 'react';
import { ChevronRight, Mail, MailOpen, Check } from 'lucide-react';
import { NotificationPayload } from '@/hooks/useWebSocket';
import { ActionMeta } from '@/hooks/useCustomerNotifications';

interface CustomerNotificationItemProps {
  notification: NotificationPayload;
  meta: ActionMeta;
  content: {
    title: string;
    message: string;
    senderName: string;
    senderAvatar?: string;
  };
  onClick: (id: number, url?: string) => void;
  onMarkAsRead?: (id: number) => void;
}

export const CustomerNotificationItem: React.FC<CustomerNotificationItemProps> = ({
  notification,
  meta,
  content,
  onClick,
  onMarkAsRead,
}) => {
  const isRead = notification.isRead === true || (notification as any).read === true;
  const IconComponent = meta.icon;

  return (
    <div
      onClick={() => onClick(notification.id, notification.targetUrl)}
      className={`group relative flex items-start gap-4 p-5 transition-all cursor-pointer border-l-4 ${
        !isRead
          ? 'border-l-orange-500 bg-orange-50/25 dark:bg-orange-950/20 hover:bg-orange-50/40 dark:hover:bg-orange-950/30 shadow-xs'
          : 'border-l-transparent bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 opacity-90'
      }`}
    >
      {/* Left: Sender Avatar with small category badge overlay */}
      <div className="relative flex-shrink-0 mt-0.5">
        {content.senderAvatar ? (
          <img
            src={content.senderAvatar}
            alt={content.senderName}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform bg-white"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold ${meta.colorClass}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        )}

        {/* Small category icon badge */}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] ${meta.colorClass}`}>
          <IconComponent className="w-3 h-3" />
        </div>
      </div>

      {/* Center: Details */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Sender name + Category badge + Read/Unread Status + Time */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {content.senderName}
          </span>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
            {meta.badgeText}
          </span>

          {/* Read / Unread Status Badge from Database */}
          {!isRead ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <Mail className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              <span>Chưa đọc</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              <MailOpen className="w-3 h-3 text-slate-400" />
              <span>Đã đọc</span>
            </span>
          )}

          <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
            {new Date(notification.createdAt).toLocaleString('vi-VN')}
          </span>
        </div>

        {/* Title */}
        <h3 className={`text-sm font-bold leading-snug ${
          !isRead
            ? 'text-slate-950 dark:text-white font-black'
            : 'text-slate-700 dark:text-slate-300 font-semibold'
        }`}>
          {content.title}
        </h3>

        {/* Full-text Message */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl whitespace-normal break-words">
          {content.message}
        </p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 flex-shrink-0 pt-1">
        {/* Quick mark as read button if unread */}
        {!isRead && onMarkAsRead && (
          <button
            type="button"
            title="Đánh dấu đã đọc"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-900/40 hover:bg-orange-200/80 border border-orange-200 dark:border-orange-800 rounded-lg transition-all cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Đã đọc</span>
          </button>
        )}

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          <span className="text-xs font-semibold hidden md:inline">Chi tiết</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
