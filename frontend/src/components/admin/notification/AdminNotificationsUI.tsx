'use client';

import React from 'react';
import { NotificationPayload } from '@/hooks/useWebSocket';
import { AdminNotificationTab } from '@/hooks/useAdminNotifications';
import { AdminNotificationHeader } from './AdminNotificationHeader';
import { AdminNotificationTabs, AdminTabItem } from './AdminNotificationTabs';
import { AdminNotificationDateFilter } from './AdminNotificationDateFilter';
import { AdminNotificationItem } from './AdminNotificationItem';
import { AdminNotificationEmpty } from './AdminNotificationEmpty';

interface AdminNotificationsUIProps {
  notifications: NotificationPayload[];
  filteredNotifications: NotificationPayload[];
  unreadCount: number;
  activeTab: AdminNotificationTab;
  tabs: AdminTabItem[];
  startDate: string;
  endDate: string;
  sortOrder: 'DESC' | 'ASC';
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onSortOrderChange: (val: 'DESC' | 'ASC') => void;
  onResetDateFilter: () => void;
  onQuickDatePreset: (preset: 'today' | '7days' | '30days') => void;
  onSelectTab: (tab: AdminNotificationTab) => void;
  onNotificationClick: (id: number, url?: string) => void;
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead: () => void;
  getActionMeta: (actionType: string) => {
    icon: React.ElementType;
    colorClass: string;
    badgeText: string;
    badgeClass: string;
  };
  formatContent: (notif: NotificationPayload) => {
    title: string;
    message: string;
    senderName: string;
    senderAvatar?: string;
  };
}

export const AdminNotificationsUI: React.FC<AdminNotificationsUIProps> = ({
  filteredNotifications,
  unreadCount,
  activeTab,
  tabs,
  startDate,
  endDate,
  sortOrder,
  onStartDateChange,
  onEndDateChange,
  onSortOrderChange,
  onResetDateFilter,
  onQuickDatePreset,
  onSelectTab,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  getActionMeta,
  formatContent,
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* 1. Header Component */}
      <AdminNotificationHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={onMarkAllAsRead}
      />

      {/* 2. Filter Tabs Component */}
      <AdminNotificationTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />

      {/* 3. Date Range Filter Component */}
      <AdminNotificationDateFilter
        startDate={startDate}
        endDate={endDate}
        sortOrder={sortOrder}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSortOrderChange={onSortOrderChange}
        onReset={onResetDateFilter}
        onQuickPreset={onQuickDatePreset}
      />

      {/* 4. Notifications List Component */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => (
              <AdminNotificationItem
                key={notif.id}
                notification={notif}
                meta={getActionMeta(notif.actionType)}
                content={formatContent(notif)}
                onClick={onNotificationClick}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        ) : (
          <AdminNotificationEmpty />
        )}
      </div>
    </div>
  );
};
