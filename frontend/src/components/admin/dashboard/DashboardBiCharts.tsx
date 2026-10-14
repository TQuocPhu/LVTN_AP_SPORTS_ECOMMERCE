'use client';

import React, { useState } from 'react';
import {
  Target,
  Filter,
  Users2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShoppingCart,
  FileCheck,
  Truck,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { KpiTargetTrend, SalesFunnel, CohortRetentionItem } from '@/types/dashboard';

interface DashboardBiChartsProps {
  isAdmin: boolean;
  kpiData?: KpiTargetTrend;
  funnelData?: SalesFunnel;
  cohortData?: CohortRetentionItem[];
  loading: boolean;
}

export function DashboardBiCharts({
  isAdmin,
  kpiData,
  funnelData,
  cohortData,
  loading,
}: DashboardBiChartsProps) {
  const [activeTab, setActiveTab] = useState<'KPI' | 'FUNNEL' | 'COHORT'>('KPI');

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-96 shadow-sm" />
    );
  }

  // Helper tính chiều cao cho SVG Line chart
  const renderKpiLineChart = () => {
    if (!kpiData || !kpiData.dailyPacingPoints || kpiData.dailyPacingPoints.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-700 text-xs font-semibold">
          Chưa có dữ liệu tiến độ KPI trong kỳ này.
        </div>
      );
    }

    const points = kpiData.dailyPacingPoints;
    const maxVal = Math.max(kpiData.monthlyTargetRevenue * 1.1, 1);
    const width = 800;
    const height = 220;
    const padding = { top: 20, bottom: 30, left: 20, right: 20 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Tọa độ đường Target Pace (Mục tiêu chuẩn)
    const targetPath = points
      .map((p, idx) => {
        const x = padding.left + (idx / (points.length - 1)) * chartW;
        const y = padding.top + chartH - (p.targetCumulative / maxVal) * chartH;
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Tọa độ đường Actual Revenue (Doanh thu thực tế)
    const actualPoints = points.filter((p) => p.actualCumulative !== null);
    const actualPath = actualPoints
      .map((p, idx) => {
        const x = padding.left + (idx / (points.length - 1)) * chartW;
        const y = padding.top + chartH - ((p.actualCumulative || 0) / maxVal) * chartH;
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    return (
      <div className="space-y-4">
        {/* KPI Summary Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase">Tiến Độ Kế Hoạch Tháng</div>
              <div className="text-lg font-black text-slate-900">
                {formatCurrency(kpiData.actualRevenueSoFar)}{' '}
                <span className="text-xs font-semibold text-slate-700">
                  / {formatCurrency(kpiData.monthlyTargetRevenue)} ({kpiData.progressPercentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {kpiData.pacingStatus === 'AHEAD' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                VƯỢT TIẾN ĐỘ (+{formatCurrency(kpiData.pacingVarianceAmount)})
              </span>
            )}
            {kpiData.pacingStatus === 'ON_TRACK' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
                BÁM SÁT MỤC TIÊU
              </span>
            )}
            {kpiData.pacingStatus === 'BEHIND' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                CHẬM TIẾN ĐỘ ({formatCurrency(kpiData.pacingVarianceAmount)})
              </span>
            )}
          </div>
        </div>

        {/* SVG Dual-Line Chart */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const y = padding.top + chartH * (1 - r);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text x={padding.left} y={y - 4} fontSize="9" fill="#64748b" fontWeight="600">
                    {formatCurrency(maxVal * r)}
                  </text>
                </g>
              );
            })}

            {/* Target Pace Line (Nét đứt xám) */}
            <path d={targetPath} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="6 6" />

            {/* Actual Revenue Line (Nét liền xanh đậm) */}
            {actualPath && (
              <path d={actualPath} fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {/* Điểm nút thực tế cuối cùng */}
            {actualPoints.length > 0 && (
              <circle
                cx={padding.left + ((actualPoints.length - 1) / (points.length - 1)) * chartW}
                y={
                  padding.top +
                  chartH -
                  ((actualPoints[actualPoints.length - 1].actualCumulative || 0) / maxVal) * chartH
                }
                r="5"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
              />
            )}
          </svg>
        </div>

        {/* Chú thích biểu đồ */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="w-5 h-1 bg-sky-600 rounded-full inline-block" />
              <strong className="text-slate-800">Doanh thu thực tế (Actual)</strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-1 bg-slate-400 rounded-full inline-block border-b border-dashed border-slate-600" />
              <span>Tiến độ mục tiêu (Target Pace)</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-700 italic flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-700" />
            {kpiData.rationaleNote}
          </div>
        </div>
      </div>
    );
  };

  // Helper render Phễu mua hàng thực tế (Funnel)
  const renderFunnelChart = () => {
    if (!funnelData) return null;

    const steps = [
      {
        step: 1,
        title: 'Sản Phẩm Thêm Vào Giỏ Hàng',
        count: funnelData.cartItemsCount,
        unit: 'sản phẩm',
        sub: 'Từ bảng cart_items của khách hàng',
        icon: ShoppingCart,
        color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        barColor: 'bg-indigo-500',
        widthPct: 100,
        dropRate: funnelData.cartToOrderDropRate,
        dropLabel: 'Khách ngâm giỏ không thanh toán',
      },
      {
        step: 2,
        title: 'Chốt Đặt Đơn Hàng Thành Công',
        count: funnelData.placedOrdersCount,
        unit: 'đơn hàng',
        sub: 'Đơn pending & confirmed',
        icon: FileCheck,
        color: 'bg-sky-50 text-sky-600 border-sky-200',
        barColor: 'bg-sky-500',
        widthPct: 75,
        dropRate: funnelData.orderToShipDropRate,
        dropLabel: 'Hủy trước khi xuất kho',
      },
      {
        step: 3,
        title: 'Đã Xuất Kho & Đang Vận Chuyển',
        count: funnelData.shippingOrdersCount,
        unit: 'đơn hàng',
        sub: 'Bàn giao shipper GHN phát hàng',
        icon: Truck,
        color: 'bg-amber-50 text-amber-600 border-amber-200',
        barColor: 'bg-amber-500',
        widthPct: 55,
        dropRate: funnelData.shipToCompleteDropRate,
        dropLabel: 'Giao thất bại / bom hàng',
      },
      {
        step: 4,
        title: 'Giao Thành Công & Hoàn Tất',
        count: funnelData.completedOrdersCount,
        unit: 'đơn thành công',
        sub: 'Tiền về tài khoản (COD / VNPay)',
        icon: DollarSign,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        barColor: 'bg-emerald-600',
        widthPct: 40,
        dropRate: null,
        dropLabel: null,
      },
    ];

    return (
      <div className="space-y-5">
        <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center justify-between">
          <span>
            Phễu chuyển đổi đo lường hiệu quả bán hàng thực tế từ <strong>Giỏ hàng</strong> đến khi <strong>Tiền về tài khoản</strong>.
          </span>
          <span className="font-extrabold text-sky-700 bg-white px-3 py-1 rounded-lg border border-sky-300">
            Tỷ lệ chốt đơn toàn sàn: {funnelData.overallConversionRate}%
          </span>
        </div>

        <div className="space-y-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.step} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold ${st.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-800 text-xs">
                        Bước {st.step}: {st.title}
                      </strong>
                      <span className="text-[11px] text-slate-700 ml-2">({st.sub})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 text-sm">
                      {st.count.toLocaleString('vi-VN')} {st.unit}
                    </span>
                  </div>
                </div>

                {/* Progress bar của bước */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${st.barColor} transition-all duration-500`}
                    style={{ width: `${st.widthPct}%` }}
                  />
                </div>

                {/* Tỷ lệ rớt xuống bước tiếp theo */}
                {st.dropRate !== null && (
                  <div className="flex items-center justify-end text-[11px] text-rose-600 font-bold gap-1 pr-1">
                    <span>▼ Rơi rụng: {st.dropRate}%</span>
                    <span className="text-slate-700 font-normal">({st.dropLabel})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper render Cohort Retention Matrix
  const renderCohortMatrix = () => {
    if (!cohortData || cohortData.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs gap-2 p-6 text-center">
          <Users2 className="w-10 h-10 text-slate-300 stroke-[1.5]" />
          <span className="font-bold text-slate-700 text-sm">Chưa đủ dữ liệu chu kỳ khách hàng quay lại mua sắm</span>
          <p className="text-[11px] text-slate-500 max-w-md">
            Hệ thống phân tích giữ chân (Cohort Retention) tự động theo dõi và ghi nhận khi các khách hàng hiện tại phát sinh đơn hàng thứ 2, thứ 3 sau 30-60-90 ngày kể từ đơn đầu tiên.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
          <span>
            Phân tích <strong>Cohort Retention</strong> theo dõi tỷ lệ phần trăm khách hàng có đơn mua đầu tiên quay trở lại mua sắm đồ thể thao tại AP SPORTS sau 30, 60 và 90 ngày.
          </span>
          <span className="font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
            {cohortData.length} nhóm kỳ ghi nhận
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 text-[11px] uppercase bg-slate-50">
                <th className="py-2.5 px-3 font-extrabold">Nhóm Khách Tháng</th>
                <th className="py-2.5 px-3 font-extrabold text-center">Khách Mới Mua Lần Đầu</th>
                <th className="py-2.5 px-3 font-extrabold text-center">Sau 30 Ngày</th>
                <th className="py-2.5 px-3 font-extrabold text-center">Sau 60 Ngày</th>
                <th className="py-2.5 px-3 font-extrabold text-center">Sau 90 Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cohortData.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{c.cohortMonth}</td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700">
                    {c.totalFirstTimeCustomers} khách
                  </td>
                  <td className="py-3 px-3 text-center">
                    {c.retentionDay30Percent !== null && c.retentionDay30Percent > 0 ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg font-bold bg-emerald-100 text-emerald-800 text-xs">
                        {c.retentionDay30Percent}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">Đang theo dõi</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {c.retentionDay60Percent !== null && c.retentionDay60Percent > 0 ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg font-bold bg-sky-100 text-sky-800 text-xs">
                        {c.retentionDay60Percent}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">---</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {c.retentionDay90Percent !== null && c.retentionDay90Percent > 0 ? (
                      <span className="inline-block px-2.5 py-1 rounded-lg font-bold bg-indigo-100 text-indigo-800 text-xs">
                        {c.retentionDay90Percent}%
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">---</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Header chuyển Tab biểu đồ Tầng 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Phân Tích Nghiệp Vụ & Chỉ Số BI</h2>
            <p className="text-[11px] text-slate-700">Dữ liệu phân tích đa chiều phục vụ ra quyết định kinh doanh</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveTab('KPI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'KPI'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mục Tiêu KPI
          </button>
          <button
            onClick={() => setActiveTab('FUNNEL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'FUNNEL'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phễu Mua Hàng
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('COHORT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'COHORT'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Giữ Chân Khách Hàng (Cohort)
            </button>
          )}
        </div>
      </div>

      {/* Nội dung tab tương ứng */}
      <div>
        {activeTab === 'KPI' && renderKpiLineChart()}
        {activeTab === 'FUNNEL' && renderFunnelChart()}
        {activeTab === 'COHORT' && renderCohortMatrix()}
      </div>
    </div>
  );
}
