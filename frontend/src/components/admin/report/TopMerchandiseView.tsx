'use client';

import React from 'react';
import {
  CategoryRevenueItemResponse,
  TopMerchandiseReportResponse,
  TopProductItemResponse,
} from '@/types/report';
import { formatCurrency } from '@/utils/formatters';
import { Package, FolderTree, Trophy, Flame, Award, Layers, Scale } from 'lucide-react';
import Image from 'next/image';

interface TopMerchandiseViewProps {
  data: TopMerchandiseReportResponse | null;
  loading?: boolean;
  onSelectProduct?: (product: TopProductItemResponse) => void;
  onSelectCategory?: (category: CategoryRevenueItemResponse) => void;
}

/**
 * Giao diện Thống Kê Sản Phẩm Bán Chạy & Cơ Cấu Ngành Hàng (Admin Light Mode).
 * - 4 thẻ KPI thuần Sản phẩm & Ngành hàng (gom danh mục con về Danh mục Cha gốc để tính đúng ngành chủ chốt Bóng Đá).
 * - Lưới 8 / 4 mở rộng tối đa chiều rộng cho bảng Top Sản Phẩm Bán Chạy Nhất.
 * - Bảng Đối Chiếu Nhóm Danh Mục Cha (Bóng Đá vs. các nhóm danh mục cha lớn khác).
 */
