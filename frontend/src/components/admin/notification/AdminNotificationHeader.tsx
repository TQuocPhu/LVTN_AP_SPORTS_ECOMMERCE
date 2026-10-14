'use client';

import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';

interface AdminNotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const AdminNotificationHeader: React.FC<AdminNotificationHeaderProps> = ({
  unreadCount,
  onMarkAllAsRead,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Trung Tâm Thông Báo Quản Trị
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi sự kiện đơn hàng, vận chuyển GHN, đánh giá và cảnh báo kho hàng realtime
          </p>
        </div>
      </div>

      {unreadCount > 0 && (
        <button
          type="button"
          onClick={onMarkAllAsRead}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold text-xs border border-orange-200 hover:border-transparent transition-all shadow-sm cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Đánh dấu tất cả đã đọc ({unreadCount})</span>
        </button>
      )}
    </div>
  );
};
