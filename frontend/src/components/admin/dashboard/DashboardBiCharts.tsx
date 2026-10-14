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
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { KpiTargetTrend, SalesFunnel, CohortRetentionItem } from '@/types/dashboard';

interface DashboardBiChartsProps {
  isAdmin: boolean;
  isStaff: boolean;
  isWarehouse: boolean;
  kpiData?: KpiTargetTrend;
  funnelData?: SalesFunnel;
  cohortData?: CohortRetentionItem[];
  loading: boolean;
}

export function DashboardBiCharts({
  isAdmin,
  isStaff,
  isWarehouse,
  kpiData,
  funnelData,
  cohortData,
  loading,
}: DashboardBiChartsProps) {
  // Tab mặc định theo vai trò: Admin xem KPI, Staff xem Funnel, Warehouse ẩn tầng BI nếu không có quyền
  const [activeTab, setActiveTab] = useState<'KPI' | 'FUNNEL' | 'COHORT'>(
    isStaff ? 'FUNNEL' : 'KPI'
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-96 shadow-sm" />
    );
  }

  // Quản lý kho chỉ tập trung hiện vật kho, không xem tài chính BI
  if (isWarehouse) {
    return null;
  }

  // =========================================================================
  // 1. BIỂU ĐỒ ĐƯỜNG DUAL-LINE: MỤC TIÊU KPI THÁNG (PACING LINE CHART)
  // =========================================================================
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
    const width = 850;
    const height = 260;
    const padding = { top: 30, bottom: 50, left: 70, right: 30 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const firstDateStr = points[0]?.date || '';
    const dateParts = firstDateStr.split('-');
    const currentYear = dateParts[0] || `${new Date().getFullYear()}`;
    const currentMonth = dateParts[1] || `${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const currentDayNumber = new Date().getDate();

    const getPointX = (dayOfMonth: number) => {
      if (points.length <= 1) return padding.left;
      return padding.left + ((dayOfMonth - 1) / (points.length - 1)) * chartW;
    };

    const getPointY = (val: number) => {
      return padding.top + chartH - (val / maxVal) * chartH;
    };

    const targetPath = points
      .map((p, idx) => {
        const x = getPointX(p.dayOfMonth);
        const y = getPointY(p.targetCumulative);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    const validActualPoints = points.filter(
      (p) => p.dayOfMonth <= currentDayNumber && p.actualCumulative !== null && p.actualCumulative !== undefined
    );

    const actualPath = validActualPoints.length > 0
      ? validActualPoints
          .map((p, idx) => {
            const x = getPointX(p.dayOfMonth);
            const y = getPointY(p.actualCumulative || 0);
            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
          })
          .join(' ')
      : '';

    const lastActualPoint = validActualPoints.length > 0 ? validActualPoints[validActualPoints.length - 1] : null;
    const lastX = lastActualPoint ? getPointX(lastActualPoint.dayOfMonth) : 0;
    const lastY = lastActualPoint ? getPointY(lastActualPoint.actualCumulative || 0) : 0;

    const rawTickDays = [1, 5, 10, currentDayNumber, 20, 25, points.length];
    const tickDays = Array.from(new Set(rawTickDays))
      .filter((d) => d >= 1 && d <= points.length)
      .sort((a, b) => a - b);

    return (
      <div className="space-y-4">
        {/* Banner Tổng kết KPI */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tiến Độ Kế Hoạch Tháng {currentMonth}/{currentYear}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Hôm nay: Ngày {currentDayNumber}/{points.length}
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
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
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 select-none">
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const y = padding.top + chartH * (1 - r);
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b" fontWeight="600">
                    {formatCurrency(maxVal * r)}
                  </text>
                </g>
              );
            })}

            <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} stroke="#cbd5e1" strokeWidth="1.5" />

            {tickDays.map((d) => {
              const x = getPointX(d);
              const isToday = d === currentDayNumber;
              return (
                <g key={d}>
                  <line x1={x} y1={padding.top + chartH} x2={x} y2={padding.top + chartH + 5} stroke={isToday ? '#0284c7' : '#94a3b8'} strokeWidth={isToday ? 2 : 1} />
                  <text x={x} y={padding.top + chartH + 18} textAnchor="middle" fontSize={isToday ? '10.5' : '9.5'} fill={isToday ? '#0284c7' : '#64748b'} fontWeight={isToday ? '800' : '600'}>
                    {isToday ? `Hôm nay (${String(d).padStart(2, '0')}/${currentMonth})` : `${String(d).padStart(2, '0')}/${currentMonth}`}
                  </text>
                </g>
              );
            })}

            {lastActualPoint && (
              <line x1={lastX} y1={padding.top} x2={lastX} y2={padding.top + chartH} stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            )}

            <path d={targetPath} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="6 6" />

            {actualPath && (
              <path d={actualPath} fill="none" stroke="#0284c7" strokeWidth="3.5" strokeLinecap="round" />
            )}

            {lastActualPoint && (
              <g>
                <circle cx={lastX} cy={lastY} r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2.5" className="filter drop-shadow-sm" />
                <rect x={lastX - 44} y={lastY - 26} width="88" height="20" rx="6" fill="#0284c7" className="filter drop-shadow-sm" />
                <text x={lastX} y={lastY - 13} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                  {formatCurrency(lastActualPoint.actualCumulative || 0)}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Chú thích màu sắc */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-700 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <span className="w-5 h-1.5 bg-sky-600 rounded-full inline-block" />
              <strong className="text-slate-800">Doanh thu thực tế đến nay (Actual)</strong>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-5 h-1.5 bg-slate-400 rounded-full inline-block border-b border-dashed border-slate-600" />
              <span>Kế hoạch mục tiêu (Target Pace)</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-700 italic flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            {kpiData.rationaleNote}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 2. PHỄU MUA HÀNG THỰC TẾ (SALES FUNNEL)
  // =========================================================================
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
        dropLabel: 'Hủy đơn trước khi bàn giao vận chuyển',
      },
      {
        step: 3,
        title: 'Đang Vận Chuyển Giao Hàng GHN',
        count: funnelData.shippingOrdersCount,
        unit: 'vận đơn',
        sub: 'Đang luân chuyển trên đường',
        icon: Truck,
        color: 'bg-amber-50 text-amber-600 border-amber-200',
        barColor: 'bg-amber-500',
        widthPct: 50,
        dropRate: funnelData.shipToCompleteDropRate,
        dropLabel: 'Giao thất bại / hoàn trả hàng',
      },
      {
        step: 4,
        title: 'Giao Thành Công & Hoàn Tất Đơn',
        count: funnelData.completedOrdersCount,
        unit: 'đơn hoàn tất',
        sub: 'Khách đã nhận hàng và thu tiền',
        icon: DollarSign,
        color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        barColor: 'bg-emerald-500',
        widthPct: 35,
        dropRate: 0,
        dropLabel: '',
      },
    ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Phễu Chuyển Đổi Mua Hàng Thực Tế</div>
            <p className="text-[11px] text-slate-600 mt-0.5">Dữ liệu thật 100% từ bảng cart_items và orders trong cơ sở dữ liệu</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-600">Tỷ lệ chốt đơn thành công toàn phễu</span>
            <div className="text-lg font-black text-emerald-600">{funnelData.overallConversionRate}%</div>
          </div>
        </div>

        <div className="space-y-3">
          {steps.map((st) => (
            <div key={st.step} className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold ${st.color}`}>
                    <st.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{st.title}</div>
                    <div className="text-[11px] text-slate-500">{st.sub}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900">
                    {st.count.toLocaleString('vi-VN')} <span className="text-xs font-semibold text-slate-600">{st.unit}</span>
                  </div>
                  {st.dropRate > 0 && (
                    <div className="text-[11px] font-bold text-rose-600">
                      Rơi rụng: {st.dropRate}% <span className="text-slate-600 font-normal">({st.dropLabel})</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${st.barColor}`} style={{ width: `${st.widthPct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // =========================================================================
  // 3. MA TRẬN GIỮ CHÂN KHÁCH HÀNG (COHORT RETENTION) - ĐÃ SỬA LỖI UNDEFINED%
  // =========================================================================
  const renderCohortMatrix = () => {
    if (!cohortData || cohortData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-700 text-xs font-semibold">
          Chưa có dữ liệu mua lặp lại qua các tháng để tính ma trận Cohort Retention.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ma Trận Giữ Chân Khách Hàng (Cohort Retention)</div>
            <p className="text-[11px] text-slate-600 mt-0.5">Theo dõi tỷ lệ khách hàng mua lần đầu quay lại mua tiếp sau 30, 60, 90 ngày</p>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-lg border border-sky-200">
            Dữ liệu thật từ bảng orders
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <th className="p-3">Nhóm Khách Tháng</th>
                <th className="p-3">Khách Mua Lần Đầu</th>
                <th className="p-3 text-center">Sau 30 Ngày</th>
                <th className="p-3 text-center">Sau 60 Ngày</th>
                <th className="p-3 text-center">Sau 90 Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cohortData.map((row) => (
                <tr key={row.cohortMonth} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{row.cohortMonth}</td>
                  <td className="p-3 font-semibold text-slate-700">{row.totalFirstTimeCustomers} khách</td>
                  <td className="p-3 text-center font-bold text-sky-700">
                    {typeof row.retentionDay30Percent === 'number' ? `${row.retentionDay30Percent}%` : '---'}
                  </td>
                  {/* Sửa triệt để lỗi undefined%: kiểm tra kiểu number rõ ràng */}
                  <td className="p-3 text-center font-bold text-indigo-700">
                    {typeof row.retentionDay60Percent === 'number' ? `${row.retentionDay60Percent}%` : '---'}
                  </td>
                  <td className="p-3 text-center font-bold text-emerald-700">
                    {typeof row.retentionDay90Percent === 'number' ? `${row.retentionDay90Percent}%` : '---'}
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
      {/* Header chuyển Tab biểu đồ BI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Phân Tích Nghiệp Vụ & Chỉ Số BI</h2>
            <p className="text-[11px] text-slate-600">Dữ liệu phân tích chuyên sâu phục vụ ra quyết định điều hành</p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 gap-1">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('KPI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'KPI' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Mục Tiêu KPI
            </button>
          )}

          <button
            onClick={() => setActiveTab('FUNNEL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'FUNNEL' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Phễu Mua Hàng
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('COHORT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'COHORT' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users2 className="w-3.5 h-3.5" />
              Giữ Chân Khách (Cohort)
            </button>
          )}
        </div>
      </div>

      {/* Nội dung render theo tab được kích hoạt */}
      <div>
        {activeTab === 'KPI' && renderKpiLineChart()}
        {activeTab === 'FUNNEL' && renderFunnelChart()}
        {activeTab === 'COHORT' && renderCohortMatrix()}
      </div>
    </div>
  );
}
