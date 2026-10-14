'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export const CustomerNotificationEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-4 border border-slate-200 dark:border-slate-800">
        <Bell className="w-10 h-10 opacity-60" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        Chưa có thông báo nào trong mục này
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        Khi có các cập nhật mới về vận chuyển GHN, đơn hàng hoặc ưu đãi, thông báo sẽ hiển thị trực tiếp tại đây.
      </p>
    </div>
  );
};
