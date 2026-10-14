'use client';

import React, { useMemo } from 'react';
import { TimeSeriesPointResponse } from '@/types/report';
import { ShoppingBag, Calendar } from 'lucide-react';

interface OrderVolumeBarChartProps {
  data: TimeSeriesPointResponse[];
  loading?: boolean;
  hoveredPoint: TimeSeriesPointResponse | null;
  onHoverPoint: (point: TimeSeriesPointResponse | null) => void;
}

export function OrderVolumeBarChart({
  data,
  loading,
  hoveredPoint,
  onHoverPoint,
}: OrderVolumeBarChartProps) {
  const points = useMemo(() => {
    return data && data.length > 0 ? data : [];
  }, [data]);

  const { maxOrders, barGroups } = useMemo(() => {
    if (points.length === 0) {
      return { maxOrders: 0, barGroups: [] };
    }

    const orderCounts = points.map((p) => p.orderCount || 0);
    const maxVal = Math.max(...orderCounts, 5);

    // SVG canvas width = 800, height = 260
    const w = 800;
    const h = 260;
    const padTop = 20;
    const padBottom = 30;
    const padX = 40;

    const usableWidth = w - padX * 2;
    const usableHeight = h - padTop - padBottom;
    const groupWidth = usableWidth / points.length;
    const barWidth = Math.max(3, Math.min(14, groupWidth / 3.5));

    const groups = points.map((p, idx) => {
      const centerX = padX + (idx + 0.5) * groupWidth;

      const totalH = ((p.orderCount || 0) / maxVal) * usableHeight;
      const completedH = ((p.completedCount || 0) / maxVal) * usableHeight;
      const cancelledH = ((p.cancelledCount || 0) / maxVal) * usableHeight;

      const baseY = h - padBottom;

      return {
        point: p,
        centerX,
        totalBar: {
          x: centerX - barWidth * 1.5,
          y: baseY - totalH,
          width: barWidth,
          height: Math.max(1, totalH),
        },
        completedBar: {
          x: centerX - barWidth * 0.5,
          y: baseY - completedH,
          width: barWidth,
          height: Math.max(1, completedH),
        },
        cancelledBar: {
          x: centerX + barWidth * 0.5,
          y: baseY - cancelledH,
          width: barWidth,
          height: Math.max(1, cancelledH),
        },
      };
    });

    return { maxOrders: maxVal, barGroups: groups };
  }, [points]);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs h-[420px] flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs text-center h-[420px] flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800">Không có dữ liệu đơn hàng</h4>
        <p className="text-xs text-slate-400 mt-1">Chưa có phát sinh đơn trong khoảng thời gian được chọn.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative flex flex-col justify-between h-[420px]">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                Biểu Đồ Sản Lượng & Trạng Thái Đơn
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Sản Lượng
              </span>
            </div>
            <p className="text-xs text-slate-400">
              So sánh tổng số đơn tiếp nhận, giao thành công và đơn bị hủy
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 font-semibold text-slate-600">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              <span>Tổng</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-600">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Thành công</span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-slate-600">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Đã hủy</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="relative w-full h-[280px]">
          <svg
            viewBox="0 0 800 260"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = 230 - pct * 180;
              const val = Math.round(maxOrders * pct);
              return (
                <g key={idx}>
                  <line
                    x1="40"
                    y1={y}
                    x2="760"
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="35"
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94a3b8"
                    className="font-mono font-medium"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {barGroups.map((g, idx) => {
              const isHovered = hoveredPoint?.date === g.point.date;
              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => onHoverPoint(g.point)}
                  onMouseLeave={() => onHoverPoint(null)}
                >
                  {/* Background highlight pill on hover */}
                  {isHovered && (
                    <rect
                      x={g.centerX - 24}
                      y="15"
                      width="48"
                      height="215"
                      fill="#f8fafc"
                      rx="8"
                    />
                  )}

                  {/* Total Bar (Blue) */}
                  <rect
                    x={g.totalBar.x}
                    y={g.totalBar.y}
                    width={g.totalBar.width}
                    height={g.totalBar.height}
                    fill={isHovered ? '#2563eb' : '#3b82f6'}
                    rx="2"
                    className="transition-all"
                  />

                  {/* Completed Bar (Emerald) */}
                  <rect
                    x={g.completedBar.x}
                    y={g.completedBar.y}
                    width={g.completedBar.width}
                    height={g.completedBar.height}
                    fill={isHovered ? '#059669' : '#10b981'}
                    rx="2"
                    className="transition-all"
                  />

                  {/* Cancelled Bar (Rose) */}
                  <rect
                    x={g.cancelledBar.x}
                    y={g.cancelledBar.y}
                    width={g.cancelledBar.width}
                    height={g.cancelledBar.height}
                    fill={isHovered ? '#e11d48' : '#f43f5e'}
                    rx="2"
                    className="transition-all"
                  />

                  {/* X axis labels */}
                  {(() => {
                    const step = Math.ceil(barGroups.length / 8);
                    if (idx % step !== 0 && idx !== barGroups.length - 1) return null;
                    return (
                      <text
                        x={g.centerX}
                        y="248"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        className="font-semibold pointer-events-none"
                      >
                        {g.point.label || g.point.date}
                      </text>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* Hover details overlay pill at bottom right */}
          {hoveredPoint && (
            <div className="absolute top-2 right-2 bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1 pointer-events-none border border-slate-700 min-w-[150px]">
              <div className="font-bold text-blue-400 border-b border-slate-700 pb-1 flex justify-between">
                <span>{hoveredPoint.date}</span>
                <span className="text-[10px] text-slate-400">Sản lượng</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tổng phát sinh:</span>
                <span className="font-bold text-white">{hoveredPoint.orderCount} đơn</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Giao thành công:</span>
                <span className="font-bold text-emerald-400">{hoveredPoint.completedCount} đơn</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Đơn hủy:</span>
                <span className="font-bold text-rose-400">{hoveredPoint.cancelledCount} đơn</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