export function TopMerchandiseView({
  data,
  loading,
  onSelectProduct,
  onSelectCategory,
}: TopMerchandiseViewProps) {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-[520px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          <div className="lg:col-span-4 h-[520px] rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
        </div>
      </div>
    );
  }

  const topProducts = data?.topProducts || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const rootCategories =
    data?.rootCategoryBreakdown && data.rootCategoryBreakdown.length > 0
      ? data.rootCategoryBreakdown
      : categoryBreakdown;

  const totalSoldQty = rootCategories.reduce((sum, c) => sum + (c.totalQuantitySold || 0), 0);
  const totalMerchandiseRevenue = rootCategories.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);

  const topRootCategory = rootCategories[0] || null;
  const topLeafCategory = categoryBreakdown[0] || null;
  const topProduct = topProducts[0] || null;

  // Nhận diện Danh mục Cha chủ chốt Bóng Đá (đã gom toàn bộ danh mục con như Giày FG, Áo đấu...)
  const footballRoot =
    rootCategories.find((c) => {
      const lower = (c.categoryName || '').toLowerCase();
      return lower.includes('bóng đá') || lower.includes('bong da') || lower.includes('football');
    }) || null;

  const isFootballLeading =
    Boolean(footballRoot && topRootCategory && footballRoot.categoryId === topRootCategory.categoryId);
  const footballGapPct =
    footballRoot && topRootCategory
      ? Math.max(0, Number(((topRootCategory.percentage || 0) - (footballRoot.percentage || 0)).toFixed(1)))
      : 0;

  return (
    <div className="space-y-6">
      {/* 4 Thẻ KPI Thuần Sản Phẩm & Ngành Hàng (Cập nhật động theo bộ lọc kỳ thời gian) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {/* 1. Tổng Sản Lượng Tiêu Thụ */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tổng Sản Lượng Bán
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
              {totalSoldQty.toLocaleString('vi-VN')} <span className="text-sm font-semibold text-slate-400">món</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
            Doanh thu hàng: <strong className="text-slate-800">{formatCurrency(totalMerchandiseRevenue)}</strong>
          </div>
        </div>

        {/* 2. Ngành Chủ Chốt (Danh Mục Cha: Bóng Đá) vs Ngành #1 */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs hover:border-emerald-400 transition-all min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Ngành Chủ Chốt: Bóng Đá
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight tabular-nums flex items-baseline gap-2">
              <span>{footballRoot ? `${footballRoot.percentage}%` : '0%'}</span>
              <span className="text-xs font-bold text-slate-500">
                ({footballRoot?.totalQuantitySold || 0} món)
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-600 mt-3 border-t border-slate-100 pt-2">
            {!footballRoot ? (
              'Chưa có phát sinh Bóng đá trong kỳ'
            ) : isFootballLeading ? (
              <span className="text-emerald-700 font-bold">
                Đang dẫn đầu #1 ({formatCurrency(footballRoot.totalRevenue)})
              </span>
            ) : (
              <span>
                Sau <strong className="text-slate-800">{topRootCategory?.categoryName}</strong> (-{footballGapPct}%)
              </span>
            )}
          </div>
        </div>

        {/* 3. Nhóm Ngành Hàng & Danh Mục Chi Tiết Dẫn Đầu */}
        <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-xs hover:border-blue-400 transition-all min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Nhóm Hàng Dẫn Đầu #1
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                <FolderTree className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 leading-snug" title={topRootCategory?.categoryName || '---'}>
              {topRootCategory ? topRootCategory.categoryName : 'Chưa có dữ liệu'}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2 flex items-start justify-between gap-2">
            <span className="leading-snug">
              Nhánh mạnh nhất: <strong className="text-slate-700">{topLeafCategory?.categoryName || '---'}</strong>
            </span>
            <strong className="text-blue-700 shrink-0">
              {topRootCategory ? `${topRootCategory.percentage}%` : '0%'}
            </strong>
          </div>
        </div>

        {/* 4. Sản Phẩm Chủ Lực (#1 Best Seller) */}
        <div className="p-5 rounded-2xl bg-white border border-orange-200 shadow-xs hover:border-orange-400 transition-all min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
                Sản Phẩm Bán Chạy #1
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-base font-black text-slate-900 leading-snug" title={topProduct?.productName || '---'}>
              {topProduct ? topProduct.productName : 'Chưa có dữ liệu'}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-3 border-t border-slate-100 pt-2 flex items-center justify-between gap-2">
            <span>
              Đã bán: <strong className="text-slate-800">{topProduct?.totalQuantitySold || 0}</strong>
            </span>
            <strong className="text-orange-600">{formatCurrency(topProduct?.totalRevenue || 0)}</strong>
          </div>
        </div>
      </div>

      {/* Lưới 8 / 4: Ưu tiên tối đa chiều rộng cho Top Sản Phẩm Bán Chạy Nhất */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Top Selling Products (8/12 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[520px] overflow-hidden">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-black text-slate-900 text-sm md:text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>Top Sản Phẩm Bán Chạy Nhất</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sản phẩm có lượng tiêu thụ và doanh thu cao nhất trong kỳ (Nhấp để xem biến thể đã bán)
                </p>
              </div>
              <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full shrink-0">
                Best Sellers
              </span>
            </div>

            <div className="overflow-y-auto overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2.5 pl-3 pr-1.5 w-10">#</th>
                    <th className="py-2.5 pl-2 pr-1.5">Sản Phẩm</th>
                    <th className="py-2.5 px-2.5 text-center whitespace-nowrap">Đã Bán</th>
                    <th className="py-2.5 px-2.5 text-right whitespace-nowrap">Đơn Giá TB</th>
                    <th className="py-2.5 pl-2.5 pr-5 text-right whitespace-nowrap">Doanh Thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400">
                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <span>Chưa có dữ liệu sản phẩm trong kỳ</span>
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((p, idx) => {
                      const avgPrice =
                        p.totalQuantitySold > 0
                          ? Math.round((p.totalRevenue || 0) / p.totalQuantitySold)
                          : 0;
                      return (
                        <tr
                          key={p.productId}
                          onClick={() => onSelectProduct?.(p)}
                          title="Nhấp để xem bảng chi tiết các đơn hàng & biến thể đã mua sản phẩm này"
                          className="hover:bg-orange-50/60 transition-colors cursor-pointer"
                        >
                          <td className="py-2.5 pl-3 pr-1.5 font-black text-slate-400 text-xs">
                            {idx < 3 ? (
                              <span className="text-base">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                              </span>
                            ) : (
                              `#${idx + 1}`
                            )}
                          </td>
                          <td className="py-2.5 pl-2 pr-1.5">
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
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-slate-900 line-clamp-1" title={p.productName}>
                                  {p.productName}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {p.rootCategoryName && p.categoryName && p.rootCategoryName !== p.categoryName
                                    ? `${p.rootCategoryName} › ${p.categoryName}`
                                    : p.categoryName || `/${p.slug}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 text-center font-black text-slate-800 whitespace-nowrap">
                            {p.totalQuantitySold} <span className="text-[10px] text-slate-400 font-normal">món</span>
                          </td>
                          <td className="py-2.5 px-2.5 text-right font-semibold text-slate-600 whitespace-nowrap">
                            {formatCurrency(avgPrice)}
                          </td>
                          <td className="py-2.5 pl-2.5 pr-5 text-right font-black text-orange-600 whitespace-nowrap">
                            {formatCurrency(p.totalRevenue)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 2. Category Revenue Breakdown (4/12 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between h-[520px] p-5">
          <div>
            <div className="pb-4 border-b border-slate-100 mb-4 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">Theo Nhánh Danh Mục</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Nhánh sản phẩm đóng góp doanh thu
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                Chi tiết
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[365px] pr-1">
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
                    <div
                      key={cat.categoryId}
                      onClick={() => onSelectCategory?.(cat)}
                      title="Nhấp để xem bảng chi tiết đơn hàng & biến thể thuộc nhánh danh mục này"
                      className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50/60 hover:border-blue-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs font-bold gap-2">
                        <span className="text-slate-800 truncate">{cat.categoryName}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-slate-500 font-normal text-[11px]">
                            {formatCurrency(cat.totalRevenue)}
                          </span>
                          <span className="text-slate-900 font-black">{cat.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
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
            <span>Đơn giao thành công</span>
            <span className="font-semibold text-slate-600 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> AP Sports
            </span>
          </div>
        </div>
      </div>

      {/* Bảng Đối Chiếu Nhóm Danh Mục Cha (Bóng Đá Chủ Chốt vs Các Nhóm Ngành Hàng Lớn Khác) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Biểu Đồ & Đối Chiếu Hiệu Quả Nhóm Danh Mục Cha (Bóng Đá vs. Ngành Khác)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gom toàn bộ danh mục con về đúng nhóm ngành hàng gốc để so sánh trực quan tỷ trọng doanh thu và sản lượng bán
              </p>
            </div>
          </div>
        </div>

        {/* Biểu đồ cột ngang kép so sánh trực quan cả Tỷ trọng Doanh Thu & Tỷ trọng Sản Lượng */}
        {rootCategories.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-end gap-4 text-[11px] font-bold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Tỷ trọng Doanh thu (%)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Tỷ trọng Sản lượng (%)
              </span>
            </div>
            {rootCategories.map((rc) => {
              const isFootball =
                (rc.categoryName || '').toLowerCase().includes('bóng đá') ||
                (rc.categoryName || '').toLowerCase().includes('bong da') ||
                (rc.categoryName || '').toLowerCase().includes('football');
              const volumePct =
                totalSoldQty > 0
                  ? Math.round(((rc.totalQuantitySold || 0) / totalSoldQty) * 1000) / 10
                  : 0;
              return (
                <div key={`chart-${rc.categoryId}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold gap-2">
                    <div className="flex items-center gap-2">
                      <span className={isFootball ? 'text-emerald-800' : 'text-slate-800'}>
                        {rc.categoryName}
                      </span>
                      {isFootball && (
                        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                          Chủ chốt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-blue-700 font-bold">
                        {rc.totalQuantitySold.toLocaleString('vi-VN')} món ({volumePct}%)
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="font-extrabold text-orange-600">
                        {formatCurrency(rc.totalRevenue)} ({rc.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden" title={`Tỷ trọng Doanh thu: ${rc.percentage}%`}>
                      <div
                        className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-orange-500 to-amber-500"
                        style={{ width: `${Math.min(100, Math.max(3, rc.percentage || 0))}%` }}
                      />
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden" title={`Tỷ trọng Sản lượng: ${volumePct}%`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                        style={{ width: `${Math.min(100, Math.max(3, volumePct))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold w-14">Hạng</th>
                <th className="py-3 px-4 font-bold">Nhóm Danh Mục Cha</th>
                <th className="py-3 px-4 font-bold text-right">Sản Lượng Bán</th>
                <th className="py-3 px-4 font-bold text-right text-blue-700">Tỷ Trọng SL (%)</th>
                <th className="py-3 px-4 font-bold text-right">Đơn Giá TB</th>
                <th className="py-3 px-4 font-bold text-right text-emerald-700">Doanh Thu</th>
                <th className="py-3 px-4 font-bold text-right text-orange-600">Tỷ Trọng DT (%)</th>
                <th className="py-3 px-4 font-bold text-right">So Với Bóng Đá (SL / DT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rootCategories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    Chưa có dữ liệu nhóm danh mục cha trong kỳ này.
                  </td>
                </tr>
              ) : (
                rootCategories.map((rc, idx) => {
                  const isFootball =
                    (rc.categoryName || '').toLowerCase().includes('bóng đá') ||
                    (rc.categoryName || '').toLowerCase().includes('bong da') ||
                    (rc.categoryName || '').toLowerCase().includes('football');
                  const avgUnitRev =
                    rc.totalQuantitySold > 0
                      ? Math.round((rc.totalRevenue || 0) / rc.totalQuantitySold)
                      : 0;
                  const volumePct =
                    totalSoldQty > 0
                      ? Math.round(((rc.totalQuantitySold || 0) / totalSoldQty) * 1000) / 10
                      : 0;
                  const footballVolumePct =
                    footballRoot && totalSoldQty > 0
                      ? Math.round(((footballRoot.totalQuantitySold || 0) / totalSoldQty) * 1000) / 10
                      : null;
                  const diffRevPct = footballRoot
                    ? Number(((rc.percentage || 0) - (footballRoot.percentage || 0)).toFixed(1))
                    : null;
                  const diffVolPct =
                    footballVolumePct !== null ? Number((volumePct - footballVolumePct).toFixed(1)) : null;

                  return (
                    <tr
                      key={rc.categoryId}
                      className={isFootball ? 'bg-emerald-50/40' : 'hover:bg-slate-50 transition-colors'}
                    >
                      <td className="py-3 px-4 font-black text-slate-500">#{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{rc.categoryName}</span>
                          {isFootball && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                              Ngành chủ chốt
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {rc.totalQuantitySold.toLocaleString('vi-VN')} món
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700">
                        {volumePct}%
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 whitespace-nowrap">
                        {formatCurrency(avgUnitRev)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                        {formatCurrency(rc.totalRevenue)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-orange-600">
                        {rc.percentage}%
                      </td>
                      <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                        {isFootball ? (
                          <span className="text-emerald-700">Mốc chuẩn (100% cơ sở)</span>
                        ) : diffRevPct === null || diffVolPct === null ? (
                          <span className="text-slate-400">Chưa có Bóng đá</span>
                        ) : (
                          <span className="text-slate-700">
                            SL: <strong className={diffVolPct >= 0 ? 'text-blue-700' : 'text-slate-600'}>{diffVolPct > 0 ? `+${diffVolPct}%` : `${diffVolPct}%`}</strong>
                            {' | '}
                            DT: <strong className={diffRevPct >= 0 ? 'text-blue-700' : 'text-slate-600'}>{diffRevPct > 0 ? `+${diffRevPct}%` : `${diffRevPct}%`}</strong>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {rootCategories.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-200 font-black text-slate-900">
                  <td colSpan={2} className="py-3 px-4">
                    TỔNG CỘNG TOÀN NGÀNH HÀNG
                  </td>
                  <td className="py-3 px-4 text-right">{totalSoldQty.toLocaleString('vi-VN')} món</td>
                  <td className="py-3 px-4 text-right text-blue-700">100%</td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {formatCurrency(totalSoldQty > 0 ? Math.round(totalMerchandiseRevenue / totalSoldQty) : 0)}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700 whitespace-nowrap">
                    {formatCurrency(totalMerchandiseRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right text-orange-600">100%</td>
                  <td className="py-3 px-4" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
