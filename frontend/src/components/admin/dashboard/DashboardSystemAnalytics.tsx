'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  Boxes,
  PackagePlus,
  PackageMinus,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  CategoryShare,
  RevenueComparison,
  MonthlyWeeklyRevenue,
  WarehouseActivityTrend,
  StaffOrderStatusShare,
} from '@/types/dashboard';

interface DashboardSystemAnalyticsProps {
  isAdmin: boolean;
  isStaff: boolean;
  isWarehouse: boolean;
  categoryShares?: CategoryShare[];
  revenueComparison?: RevenueComparison[];
  monthlyWeeklyRevenues?: MonthlyWeeklyRevenue[];
  warehouseActivityTrend?: WarehouseActivityTrend[];
  staffOrderStatusShare?: StaffOrderStatusShare[];
  loading: boolean;
}

// Helper tính tọa độ SVG Donut Arc
function getDonutSlicePath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
): string {
  const sweepAngle = Math.min(endAngle - startAngle, 359.99);
  const adjustedEndAngle = startAngle + sweepAngle;

  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1Outer = cx + rOuter * Math.cos(rad(startAngle));
  const y1Outer = cy + rOuter * Math.sin(rad(startAngle));
  const x2Outer = cx + rOuter * Math.cos(rad(adjustedEndAngle));
  const y2Outer = cy + rOuter * Math.sin(rad(adjustedEndAngle));

  const x1Inner = cx + rInner * Math.cos(rad(adjustedEndAngle));
  const y1Inner = cy + rInner * Math.sin(rad(adjustedEndAngle));
  const x2Inner = cx + rInner * Math.cos(rad(startAngle));
  const y2Inner = cy + rInner * Math.sin(rad(startAngle));

  const largeArcFlag = sweepAngle > 180 ? 1 : 0;

  return [
    `M ${x1Outer} ${y1Outer}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
    `L ${x1Inner} ${y1Inner}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}`,
    'Z',
  ].join(' ');
}

export function DashboardSystemAnalytics({
  isAdmin,
  isStaff,
  isWarehouse,
  categoryShares = [],
  revenueComparison = [],
  monthlyWeeklyRevenues = [],
  warehouseActivityTrend = [],
  staffOrderStatusShare = [],
  loading,
}: DashboardSystemAnalyticsProps) {
  // State tương tác di chuột (Hover) cho biểu đồ tròn danh mục
  const [hoveredCategory, setHoveredCategory] = useState<CategoryShare | null>(null);

  // State tương tác di chuột cho biểu đồ tròn trạng thái nhân viên
  const [hoveredStaffStatus, setHoveredStaffStatus] = useState<StaffOrderStatusShare | null>(null);

  // Danh sách các tháng có thể chọn để so sánh (bỏ tháng đầu tiên là tháng hiện tại)
  const compareOptions = monthlyWeeklyRevenues.length > 1 ? monthlyWeeklyRevenues.slice(1) : [];

  // State lưu tháng được chọn để so sánh (Mặc định là tháng liền trước, ví dụ: "2026-09")
  const [selectedCompareMonthKey, setSelectedCompareMonthKey] = useState<string>(
    compareOptions[0]?.monthKey || '2026-09'
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-80" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-80" />
      </div>
    );
  }

  // =========================================================================
  // 1. BIỂU ĐỒ CỘT: SO SÁNH DOANH THU THEO TUẦN (CHO PHÉP CHỌN BẤT KỲ THÁNG NÀO ĐỂ SO SÁNH)
  // =========================================================================
  const renderRevenueBarChart = () => {
    // Tháng cơ sở hiện tại (Tháng 10/2026)
    const currentMonthData = monthlyWeeklyRevenues.length > 0 ? monthlyWeeklyRevenues[0] : null;

    // Tháng được chọn để so sánh (theo dropdown)
    const compareMonthData =
      monthlyWeeklyRevenues.find((m) => m.monthKey === selectedCompareMonthKey) ||
      (compareOptions.length > 0 ? compareOptions[0] : null);

    // Chuẩn bị dữ liệu 4 tuần
    const weekLabels = ['Tuần 1 (1-7)', 'Tuần 2 (8-14)', 'Tuần 3 (15-21)', 'Tuần 4 (22-cuối)'];
    const comparisonWeeks = [0, 1, 2, 3].map((wIdx) => {
      const revCurrent = currentMonthData?.weeklyRevenues?.[wIdx] ?? (revenueComparison[wIdx]?.currentMonthRevenue ?? 0);
      const revCompare = compareMonthData?.weeklyRevenues?.[wIdx] ?? (revenueComparison[wIdx]?.previousMonthRevenue ?? 0);
      return {
        periodName: weekLabels[wIdx],
        currentMonthRevenue: revCurrent,
        compareMonthRevenue: revCompare,
      };
    });

    const maxVal = Math.max(
      ...comparisonWeeks.flatMap((d) => [d.currentMonthRevenue, d.compareMonthRevenue]),
      1_000_000
    ) * 1.18;

    const width = 520;
    const height = 250;
    const padding = { top: 35, bottom: 40, left: 65, right: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const groupWidth = chartW / comparisonWeeks.length;
    const barWidth = 22;
    const barGap = 4;

    // Tính tổng doanh thu 2 tháng để so sánh %
    const totalCurrentMonth = currentMonthData?.totalRevenue ?? comparisonWeeks.reduce((s, w) => s + w.currentMonthRevenue, 0);
    const totalCompareMonth = compareMonthData?.totalRevenue ?? comparisonWeeks.reduce((s, w) => s + w.compareMonthRevenue, 0);
    const diffPercent = totalCompareMonth > 0
      ? Math.round(((totalCurrentMonth - totalCompareMonth) * 1000.0) / totalCompareMonth) / 10
      : (totalCurrentMonth > 0 ? 100 : 0);

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        {/* Header Cột: Tiêu đề + Dropdown chọn tháng so sánh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Doanh Thu So Sánh Theo Tuần</h3>
              <p className="text-[11px] text-slate-500">
                {currentMonthData?.monthLabel || 'Tháng này'} vs {compareMonthData?.monthLabel || 'Tháng so sánh'}
              </p>
            </div>
          </div>

          {/* Dropdown chọn tháng so sánh tùy ý */}
          {compareOptions.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] font-semibold text-slate-500">So sánh với:</span>
              <select
                value={selectedCompareMonthKey}
                onChange={(e) => setSelectedCompareMonthKey(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {compareOptions.map((opt) => (
                  <option key={opt.monthKey} value={opt.monthKey}>
                    {opt.monthLabel}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              So với Tháng trước
            </div>
          )}
        </div>

        {/* Legend chú thích màu sắc minh bạch */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px] font-bold">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-sky-600 inline-block shadow-sm" />
              <span className="text-slate-800">{currentMonthData?.monthLabel || 'Tháng này'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-400 inline-block shadow-sm" />
              <span className="text-slate-600">{compareMonthData?.monthLabel || 'Tháng so sánh'}</span>
            </div>
          </div>

          {/* Badge so sánh tổng chênh lệch */}
          <div className="text-[11px] font-bold flex items-center gap-1">
            <span className="text-slate-500">Tổng chênh lệch:</span>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10.5px] ${
                diffPercent >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {diffPercent >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
              {diffPercent >= 0 ? `+${diffPercent}%` : `${diffPercent}%`}
            </span>
          </div>
        </div>

        {/* SVG Biểu đồ cột */}
        <div className="w-full overflow-x-auto mt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none">
            {[0, 0.33, 0.66, 1].map((r, i) => {
              const y = padding.top + chartH * (1 - r);
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <text x={padding.left - 6} y={y + 4} textAnchor="end" fontSize="9.5" fill="#64748b" fontWeight="600">
                    {formatCurrency(maxVal * r)}
                  </text>
                </g>
              );
            })}

            <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} stroke="#cbd5e1" strokeWidth="1.5" />

            {comparisonWeeks.map((item, idx) => {
              const groupCenterX = padding.left + idx * groupWidth + groupWidth / 2;

              // Tháng này (Sky-600)
              const hCurrent = (item.currentMonthRevenue / maxVal) * chartH;
              const xCurrent = groupCenterX - barWidth - barGap / 2;
              const yCurrent = padding.top + chartH - hCurrent;

              // Tháng được chọn so sánh (Slate-400)
              const hCompare = (item.compareMonthRevenue / maxVal) * chartH;
              const xCompare = groupCenterX + barGap / 2;
              const yCompare = padding.top + chartH - hCompare;

              return (
                <g key={idx}>
                  {/* Cột Tháng này */}
                  <rect
                    x={xCurrent}
                    y={yCurrent}
                    width={barWidth}
                    height={Math.max(hCurrent, 0)}
                    rx="4"
                    fill="#0284c7"
                    className="transition-all hover:opacity-85"
                  />
                  {item.currentMonthRevenue > 0 && (
                    <text
                      x={xCurrent + barWidth / 2}
                      y={Math.max(yCurrent - 5, padding.top + 8)}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#0284c7"
                    >
                      {formatCurrency(item.currentMonthRevenue)}
                    </text>
                  )}

                  {/* Cột Tháng so sánh */}
                  <rect
                    x={xCompare}
                    y={yCompare}
                    width={barWidth}
                    height={Math.max(hCompare, 0)}
                    rx="4"
                    fill="#94a3b8"
                    className="transition-all hover:opacity-85"
                  />
                  {item.compareMonthRevenue > 0 && (
                    <text
                      x={xCompare + barWidth / 2}
                      y={Math.max(yCompare - 5, padding.top + 8)}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#64748b"
                    >
                      {formatCurrency(item.compareMonthRevenue)}
                    </text>
                  )}

                  {/* Nhãn Tuần */}
                  <text
                    x={groupCenterX}
                    y={padding.top + chartH + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    fill="#334155"
                  >
                    {item.periodName}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 2. BIỂU ĐỒ TRÒN (DONUT): CƠ CẤU DANH MỤC CÓ HOVER TƯƠNG TÁC THÔNG MINH
  // =========================================================================
  const renderCategoryDonutChart = () => {
    if (!categoryShares || categoryShares.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-semibold">
          Chưa có dữ liệu danh mục sản phẩm.
        </div>
      );
    }

    const totalProducts = categoryShares.reduce((sum, item) => sum + item.productCount, 0);
    const totalStock = categoryShares.reduce((sum, item) => sum + item.stockQuantity, 0);

    let currentAngle = 0;
    const slices = categoryShares.map((item) => {
      const sliceAngle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle += sliceAngle;
      return {
        ...item,
        startAngle,
        endAngle,
      };
    });

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        {/* Header Tròn */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Cơ Cấu Danh Mục Sản Phẩm</h3>
              <p className="text-[11px] text-slate-500">Rê chuột vào lát cắt để xem chi tiết</p>
            </div>
          </div>

          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {categoryShares.length} danh mục • {totalProducts} SKU
          </span>
        </div>

        {/* Bố cục Donut SVG + Legend danh sách */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-3">
          {/* Cột Trái: Biểu đồ Donut SVG với tâm động */}
          <div className="sm:col-span-5 flex justify-center">
            <div className="relative w-52 h-52">
              <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                {slices.map((slice) => {
                  const isHovered = hoveredCategory?.categoryId === slice.categoryId;
                  const rOut = isHovered ? 122 : 110;
                  const rIn = isHovered ? 68 : 72;
                  const pathD = getDonutSlicePath(150, 150, rIn, rOut, slice.startAngle, slice.endAngle);

                  return (
                    <path
                      key={slice.categoryId}
                      d={pathD}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 3 : 1.5}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                      }}
                      onMouseEnter={() => setHoveredCategory(slice)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Tâm Đồ Thị: Hiển thị chữ và số lượng sản phẩm ĐỘNG khi rê chuột */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {hoveredCategory ? (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-black text-slate-900 line-clamp-1">
                      {hoveredCategory.categoryName}
                    </div>
                    <div className="text-sm font-black text-sky-600 mt-0.5">
                      {hoveredCategory.productCount} sản phẩm
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      {hoveredCategory.percentage}% • Tồn {hoveredCategory.stockQuantity}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-black text-slate-900">{totalProducts}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      Sản phẩm
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Rê chuột xem SP</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cột Phải: Bảng chú thích màu sắc (Legend) */}
          <div className="sm:col-span-7 space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {categoryShares.map((item) => {
              const isHovered = hoveredCategory?.categoryId === item.categoryId;
              return (
                <div
                  key={item.categoryId}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'border-sky-300 bg-sky-50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setHoveredCategory(item)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">{item.categoryName}</div>
                      <div className="text-[10.5px] text-slate-500">
                        <b className="text-slate-800">{item.productCount}</b> SP • Tồn: <b className="text-slate-800">{item.stockQuantity}</b> cái
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-black text-slate-900">{item.percentage}%</span>
                    <div className="w-14 h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 3. BIỂU ĐỒ CỘT KÉP: NHẬP - XUẤT KHO 7 NGÀY (WAREHOUSE MANAGER)
  // =========================================================================
  const renderWarehouseBarChart = () => {
    if (!warehouseActivityTrend || warehouseActivityTrend.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-semibold">
          Chưa có dữ liệu biến động kho 7 ngày.
        </div>
      );
    }

    const maxVal = Math.max(
      ...warehouseActivityTrend.flatMap((d) => [d.inboundQuantity, d.outboundQuantity]),
      50
    ) * 1.2;

    const width = 500;
    const height = 250;
    const padding = { top: 35, bottom: 40, left: 55, right: 20 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const groupWidth = chartW / warehouseActivityTrend.length;
    const barWidth = 18;
    const barGap = 4;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Biến Động Nhập - Xuất Kho 7 Ngày</h3>
              <p className="text-[11px] text-slate-500">Số lượng hàng hóa luân chuyển thực tế</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block shadow-sm" />
              <span className="text-slate-800">Nhập kho</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block shadow-sm" />
              <span className="text-slate-800">Xuất kho</span>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto mt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56 select-none">
            {[0, 0.33, 0.66, 1].map((r, i) => {
              const y = padding.top + chartH * (1 - r);
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                  <text x={padding.left - 6} y={y + 4} textAnchor="end" fontSize="9.5" fill="#64748b" fontWeight="600">
                    {Math.round(maxVal * r)}
                  </text>
                </g>
              );
            })}

            <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH} stroke="#cbd5e1" strokeWidth="1.5" />

            {warehouseActivityTrend.map((item, idx) => {
              const groupCenterX = padding.left + idx * groupWidth + groupWidth / 2;
              const hIn = (item.inboundQuantity / maxVal) * chartH;
              const xIn = groupCenterX - barWidth - barGap / 2;
              const yIn = padding.top + chartH - hIn;

              const hOut = (item.outboundQuantity / maxVal) * chartH;
              const xOut = groupCenterX + barGap / 2;
              const yOut = padding.top + chartH - hOut;

              return (
                <g key={idx}>
                  <rect x={xIn} y={yIn} width={barWidth} height={Math.max(hIn, 0)} rx="3" fill="#10b981" />
                  {item.inboundQuantity > 0 && (
                    <text x={xIn + barWidth / 2} y={Math.max(yIn - 4, padding.top + 8)} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#047857">
                      +{item.inboundQuantity}
                    </text>
                  )}

                  <rect x={xOut} y={yOut} width={barWidth} height={Math.max(hOut, 0)} rx="3" fill="#f59e0b" />
                  {item.outboundQuantity > 0 && (
                    <text x={xOut + barWidth / 2} y={Math.max(yOut - 4, padding.top + 8)} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#b45309">
                      -{item.outboundQuantity}
                    </text>
                  )}

                  <text x={groupCenterX} y={padding.top + chartH + 16} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#334155">
                    {item.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // =========================================================================
  // 4. BIỂU ĐỒ TRÒN: TRẠNG THÁI ĐƠN PHỤ TRÁCH (STAFF)
  // =========================================================================
  const renderStaffStatusDonut = () => {
    if (!staffOrderStatusShare || staffOrderStatusShare.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-semibold">
          Chưa có dữ liệu trạng thái đơn hàng phụ trách.
        </div>
      );
    }

    const totalOrders = staffOrderStatusShare.reduce((sum, item) => sum + item.count, 0);

    let currentAngle = 0;
    const slices = staffOrderStatusShare.map((item) => {
      const sliceAngle = (item.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle += sliceAngle;
      return {
        ...item,
        startAngle,
        endAngle,
      };
    });

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Phân Bổ Trạng Thái Đơn Hàng</h3>
              <p className="text-[11px] text-slate-500">Đơn hàng tiếp nhận & xử lý cá nhân</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            {totalOrders} đơn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center mt-3">
          <div className="sm:col-span-5 flex justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                {slices.map((slice, i) => {
                  const isHovered = hoveredStaffStatus?.statusName === slice.statusName;
                  const rOut = isHovered ? 122 : 110;
                  const rIn = isHovered ? 68 : 72;
                  const pathD = getDonutSlicePath(150, 150, rIn, rOut, slice.startAngle, slice.endAngle);

                  return (
                    <path
                      key={i}
                      d={pathD}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 3 : 1.5}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredStaffStatus(slice)}
                      onMouseLeave={() => setHoveredStaffStatus(null)}
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-3">
                {hoveredStaffStatus ? (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-xs font-black text-slate-900 line-clamp-1">
                      {hoveredStaffStatus.statusName}
                    </div>
                    <div className="text-sm font-black text-sky-600 mt-0.5">
                      {hoveredStaffStatus.count} đơn
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      {hoveredStaffStatus.percentage}%
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xl font-black text-slate-900">{totalOrders}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Đơn hàng</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sm:col-span-7 space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {staffOrderStatusShare.map((item, idx) => {
              const isHovered = hoveredStaffStatus?.statusName === item.statusName;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'border-sky-300 bg-sky-50 shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setHoveredStaffStatus(item)}
                  onMouseLeave={() => setHoveredStaffStatus(null)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-900 truncate">{item.statusName}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-bold text-slate-700">{item.count} đơn</span>
                    <span className="text-xs font-black text-slate-900 ml-2">({item.percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // BỐ CỤC HIỂN THỊ THEO CHIỀU NGANG (GRID 2 CỘT) THEO VAI TRÒ (RBAC)
  // =========================================================================
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-4 h-4 text-sky-600" />
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
          Thống Kê Cơ Cấu & Dòng Chảy Hệ Thống
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dành cho ADMIN: Cột 1 = Doanh thu tuần cho chọn tháng; Cột 2 = Cơ cấu Danh mục */}
        {isAdmin && (
          <>
            {renderRevenueBarChart()}
            {renderCategoryDonutChart()}
          </>
        )}

        {/* Dành cho WAREHOUSE_MANAGER: Cột 1 = Nhập xuất 7 ngày; Cột 2 = Phân bổ tồn kho danh mục */}
        {isWarehouse && (
          <>
            {renderWarehouseBarChart()}
            {renderCategoryDonutChart()}
          </>
        )}

        {/* Dành cho STAFF: Cột 1 = Trạng thái đơn phụ trách; Cột 2 = Cơ cấu danh mục */}
        {isStaff && (
          <>
            {renderStaffStatusDonut()}
            {renderCategoryDonutChart()}
          </>
        )}
      </div>
    </div>
  );
}
