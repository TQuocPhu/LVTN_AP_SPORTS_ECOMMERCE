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
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  const totalValue = data?.totalInventoryValue || 0;
  const totalStock = data?.totalStockQuantity || 0;
  const lowStockCount = data?.lowStockVariantCount || 0;
  const outOfStockCount = data?.outOfStockVariantCount || 0;
  const inboundQty = data?.inboundQuantityInPeriod || 0;
  const outboundQty = data?.outboundQuantityInPeriod || 0;
  const lowStockVariants = data?.lowStockVariants || [];

  return (
    <div className="space-y-6">
      {/* 1. Inventory Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inventory Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tổng Giá Trị Vốn Kho
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Warehouse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(totalValue)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Tổng số lượng tồn: <strong className="text-slate-700 dark:text-slate-300">{totalStock}</strong> sản phẩm
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Biến Thể Sắp Hết Hàng
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {lowStockCount} <span className="text-sm font-semibold text-slate-400">SKU</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Mức tồn dưới định mức an toàn (&le; 5)
          </div>
        </div>

        {/* Out of Stock Warning */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
              Biến Thể Đã Hết Hàng
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {outOfStockCount} <span className="text-sm font-semibold text-slate-400">SKU</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Cần lên đơn nhập hàng từ nhà cung cấp
          </div>
        </div>

        {/* Inbound vs Outbound in period */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Biến Động Nhập / Xuất
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <ArrowDownRight className="w-4 h-4" /> Nhập: +{inboundQty}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 font-bold">
              <ArrowUpRight className="w-4 h-4" /> Xuất: -{outboundQty}
            </div>
          </div>
          <div className="mt-2.5 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            Tính theo phiếu trong kỳ báo cáo
          </div>
        </div>
      </div>

      {/* 2. Low Stock Variants Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Danh Sách Biến Thể Cần Nhập Hàng Gấp
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Các sản phẩm và size/màu có số lượng tồn kho chạm mức báo động
            </p>
          </div>
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Tạo Phiếu Nhập Kho</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4">Phân Loại (Size/Màu)</th>
                <th className="py-3 px-4 text-right">Giá Bán</th>
                <th className="py-3 px-4 text-right">Giá Vốn</th>
                <th className="py-3 px-4 text-center">Tồn Hiện Tại</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lowStockVariants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Boxes className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">
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
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {v.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-200">
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
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {v.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {v.size && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                            Size: {v.size}
                          </span>
                        )}
                        {v.color && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                            Màu: {v.color}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300">
                          Hết hàng (0)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300">
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
