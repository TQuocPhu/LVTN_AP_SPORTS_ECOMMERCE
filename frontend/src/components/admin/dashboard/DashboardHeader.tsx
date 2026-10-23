'use client';

import React from 'react';
import { RotateCw, Sparkles, ShieldCheck, UserCheck, Warehouse } from 'lucide-react';

import { useDashboardAiInsights } from '@/hooks/useDashboardAiInsights';
import { DashboardAiInsightsModal } from '@/components/admin/dashboard/DashboardAiInsightsModal';

interface DashboardHeaderProps {
  userName?: string;
  roleName: string;
  isAdmin: boolean;
  isStaff: boolean;
  isWarehouse: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({
  userName,
  roleName,
  isAdmin,
  isStaff,
  isWarehouse,
  refreshing,
  onRefresh,
}: DashboardHeaderProps) {
  const {
    isOpen: isAiModalOpen,
    isLoading: isAiLoading,
    insights: aiInsights,
    error: aiError,
    handleOpen: handleOpenAi,
    handleClose: handleCloseAi,
    handleRefresh: handleRefreshAi,
  } = useDashboardAiInsights();

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          QUẢN TRỊ VIÊN TOÀN QUYỀN
        </span>
      );
    }
    if (isStaff) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <UserCheck className="w-3.5 h-3.5 text-amber-600" />
          NHÂN VIÊN BÁN HÀNG & CSKH
        </span>
      );
    }
    if (isWarehouse) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
          <Warehouse className="w-3.5 h-3.5 text-orange-600" />
          QUẢN LÝ KHO VẬN & VẬN TẢI
        </span>
      );
    }
    return null;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Bảng Điều Khiển Tổng Quan
            </h1>
            {getRoleBadge()}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Xin chào, <strong className="text-slate-700">{userName || 'Quản lý'}</strong>! Dưới đây là nhịp độ vận hành và chỉ số kinh doanh thời gian thực của hệ thống AP Sports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Cố Vấn Chiến Lược AI cho Giám Đốc (Admin) */}
          {isAdmin && (
            <button
              onClick={handleOpenAi}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
              title="Mở báo cáo cố vấn chiến lược BI từ Google Gemini Flash"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>AI Cố Vấn Chiến Lược</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors shadow-sm disabled:opacity-50"
            title="Làm mới số liệu thời gian thực"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-sky-600' : ''}`} />
            <span>{refreshing ? 'Đang cập nhật...' : 'Cập nhật số liệu'}</span>
          </button>
        </div>
      </div>

      {/* Modal Báo Cáo Chiến Lược BI của AI */}
      <DashboardAiInsightsModal
        isOpen={isAiModalOpen}
        isLoading={isAiLoading}
        insights={aiInsights}
        error={aiError}
        onClose={handleCloseAi}
        onRefresh={handleRefreshAi}
      />
    </>
  );
}
