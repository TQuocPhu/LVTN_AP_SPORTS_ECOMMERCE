'use client';

import React, { useState, useMemo } from 'react';
import { TimeSeriesPointResponse } from '@/types/report';
import { formatCurrency } from '@/utils/formatters';
import { TrendingUp, Calendar } from 'lucide-react';

interface RevenueTimeSeriesChartProps {
  data: TimeSeriesPointResponse[];
  loading?: boolean;
}

export function RevenueTimeSeriesChart({ data, loading }: RevenueTimeSeriesChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPointResponse | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const points = useMemo(() => {
    return data && data.length > 0 ? data : [];
  }, [data]);

  const { maxRevenue, minRevenue, chartCoords, areaPath, linePath } = useMemo(() => {
    if (points.length === 0) {
      return { maxRevenue: 0, minRevenue: 0, chartCoords: [], areaPath: '', linePath: '' };
    }

    const revenues = points.map((p) => Number(p.revenue) || 0);
    const maxRev = Math.max(...revenues, 1000000);
    const minRev = 0;

    // Viewbox width = 800, height = 300
    const w = 800;
    const h = 260;
    const padTop = 20;
    const padBottom = 30;
    const padX = 40;

    const usableWidth = w - padX * 2;
    const usableHeight = h - padTop - padBottom;

    const coords = points.map((p, idx) => {
      const x = points.length === 1 ? w / 2 : padX + (idx / (points.length - 1)) * usableWidth;
      const rev = Number(p.revenue) || 0;
      const y = h - padBottom - (rev / maxRev) * usableHeight;
      return { x, y, point: p };
    });

    // Tạo đường SVG line & area
    let lineD = '';
    let areaD = '';

    if (coords.length > 0) {
      lineD = `M ${coords[0].x} ${coords[0].y}`;
      areaD = `M ${coords[0].x} ${h - padBottom} L ${coords[0].x} ${coords[0].y}`;

      for (let i = 1; i < coords.length; i++) {
        // Sử dụng đường cong mượt mà (smooth curve)
        const prev = coords[i - 1];
        const curr = coords[i];
        const cp1x = prev.x + (curr.x - prev.x) / 2;
        const cp1y = prev.y;
        const cp2x = prev.x + (curr.x - prev.x) / 2;
        const cp2y = curr.y;

        lineD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        areaD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      }

      const last = coords[coords.length - 1];
      areaD += ` L ${last.x} ${h - padBottom} Z`;
    }

    return { maxRevenue: maxRev, minRevenue: minRev, chartCoords: coords, areaPath: areaD, linePath: lineD };
  }, [points]);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs h-[380px] flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center min-h-[350px] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">Không có dữ liệu chuỗi thời gian</h4>
        <p className="text-xs text-slate-400 mt-1">Chưa có giao dịch hoàn tất nào trong khoảng thời gian được chọn.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80 gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Biểu Đồ Doanh Thu & Biến Động Đơn Hàng
            </span>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded-full">
              Real-time
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Xu hướng doanh thu thực nhận và số đơn phát sinh theo ngày trong kỳ báo cáo
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Doanh thu (VNĐ)</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Số đơn hàng</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[280px]">
        <svg
          viewBox="0 0 800 260"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = 230 - pct * 180;
            const revValue = Math.round(maxRevenue * pct);
            return (
              <g key={idx}>
                <line
                  x1="40"
                  y1={y}
                  x2="760"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  className="dark:stroke-slate-800"
                />
                <text
                  x="35"
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94a3b8"
                  className="font-mono font-medium"
                >
                  {revValue >= 1000000
                    ? `${(revValue / 1000000).toFixed(1)}M`
                    : `${Math.round(revValue / 1000)}k`}
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path d={areaPath} fill="url(#revenueGradient)" />

          {/* Line curve */}
          <path
            d={linePath}
            fill="none"
            stroke="#f97316"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Coordinate points */}
          {chartCoords.map((c, idx) => {
            const isHovered = hoveredPoint?.date === c.point.date;
            return (
              <g key={idx} className="cursor-pointer">
                {/* Invisible larger hover circle */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="15"
                  fill="transparent"
                  onMouseEnter={() => {
                    setHoveredPoint(c.point);
                    setHoverPos({ x: c.x, y: c.y });
                  }}
                  onMouseLeave={() => {
                    setHoveredPoint(null);
                    setHoverPos(null);
                  }}
                />
                {/* Visible inner dot */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? '6' : '3.5'}
                  fill={isHovered ? '#ea580c' : '#ffffff'}
                  stroke="#ea580c"
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all pointer-events-none"
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {chartCoords.map((c, idx) => {
            // Hiển thị cách nhau nếu quá dày
            const step = Math.ceil(chartCoords.length / 8);
            if (idx % step !== 0 && idx !== chartCoords.length - 1) return null;

            return (
              <text
                key={idx}
                x={c.x}
                y="248"
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
                className="font-semibold pointer-events-none"
              >
                {c.point.label || c.point.date}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && hoverPos && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 backdrop-blur-sm border border-slate-700 min-w-[170px] -translate-x-1/2 -translate-y-full transition-all"
            style={{
              left: `${(hoverPos.x / 800) * 100}%`,
              top: `${(hoverPos.y / 260) * 100 - 15}%`,
            }}
          >
            <div className="font-bold text-orange-400 border-b border-slate-700 pb-1 mb-1 flex items-center justify-between">
              <span>{hoveredPoint.date}</span>
              <span className="text-[10px] text-slate-400">Chi tiết</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Doanh thu:</span>
              <span className="font-black text-white">
                {formatCurrency(hoveredPoint.revenue)}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Số đơn hoàn thành:</span>
              <span className="font-bold text-emerald-400">
                {hoveredPoint.completedCount} đơn
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Đơn hủy:</span>
              <span className="font-bold text-rose-400">
                {hoveredPoint.cancelledCount} đơn
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
