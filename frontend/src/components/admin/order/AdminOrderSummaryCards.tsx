'use client';

import React from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { AdminOrderSummary } from '@/types/admin-order';

interface AdminOrderSummaryCardsProps {
  summary: AdminOrderSummary | null;
  loading: boolean;
}

export function AdminOrderSummaryCards({
  summary,
  loading,
}: AdminOrderSummaryCardsProps) {
  const formatCurrency = (val?: number) => {
    if (!val) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const cards = [
    {
      title: 'Tổng Đơn Hàng',
      value: summary?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      textColor: 'text-slate-900',
    },
    {
      title: 'Đơn Chờ Duyệt',
      value: summary?.pendingOrders ?? 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      textColor: 'text-amber-600',
    },
    {
      title: 'Đang Vận Chuyển',
      value: summary?.shippingOrders ?? 0,
      icon: Truck,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      textColor: 'text-cyan-600',
    },
    {
      title: 'Đã Giao Thành Công',
      value: summary?.deliveredOrders ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Đơn Hàng Đã Hủy',
      value: summary?.cancelledOrders ?? 0,
      icon: XCircle,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      textColor: 'text-rose-600',
    },
    {
      title: 'Doanh Thu Thực Thu',
      value: formatCurrency(summary?.totalRevenue),
      icon: DollarSign,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
      textColor: 'text-orange-600 font-extrabold',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 whitespace-normal leading-tight">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border shrink-0 ${card.color}`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            {loading ? (
              <div className="h-7 w-20 bg-slate-100 animate-pulse rounded-md mt-1" />
            ) : (
              <div className={`text-base sm:text-lg lg:text-xl font-black ${card.textColor} break-words`}>
                {card.value}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
