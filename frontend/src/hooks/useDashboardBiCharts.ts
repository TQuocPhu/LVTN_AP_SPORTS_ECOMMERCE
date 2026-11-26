'use client';

import { useState, useEffect } from 'react';

/**
 * Hook quản lý tab biểu đồ BI đang chọn trên trang Dashboard (Mục tiêu KPI / Phễu mua hàng / Giữ chân khách),
 * tách biệt hoàn toàn useState ra khỏi Component DashboardBiCharts.
 */
export function useDashboardBiCharts(isStaff: boolean) {
  const [activeTab, setActiveTab] = useState<'KPI' | 'FUNNEL' | 'COHORT'>(
    isStaff ? 'FUNNEL' : 'KPI'
  );

  useEffect(() => {
    if (isStaff && activeTab !== 'FUNNEL') {
      setActiveTab('FUNNEL');
    }
  }, [isStaff, activeTab]);

  return {
    activeTab,
    setActiveTab,
  };
}
