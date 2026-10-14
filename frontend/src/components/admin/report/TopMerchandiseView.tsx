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
        <div className="h-[520px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
        <div className="h-[520px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
      </div>
    );
  }

  const topProducts = data?.topProducts || [];
  const categoryBreakdown = data?.categoryBreakdown || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top Selling Products (50% col) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[520px] overflow-hidden">
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                Top 10 Sản Phẩm Bán Chạy Nhất
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sản phẩm có lượng tiêu thụ và doanh thu cao nhất trong kỳ
              </p>
            </div>
            <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              Best Sellers
            </span>
          </div>

          <div className="overflow-y-auto max-h-[420px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Sản Phẩm</th>
                  <th className="py-2.5 px-4 text-center">Đã Bán</th>
                  <th className="py-2.5 px-4 text-right">Doanh Thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-400">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <span>Chưa có dữ liệu sản phẩm trong kỳ</span>
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr
                      key={p.productId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-black text-slate-400 text-xs">
                        {idx < 3 ? (
                          <span className="text-base">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          `#${idx + 1}`
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt={p.productName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Package className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate max-w-[180px]">
                              {p.productName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              /{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-black text-slate-800">
                        {p.totalQuantitySold} <span className="text-[10px] text-slate-400 font-normal">món</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-orange-600 whitespace-nowrap">
                        {formatCurrency(p.totalRevenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Category Revenue Breakdown (50% col) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[520px] p-5">
        <div>
          <div className="pb-4 border-b border-slate-100 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                Tỷ Trọng Doanh Thu Theo Danh Mục
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tỷ lệ đóng góp doanh số giữa các ngành hàng thể thao
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Cơ Cấu
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[360px] pr-1">
            {categoryBreakdown.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FolderTree className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>Chưa có dữ liệu danh mục trong kỳ</span>
              </div>
            ) : (
              categoryBreakdown.map((cat, idx) => {
                const colors = [
                  'from-orange-500 to-amber-500',
                  'from-blue-500 to-indigo-500',
                  'from-emerald-500 to-teal-500',
                  'from-purple-500 to-violet-500',
                  'from-rose-500 to-red-500',
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div key={cat.categoryId} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">
                        {cat.categoryName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-normal">
                          {formatCurrency(cat.totalRevenue)}
                        </span>
                        <span className="text-slate-900 font-black">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                        style={{ width: `${Math.min(100, Math.max(4, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Dữ liệu tính trên đơn đã giao</span>
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> AP Sports Merchandise
          </span>
        </div>
      </div>
    </div>
  );
}

