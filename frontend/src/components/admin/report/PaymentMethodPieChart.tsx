'use client';

import React from 'react';
import { CreditCard, Banknote, PieChart as PieChartIcon } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface PaymentMethodPieChartProps {
  cashRevenue: number;
  vnpayRevenue: number;
}

export function PaymentMethodPieChart({ cashRevenue, vnpayRevenue }: PaymentMethodPieChartProps) {
  const total = cashRevenue + vnpayRevenue;
  const cashPct = total > 0 ? Math.round((cashRevenue / total) * 100) : 50;
  const vnpayPct = total > 0 ? 100 - cashPct : 50;

  // SVG Donut chart math (radius = 60, circumference = 2 * PI * 60 ~= 377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const cashStrokeDash = (cashPct / 100) * circumference;
  const vnpayStrokeDash = (vnpayPct / 100) * circumference;

  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[380px]">
      <div className="pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 text-orange-600" />
          <span className="font-black text-slate-900 text-sm md:text-base">
            Cơ Cấu Doanh Thu Thanh Toán
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Tỷ trọng giữa tiền mặt COD và cổng thanh toán trực tuyến VNPay
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="20"
            />
            {/* Cash segment (Emerald) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="20"
              strokeDasharray={`${cashStrokeDash} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="transition-all duration-700"
            />
            {/* VNPay segment (Blue) */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="20"
              strokeDasharray={`${vnpayStrokeDash} ${circumference}`}
              strokeDashoffset={`-${cashStrokeDash}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>

          {/* Inner Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tổng Thu</span>
            <span className="text-xs font-black text-slate-800">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Legend & Numbers */}
        <div className="space-y-3 w-full sm:w-auto">
          {/* COD Cash */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  COD (Tiền mặt)
                </div>
                <div className="text-[10px] text-slate-400">{cashPct}% tỷ trọng</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-xs text-emerald-600">
                {formatCurrency(cashRevenue)}
              </span>
            </div>
          </div>

          {/* VNPay */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <div className="font-bold text-xs text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  Cổng VNPay
                </div>
                <div className="text-[10px] text-slate-400">{vnpayPct}% tỷ trọng</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-xs text-blue-600">
                {formatCurrency(vnpayRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
