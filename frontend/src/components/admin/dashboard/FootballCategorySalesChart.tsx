'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trophy, TrendingUp, Package, DollarSign, Layers } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { FootballTopProduct } from '@/types/dashboard';
import { useFootballSalesBI } from '@/hooks/useFootballSalesBI';

interface FootballCategorySalesChartProps {
  products?: FootballTopProduct[];
  loading?: boolean;
}

/**
 * Component BI: Thống kê Top 10 mặt hàng Bóng Đá bán chạy & Phân tích Tỷ trọng Doanh thu / Sản lượng
 * Thiết kế giao diện trực quan, sang trọng, hỗ trợ xem so sánh kép (Revenue Share vs Volume Share).
 */
export function FootballCategorySalesChart({ products, loading }: FootballCategorySalesChartProps) {
  const {
    products: safeProducts,
    metricMode,
    setMetricMode,
    hoveredProductId,
    setHoveredProductId,
    totals,
  } = useFootballSalesBI(products);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-96 shadow-sm" />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* 1. Header & Điều khiển Chế độ xem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-sm shadow-emerald-200">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Top 10 Mặt Hàng Bóng Đá Bán Chạy & Tỷ Trọng Thị Phần
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Football BI
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích cơ cấu đóng góp Doanh thu (VND) và Sản lượng (Cái) trong toàn ngành Bóng Đá
            </p>
          </div>
        </div>

        {/* Nút lọc chế độ xem metric */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricMode('BOTH')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricMode === 'BOTH'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Tỷ Trọng Kép
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('REVENUE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricMode === 'REVENUE'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Doanh Thu (%)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('VOLUME')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricMode === 'VOLUME'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            Sản Lượng (%)
          </button>
        </div>
      </div>

      {/* 2. Thẻ Tóm tắt Thống kê Ngành */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Tổng Doanh Thu Ngành</span>
            <span className="text-sm font-bold text-slate-800">
              {formatCurrency(totals.totalRevenue)}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Tổng Sản Lượng Đã Bán</span>
            <span className="text-sm font-bold text-slate-800">
              {totals.totalVolume.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">cái</span>
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-500 font-medium block">Mặt Hàng Dẫn Đầu (#1)</span>
            <span className="text-sm font-bold text-slate-800 truncate block">
              {totals.topPerformer?.productName || 'Chưa phát sinh'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Danh sách Top 10 kèm Biểu đồ Thanh Kép Tỷ Trọng */}
      {safeProducts.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          Chưa có dữ liệu giao dịch cho nhóm sản phẩm bóng đá.
        </div>
      ) : (
        <div className="space-y-3.5 mt-4">
          {safeProducts.map((prod, index) => {
            const rank = index + 1;
            const isHovered = hoveredProductId === prod.productId;
            const revPercent = prod.revenueSharePercent || 0;
            const volPercent = prod.volumeSharePercent || 0;

            // Huy hiệu thứ hạng
            let rankBadge = (
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                {rank}
              </span>
            );
            if (rank === 1) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs shrink-0 ring-2 ring-amber-200">
                  1
                </span>
              );
            } else if (rank === 2) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 ring-2 ring-slate-200">
                  2
                </span>
              );
            } else if (rank === 3) {
              rankBadge = (
                <span className="w-6 h-6 rounded-full bg-amber-700 text-amber-50 font-bold text-xs flex items-center justify-center shrink-0 ring-2 ring-amber-300/60">
                  3
                </span>
              );
            }

            return (
              <div
                key={prod.productId}
                onMouseEnter={() => setHoveredProductId(prod.productId)}
                onMouseLeave={() => setHoveredProductId(null)}
                className={`p-3 rounded-xl border transition-all ${
                  isHovered
                    ? 'bg-slate-50/80 border-slate-300 shadow-xs'
                    : 'bg-white border-slate-150 hover:border-slate-250'
                }`}
              >
                <div className="flex items-center gap-3">
                  {rankBadge}

                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                    {prod.image ? (
                      <Image
                        src={prod.image}
                        alt={prod.productName}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                        N/A
                      </div>
                    )}
                  </div>

                  {/* Tên sản phẩm & Doanh thu tuyệt đối */}
                  <div className="flex-1 min-w-0 pr-2">
                    <Link
                      href={`/products/${prod.slug}`}
                      target="_blank"
                      className="text-xs font-semibold text-slate-800 hover:text-emerald-700 truncate block transition-colors"
                      title={prod.productName}
                    >
                      {prod.productName}
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span>
                        Doanh thu: <b className="text-slate-700">{formatCurrency(prod.revenue)}</b>
                      </span>
                      <span>•</span>
                      <span>
                        Đã bán: <b className="text-slate-700">{prod.quantitySold}</b> cái
                      </span>
                    </div>
                  </div>

                  {/* Tỷ trọng % tóm tắt */}
                  <div className="text-right shrink-0 flex items-center gap-3">
                    {(metricMode === 'BOTH' || metricMode === 'REVENUE') && (
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wider">
                          DT {revPercent}%
                        </span>
                      </div>
                    )}
                    {(metricMode === 'BOTH' || metricMode === 'VOLUME') && (
                      <div className="text-right">
                        <span className="text-[10px] text-indigo-600 font-bold block uppercase tracking-wider">
                          SL {volPercent}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thanh Bar Tỷ Trọng Kép */}
                <div className="mt-2.5 pt-2 border-t border-slate-100/80 space-y-1.5">
                  {(metricMode === 'BOTH' || metricMode === 'REVENUE') && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-16 text-slate-400 shrink-0 font-medium">Doanh thu</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.min(revPercent, 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-emerald-700">
                        {revPercent}%
                      </span>
                    </div>
                  )}

                  {(metricMode === 'BOTH' || metricMode === 'VOLUME') && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-16 text-slate-400 shrink-0 font-medium">Sản lượng</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden relative">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${Math.min(volPercent, 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-indigo-700">
                        {volPercent}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
