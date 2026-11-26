'use client';

import { useState, useEffect } from 'react';
import {
  CategoryShare,
  MonthlyWeeklyRevenue,
  StaffOrderStatusShare,
} from '@/types/dashboard';

/**
 * Hook quản lý trạng thái tương tác hover và chọn tháng so sánh cho các biểu đồ DashboardSystemAnalytics,
 * tách toàn bộ useState / useEffect ra khỏi Component chuẩn kiến trúc 7 tầng.
 */
export function useDashboardSystemAnalytics(monthlyWeeklyRevenues: MonthlyWeeklyRevenue[]) {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryShare | null>(null);
  const [hoveredStaffStatus, setHoveredStaffStatus] = useState<StaffOrderStatusShare | null>(null);

  const compareOptions = monthlyWeeklyRevenues.length > 1 ? monthlyWeeklyRevenues.slice(1) : [];
  const [selectedCompareMonthKey, setSelectedCompareMonthKey] = useState<string>(
    compareOptions[0]?.monthKey || '2026-09'
  );

  useEffect(() => {
    if (
      compareOptions.length > 0 &&
      !compareOptions.some((opt) => opt.monthKey === selectedCompareMonthKey)
    ) {
      setSelectedCompareMonthKey(compareOptions[0].monthKey);
    }
  }, [compareOptions, selectedCompareMonthKey]);

  return {
    hoveredCategory,
    setHoveredCategory,
    hoveredStaffStatus,
    setHoveredStaffStatus,
    compareOptions,
    selectedCompareMonthKey,
    setSelectedCompareMonthKey,
  };
}
