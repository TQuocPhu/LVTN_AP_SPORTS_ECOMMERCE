'use client';

import React from 'react';
import { NotificationPayload } from '@/hooks/useWebSocket';
import { CustomerNotificationTab, ActionMeta } from '@/hooks/useCustomerNotifications';
import { CustomerNotificationHeader } from './CustomerNotificationHeader';
import { CustomerNotificationTabs, CustomerTabItem } from './CustomerNotificationTabs';
import { CustomerNotificationDateFilter } from './CustomerNotificationDateFilter';
import { CustomerNotificationItem } from './CustomerNotificationItem';
import { CustomerNotificationEmpty } from './CustomerNotificationEmpty';

interface CustomerNotificationsContentUIProps {
  notifications: NotificationPayload[];
  filteredNotifications: NotificationPayload[];
  unreadCount: number;
  activeTab: CustomerNotificationTab;
  tabs: CustomerTabItem[];
  startDate: string;
  endDate: string;
  sortOrder: 'DESC' | 'ASC';
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onSortOrderChange: (val: 'DESC' | 'ASC') => void;
  onResetDateFilter: () => void;
  onQuickDatePreset: (preset: 'today' | '7days' | '30days') => void;
  onSelectTab: (tab: CustomerNotificationTab) => void;
  onNotificationClick: (id: number, url?: string) => void;
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead: () => void;
  getActionMeta: (actionType: string) => ActionMeta;
  formatContent: (notif: NotificationPayload) => {
    title: string;
    message: string;
    senderName: string;
    senderAvatar?: string;
  };
}

export const CustomerNotificationsContentUI: React.FC<CustomerNotificationsContentUIProps> = ({
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
    <div className="w-full space-y-6">
      {/* 1. Header Card */}
      <CustomerNotificationHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={onMarkAllAsRead}
      />

      {/* 2. Filter Tabs Bar */}
      <CustomerNotificationTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
      />

      {/* 3. Date Range & Sorting Filter Component */}
      <CustomerNotificationDateFilter
        startDate={startDate}
        endDate={endDate}
        sortOrder={sortOrder}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onSortOrderChange={onSortOrderChange}
        onReset={onResetDateFilter}
        onQuickPreset={onQuickDatePreset}
      />

      {/* 4. Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredNotifications.map((notif) => (
              <CustomerNotificationItem
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
          <CustomerNotificationEmpty />
        )}
      </div>
    </div>
  );
};
