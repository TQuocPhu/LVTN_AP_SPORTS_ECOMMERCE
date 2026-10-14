'use client';

import React from 'react';
import { TopMerchandiseReportResponse } from '@/types/report';
import { formatCurrency } from '@/utils/formatters';
import { Package, FolderTree, Trophy, Flame } from 'lucide-react';
import Image from 'next/image';

interface TopMerchandiseViewProps {
  data: TopMerchandiseReportResponse | null;
  loading?: boolean;
}

export function TopMerchandiseView({ data, loading }: TopMerchandiseViewProps) {
  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
        <div className="h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  const topProducts = data?.topProducts || [];
  const categoryBreakdown = data?.categoryBreakdown || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Top Selling Products (7 cols) */}
      <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Top Sản Phẩm Bán Chạy Nhất
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sản phẩm có lượng tiêu thụ và đóng góp doanh thu cao nhất trong kỳ
            </p>
          </div>
          <span className="text-[11px] font-bold text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded-full">
            Top 10 SKU
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4 text-center">Đã Bán</th>
                <th className="py-3 px-4 text-right">Doanh Thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>Chưa có dữ liệu sản phẩm trong kỳ</span>
                  </td>
                </tr>
              ) : (
                topProducts.map((p, idx) => (
                  <tr
                    key={p.productId}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-black text-slate-400 text-xs">
                      {idx < 3 ? (
                        <span className="text-base">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0 border border-slate-200/80">
                          {p.image ? (
                            <Image
                              src={p.image}
                              alt={p.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                            {p.productName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            /{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-black text-slate-800 dark:text-slate-200">
                      {p.totalQuantitySold} <span className="text-[10px] text-slate-400 font-normal">món</span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-orange-600 dark:text-orange-400 whitespace-nowrap">
                      {formatCurrency(p.totalRevenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Category Revenue Breakdown (5 cols) */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-blue-500" />
              Tỷ Trọng Doanh Thu Theo Danh Mục
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tỷ lệ đóng góp doanh số giữa các ngành hàng thể thao
            </p>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FolderTree className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>Chưa có dữ liệu danh mục trong kỳ</span>
              </div>
            ) : (
              categoryBreakdown.map((cat, idx) => {
                const colors = [
                  'from-orange-500 to-amber-500',
                  'from-blue-500 to-cyan-500',
                  'from-emerald-500 to-teal-500',
                  'from-purple-500 to-indigo-500',
                  'from-rose-500 to-pink-500',
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div key={cat.categoryId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">
                        {cat.categoryName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-normal">
                          {formatCurrency(cat.totalRevenue)}
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 font-black">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                        style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Dữ liệu tính trên đơn đã giao</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> AP Sports Analytics
          </span>
        </div>
      </div>
    </div>
  );
}
