'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export const AdminNotificationEmpty: React.FC = () => {
  return (
    <div className="p-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
        <Bell className="w-8 h-8 opacity-50" />
      </div>
      <h3 className="text-sm font-bold text-slate-700">Chưa có thông báo nào</h3>
      <p className="text-xs text-slate-400 mt-1">
        Các thông báo mới về đơn hàng, GHN và kho sẽ hiển thị tại đây khi phát sinh sự kiện.
      </p>
    </div>
  );
};
