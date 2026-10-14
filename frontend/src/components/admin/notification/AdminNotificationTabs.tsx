'use client';

import React from 'react';
import { AdminNotificationTab } from '@/hooks/useAdminNotifications';

export interface AdminTabItem {
  key: AdminNotificationTab;
  label: string;
  icon: React.ElementType;
  count: number;
}

interface AdminNotificationTabsProps {
  tabs: AdminTabItem[];
  activeTab: AdminNotificationTab;
  onSelectTab: (tab: AdminNotificationTab) => void;
}

export const AdminNotificationTabs: React.FC<AdminNotificationTabsProps> = ({
  tabs,
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TabIcon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
