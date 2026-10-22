'use client';

import React from 'react';
import { X, Sparkles, AlertTriangle, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AiBusinessAdvisorResponse } from '@/types/ai';

interface DashboardAiInsightsModalProps {
  isOpen: boolean;
  isLoading: boolean;
  insights: AiBusinessAdvisorResponse | null;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

/**
 * UI Component: Modal Cố Vấn Chiến Lược Kinh Doanh BI cho Ban Giám Đốc (Agent 3)
 * Tuân thủ quy tắc kiến trúc: Pure Presentation, không chứa logic state.
 */
export const DashboardAiInsightsModal: React.FC<DashboardAiInsightsModalProps> = ({
  isOpen,
  isLoading,
  insights,
  error,
  onClose,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">AI Executive Business Advisor</h2>
              <p className="text-xs text-indigo-200">Báo cáo & Khuyến nghị Chiến lược Cấp cao (Google Gemini Flash)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Phân tích lại số liệu mới nhất"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Đóng modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="font-semibold text-sm">AI đang đọc số liệu Dashboard và phân tích chiến lược...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Lỗi phân tích</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          {insights && !isLoading && (
            <>
              {/* 1. Nhận định tổng quan (Executive Summary) */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  <TrendingUp className="w-3.5 h-3.5" /> Sức Khỏe Doanh Nghiệp & Nhận Định Tổng Quan
                </span>
                <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
                  {insights.executiveSummary}
                </p>
              </div>

              {/* 2. Cảnh báo rủi ro (Risk Alerts) */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Cảnh Báo Rủi Ro & Tồn Kho Lâu Ngày
                </span>
                <div className="space-y-2">
                  {insights.riskAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                      <p className="leading-relaxed">{alert}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Hành động đề xuất (Actionable Recommendations) */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hành Động Khuyến Nghị Cho Ban Giám Đốc
                </span>
                <div className="space-y-2">
                  {insights.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <p className="leading-relaxed font-medium">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Phân tích thời gian thực • Dữ liệu nội bộ bảo mật</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
