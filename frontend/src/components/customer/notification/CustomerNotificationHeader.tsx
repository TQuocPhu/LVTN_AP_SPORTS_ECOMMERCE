'use client';

import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';

interface CustomerNotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const CustomerNotificationHeader: React.FC<CustomerNotificationHeaderProps> = ({
  unreadCount,
  onMarkAllAsRead,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-black">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">
            Thông Báo Của Bạn
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {unreadCount > 0 ? (
              <>Bạn đang có <span className="font-bold text-orange-600 dark:text-orange-400">{unreadCount}</span> thông báo mới chưa đọc</>
            ) : (
              <>Bạn đã đọc hết tất cả các thông báo trong hộp thư</>
            )}
          </p>
        </div>
      </div>

      {unreadCount > 0 && (
        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white font-bold text-xs border border-orange-500/20 hover:border-transparent transition-all shadow-xs cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Đánh dấu tất cả đã đọc</span>
        </button>
      )}
    </div>
  );
};
