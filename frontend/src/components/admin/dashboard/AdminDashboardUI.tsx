'use client';

import React from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { DashboardHeader } from './DashboardHeader';
import { DashboardScorecards } from './DashboardScorecards';
import { DashboardBiCharts } from './DashboardBiCharts';
import { DashboardQuickWidgets } from './DashboardQuickWidgets';
import { AlertCircle } from 'lucide-react';

export function AdminDashboardUI() {
  const {
    user,
    roleName,
    isAdmin,
    isStaff,
    isWarehouse,
    data,
    loading,
    refreshing,
    error,
    handleRefresh,
  } = useAdminDashboard();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Bảng Điều Khiển */}
      <DashboardHeader
        userName={user?.name || user?.email}
        roleName={roleName}
        isAdmin={isAdmin}
        isStaff={isStaff}
        isWarehouse={isWarehouse}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. TẦNG 1: 4 SCORECARDS SINH TỬ THEO VAI TRÒ */}
      <DashboardScorecards
        isAdmin={isAdmin}
        isStaff={isStaff}
        isWarehouse={isWarehouse}
        adminData={data?.adminScorecards}
        staffData={data?.staffScorecards}
        warehouseData={data?.warehouseScorecards}
        loading={loading}
      />

      {/* 3. TẦNG 2: BI CHARTS (KPI TARGET PACE, PHỄU MUA HÀNG THỰC TẾ, COHORT RETENTION) */}
      <DashboardBiCharts
        isAdmin={isAdmin}
        kpiData={data?.kpiTargetTrend}
        funnelData={data?.salesFunnel}
        cohortData={data?.cohortRetention}
        loading={loading}
      />

      {/* 4. TẦNG 3: CÁC WIDGET TOP 5 DÒNG KÈM LINK CHUYỂN TRANG THEO RBAC */}
      <DashboardQuickWidgets
        isAdmin={isAdmin}
        isStaff={isStaff}
        isWarehouse={isWarehouse}
        recentOrders={data?.recentOrders}
        topSellingProducts={data?.topSellingProducts}
        lowStockAlerts={data?.lowStockAlerts}
        recentReviews={data?.recentReviews}
        loading={loading}
      />
    </div>
  );
}
