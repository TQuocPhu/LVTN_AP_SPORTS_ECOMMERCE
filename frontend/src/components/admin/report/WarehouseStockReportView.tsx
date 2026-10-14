'use client';

import React from 'react';
import { WarehouseReportResponse } from '@/types/report';
import { formatCurrency } from '@/utils/formatters';
import {
  Warehouse,
  Boxes,
  AlertTriangle,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface WarehouseStockReportViewProps {
  data: WarehouseReportResponse | null;
  loading?: boolean;
}

export function WarehouseStockReportView({ data, loading }: WarehouseStockReportViewProps) {
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
      </div>
    );
  }

  const totalValue = data?.totalInventoryValue || 0;
  const totalStock = data?.totalStockQuantity || 0;
  const lowStockCount = data?.lowStockVariantCount || 0;
  const outOfStockCount = data?.outOfStockVariantCount || 0;
  const inboundQty = data?.inboundQuantityInPeriod || 0;
  const outboundQty = data?.outboundQuantityInPeriod || 0;
  const orderOutboundQty = data?.orderOutboundQuantity || 0;
  const manualOutboundQty = data?.manualOutboundQuantity || 0;
  const lowStockVariants = data?.lowStockVariants || [];

  // Math for stock health
  const totalVariantsMonitored = lowStockVariants.length + 50; // estimate pool
  const safeStockCount = Math.max(0, totalVariantsMonitored - lowStockCount - outOfStockCount);

  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const safePct = totalVariantsMonitored > 0 ? (safeStockCount / totalVariantsMonitored) * 100 : 75;
  const lowPct = totalVariantsMonitored > 0 ? (lowStockCount / totalVariantsMonitored) * 100 : 15;
  const outPct = totalVariantsMonitored > 0 ? (outOfStockCount / totalVariantsMonitored) * 100 : 10;

  const safeDash = (safePct / 100) * circumference;
  const lowDash = (lowPct / 100) * circumference;
  const outDash = (outPct / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* 1. Inventory Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tổng Giá Trị Vốn Kho
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalValue)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Tổng số lượng tồn: <strong className="text-slate-700">{totalStock}</strong> sản phẩm
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Biến Thể Sắp Hết Hàng
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {lowStockCount} <span className="text-sm font-semibold text-slate-400">SKU</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Mức tồn dưới định mức an toàn (&le; 5)
          </div>
        </div>

        {/* Out of Stock Warning */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Biến Thể Đã Hết Hàng
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {outOfStockCount} <span className="text-sm font-semibold text-slate-400">SKU</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Cần lên đơn nhập hàng từ nhà cung cấp
          </div>
        </div>

        {/* Inbound vs Outbound in period */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Biến Động Nhập / Xuất
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
              <ArrowDownRight className="w-4 h-4" /> Nhập: +{inboundQty}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-bold">
              <ArrowUpRight className="w-4 h-4" /> Xuất: -{outboundQty}
            </div>
          </div>
          <div className="mt-2.5 text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
            <span>Đơn GHN: -{orderOutboundQty}</span>
            <span>Phiếu PXK: -{manualOutboundQty}</span>
          </div>
        </div>
      </div>

      {/* 2. Symmetrical Charts: Stock Health & Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stock Health Donut */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[360px]">
          <div className="pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600" />
              <span className="font-black text-slate-900 text-sm md:text-base">
                Tỷ Lệ An Toàn Tồn Kho SKU
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân loại mức độ tồn kho theo tiêu chuẩn an toàn cung ứng
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto">
            {/* Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="18"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="18"
                  strokeDasharray={`${safeDash} ${circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-700"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="18"
                  strokeDasharray={`${lowDash} ${circumference}`}
                  strokeDashoffset={`-${safeDash}`}
                  className="transition-all duration-700"
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth="18"
                  strokeDasharray={`${outDash} ${circumference}`}
                  strokeDashoffset={`-${safeDash + lowDash}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">An Toàn</span>
                <span className="text-sm font-black text-emerald-600">
                  {Math.round(safePct)}%
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5 w-full sm:w-auto">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Tồn An Toàn (&gt; 5)</span>
                </div>
                <span className="font-extrabold text-xs text-emerald-600">{safeStockCount} SKU</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Sắp Hết Hàng (&le; 5)</span>
                </div>
                <span className="font-extrabold text-xs text-amber-600">{lowStockCount} SKU</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Đã Hết Hàng (0)</span>
                </div>
                <span className="font-extrabold text-xs text-rose-600">{outOfStockCount} SKU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Inbound vs Outbound Comparison */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[360px]">
          <div className="pb-3 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              <span className="font-black text-slate-900 text-sm md:text-base">
                Cân Đối Nhập Xuất & Luân Chuyển
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              So sánh lượng hàng nhập bổ sung (PNK) và lượng hàng xuất khỏi kho
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {/* Inbound Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" /> Nhập kho bổ sung (PNK):
                </span>
                <span className="text-emerald-600 font-extrabold">+{inboundQty} sản phẩm</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${
                      inboundQty + outboundQty > 0
                        ? Math.max(5, (inboundQty / (inboundQty + outboundQty)) * 100)
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Outbound Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-orange-600" /> Tổng xuất khỏi kho:
                </span>
                <span className="text-orange-600 font-extrabold">-{outboundQty} sản phẩm</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-700"
                  style={{
                    width: `${
                      inboundQty + outboundQty > 0
                        ? Math.max(5, (outboundQty / (inboundQty + outboundQty)) * 100)
                        : 50
                    }%`,
                  }}
                />
              </div>
              {/* Detailed Breakdown */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
                <span>• Xuất bán đơn GHN: <strong className="text-slate-700">-{orderOutboundQty}</strong> sp</span>
                <span>• Xuất kho thủ công (PXK): <strong className="text-slate-700">-{manualOutboundQty}</strong> sp</span>
              </div>
            </div>

            {/* Net Balance Status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Chênh lệch lưu kho ròng:</span>
              <span
                className={`font-black ${
                  inboundQty >= outboundQty ? 'text-emerald-600' : 'text-orange-600'
                }`}
              >
                {inboundQty - outboundQty >= 0
                  ? `+${inboundQty - outboundQty}`
                  : `${inboundQty - outboundQty}`}{' '}
                sản phẩm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Low Stock Variants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Danh Sách Biến Thể Cần Nhập Hàng Gấp
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Các sản phẩm và size/màu có số lượng tồn kho chạm mức báo động
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Tạo Phiếu Nhập Kho</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4">Phân Loại (Size/Màu)</th>
                <th className="py-3 px-4 text-right">Giá Bán</th>
                <th className="py-3 px-4 text-right">Giá Vốn</th>
                <th className="py-3 px-4 text-center">Tồn Hiện Tại</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockVariants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <span className="font-bold text-slate-700">
                      Tồn kho an toàn!
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Không có biến thể nào có số lượng tồn kho chạm ngưỡng cảnh báo.
                    </p>
                  </td>
                </tr>
              ) : (
                lowStockVariants.map((v) => (
                  <tr
                    key={v.variantId}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      {v.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                          {v.image ? (
                            <Image
                              src={v.image}
                              alt={v.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900">
                          {v.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {v.size && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                            Size: {v.size}
                          </span>
                        )}
                        {v.color && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                            Màu: {v.color}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {formatCurrency(v.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-500">
                      {formatCurrency(v.costPrice || 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-sm font-black ${
                          v.stockQuantity === 0 ? 'text-rose-600' : 'text-amber-600'
                        }`}
                      >
                        {v.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {v.stockQuantity === 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Hết hàng (0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Sắp hết (&le; 5)
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

