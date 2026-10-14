'use client';

import React from 'react';
import { CustomerNotificationTab } from '@/hooks/useCustomerNotifications';

export interface CustomerTabItem {
  key: CustomerNotificationTab;
  label: string;
  icon: React.ElementType;
  count: number;
}

interface CustomerNotificationTabsProps {
  tabs: CustomerTabItem[];
  activeTab: CustomerNotificationTab;
  onSelectTab: (tab: CustomerNotificationTab) => void;
}

export const CustomerNotificationTabs: React.FC<CustomerNotificationTabsProps> = ({
  tabs,
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isActive
                    ? 'bg-orange-700/60 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
