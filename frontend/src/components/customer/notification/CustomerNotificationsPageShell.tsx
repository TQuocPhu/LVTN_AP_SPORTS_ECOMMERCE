'use client';

import React from 'react';
import { useCustomerNotifications } from '@/hooks/useCustomerNotifications';
import { CustomerNotificationsContentUI } from './CustomerNotificationsContentUI';

export const CustomerNotificationsPageShell: React.FC = () => {
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    activeTab,
    tabs,
    startDate,
    endDate,
    sortOrder,
    setStartDate,
    setEndDate,
    setSortOrder,
    resetDateFilter,
    setQuickDatePreset,
    setActiveTab,
    handleNotificationClick,
    markAsRead,
    markAllAsRead,
    getActionMeta,
    formatContent,
  } = useCustomerNotifications();

  return (
    <CustomerNotificationsContentUI
      notifications={notifications}
      filteredNotifications={filteredNotifications}
      unreadCount={unreadCount}
      activeTab={activeTab}
      tabs={tabs}
      startDate={startDate}
      endDate={endDate}
      sortOrder={sortOrder}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onSortOrderChange={setSortOrder}
      onResetDateFilter={resetDateFilter}
      onQuickDatePreset={setQuickDatePreset}
      onSelectTab={setActiveTab}
      onNotificationClick={handleNotificationClick}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      getActionMeta={getActionMeta}
      formatContent={formatContent}
    />
  );
};
