'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  CircleCheck,
  CreditCard,
  Percent,
  Wallet,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Banknote,
} from 'lucide-react';
import {
  FinancialReconciliationResponse,
  RevenueOverviewReportResponse,
} from '@/types/report';
import { formatCurrency } from '@/utils/formatters';

interface ReportKpiCardsProps {
  data: RevenueOverviewReportResponse | null;
  reconciliationData?: FinancialReconciliationResponse | null;
  loading: boolean;
}

/**
 * 6 Thẻ KPI Tổng Hợp & Cân Đối Tài Chính (2 hàng x 3 thẻ),
 * kết hợp chỉ số doanh thu tổng quan và các cấu phần đối soát (Thực thu, Chờ đối soát, Hủy/Hoàn).
 */
export function ReportKpiCards({ data, reconciliationData, loading }: ReportKpiCardsProps) {
  if (loading && !data && !reconciliationData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
          />
        ))}
      </div>
    );
  }

  const netRevenue = data?.totalNetRevenue ?? 0;
  const completedOrders = data?.completedOrders ?? 0;
  const totalOrders = reconciliationData?.totalOrders ?? data?.totalOrders ?? 0;
  const successRate = data?.successRate ?? 0;
  const cancellationRate = data?.cancellationRate ?? 0;
  const aov = data?.averageOrderValue ?? 0;
  const totalCogs = data?.totalCostOfGoodsSold ?? 0;
  const grossProfit = data?.grossProfit ?? 0;
  const grossMarginPercent = data?.grossMarginPercent ?? 0;

  const renderGrowthBadge = (growth?: number | null) => {
    if (growth === null || growth === undefined) return null;
    const isPositive = growth >= 0;
    return (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isPositive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}
        title="So với kỳ liền trước"
      >
        {isPositive ? '▲ +' : '▼ '}
        {growth}%
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Doanh Thu Phát Sinh Gộp */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all min-w-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Doanh Thu Phát Sinh Gộp
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums whitespace-nowrap">
          {formatCurrency(reconciliationData?.grossRevenue ?? data?.totalGrossRevenue ?? 0)}
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between gap-2 flex-wrap">
          <span>
            Voucher:{' '}
            <strong className="text-slate-700">
              {formatCurrency(reconciliationData?.totalDiscountAmount ?? data?.totalDiscountAmount ?? 0)}
            </strong>
          </span>
          <span>
            Ship:{' '}
            <strong className="text-slate-700">
              {formatCurrency(reconciliationData?.totalShippingFee ?? data?.totalShippingFee ?? 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. Thực Thu Đã Chốt (VNPay + COD) */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs hover:border-emerald-400 transition-all min-w-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Thực Thu Đã Chốt ({reconciliationData?.collectionRate ?? 0}%)
            </span>
            {renderGrowthBadge(data?.revenueGrowthPercent)}
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight tabular-nums whitespace-nowrap">
          {formatCurrency(reconciliationData?.netCollectedRevenue ?? data?.totalDeliveredRevenue ?? 0)}
        </div>
        <div className="mt-2.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-blue-600" />
            VNPay:{' '}
            <strong className="text-blue-700">
              {formatCurrency(reconciliationData?.vnpayCollectedRevenue ?? data?.vnpayPaymentRevenue ?? 0)}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1">
            <Banknote className="w-3 h-3 text-slate-500" />
            COD:{' '}
            <strong className="text-slate-800">
              {formatCurrency(reconciliationData?.codCollectedRevenue ?? data?.cashPaymentRevenue ?? 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* 3. Đang Chờ Đối Soát & Tạm Thu VNPay */}
      <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs hover:border-amber-400 transition-all min-w-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Chờ Đối Soát & Tạm Thu
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight tabular-nums whitespace-nowrap">
          {formatCurrency(
            (reconciliationData?.vnpayPrepaidPendingRevenue ?? 0) +
              (reconciliationData?.pendingReconciliationRevenue ?? 0)
          )}
        </div>
        <div className="mt-2.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 flex items-center justify-between gap-2 flex-wrap">
          <span>
            Tạm thu VNPay:{' '}
            <strong className="text-cyan-700">
              {formatCurrency(reconciliationData?.vnpayPrepaidPendingRevenue ?? 0)}
            </strong>
          </span>
          <span>
            Chờ thu COD:{' '}
            <strong className="text-amber-700">
              {formatCurrency(reconciliationData?.pendingReconciliationRevenue ?? 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* 4. Hủy / Lỗi TT & Hoàn Tiền */}
      <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs hover:border-rose-400 transition-all min-w-0">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
            Hủy / Lỗi TT & Hoàn Tiền
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-rose-700 tracking-tight tabular-nums whitespace-nowrap">
          {formatCurrency(reconciliationData?.lostCancelledRevenue ?? 0)}
        </div>
        <div className="mt-2.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 flex items-center justify-between gap-2 flex-wrap">
          <span>
            Cần hoàn ({reconciliationData?.pendingRefundCount ?? 0}):{' '}
            <strong className="text-rose-700">
              {formatCurrency(reconciliationData?.pendingRefundRevenue ?? 0)}
            </strong>
          </span>
          <span>
            Đã hoàn ({reconciliationData?.refundedCount ?? 0}):{' '}
            <strong className="text-indigo-700">
              {formatCurrency(reconciliationData?.refundedRevenue ?? 0)}
            </strong>
          </span>
        </div>
      </div>

      {/* 5. Đơn Hàng Thành Công & Tỷ Lệ */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all min-w-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Đơn Thành Công & Tỷ Lệ
            </span>
            {renderGrowthBadge(data?.ordersGrowthPercent)}
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
          <span>{completedOrders}</span>
          <span className="text-sm font-semibold text-slate-400">/ {totalOrders} đơn</span>
          {successRate >= 80 && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1 ml-auto">
              <CircleCheck className="w-3 h-3" /> {successRate}%
            </span>
          )}
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1">
            <Percent className="w-3 h-3 text-blue-500" /> Thành công:{' '}
            <strong className="text-slate-800">{successRate}%</strong>
          </span>
          <span>
            Hủy đơn: <strong className="text-rose-600">{cancellationRate}%</strong>
          </span>
        </div>
      </div>

      {/* 6. Lợi Nhuận Gộp & Giá Trị Đơn TB (AOV) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-purple-400 transition-all min-w-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Lãi Gộp ({grossMarginPercent}%) & AOV
            </span>
            {renderGrowthBadge(data?.aovGrowthPercent)}
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight tabular-nums whitespace-nowrap">
          {formatCurrency(grossProfit)}
        </div>
        <div className="mt-2.5 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between gap-2 flex-wrap">
          <span>
            Giá vốn: <strong className="text-slate-700">{formatCurrency(totalCogs)}</strong>
          </span>
          <span>
            AOV: <strong className="text-purple-700">{formatCurrency(aov)}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
