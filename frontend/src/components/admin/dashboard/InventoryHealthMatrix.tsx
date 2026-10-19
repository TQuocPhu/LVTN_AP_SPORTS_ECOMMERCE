'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  Search,
  PlusCircle,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { InventoryRunoutAnalysis } from '@/types/dashboard';
import { useInventoryRunoutBI, RunoutHealthFilter } from '@/hooks/useInventoryRunoutBI';

interface InventoryHealthMatrixProps {
  items?: InventoryRunoutAnalysis[];
  loading?: boolean;
}

/**
 * Component BI: Ma Trận Phân Tích Tồn Kho Runout Days & Đề Xuất Nhập Hàng
 * Phục vụ thủ kho và ban giám đốc lên kế hoạch nhập hàng chính xác dựa trên tốc độ bán thực tế 30 ngày qua.
 */
export function InventoryHealthMatrix({ items, loading }: InventoryHealthMatrixProps) {
  const {
    items: filteredItems,
    selectedFilter,
    setSelectedFilter,
    searchTerm,
    setSearchTerm,
    metrics,
  } = useInventoryRunoutBI(items);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse h-96 shadow-sm" />
    );
  }

  // Render badge trạng thái sức khỏe
  const renderHealthBadge = (status: string, runoutDays: number) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            {runoutDays === 0 ? 'Cạn Kho' : `Nguy Cấp (${runoutDays} ngày)`}
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Cảnh Báo ({runoutDays} ngày)
          </span>
        );
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            An Toàn ({runoutDays} ngày)
          </span>
        );
      case 'OVERSTOCK':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Archive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {runoutDays >= 999 ? 'Chưa Bán (>60 ngày)' : `Tồn Đọng (${runoutDays} ngày)`}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
      {/* 1. Header & Điều khiển Bộ Lọc */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Top 20 Ma Trận Phân Tích Runout Days & Đề Xuất Nhập Hàng
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Top 20 Ưu Tiên WMS
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Top 20 biến thể cần chú ý nhất: ước tính số ngày còn hàng dựa trên tốc độ tiêu thụ 30 ngày qua và đề xuất nhập bù an toàn
            </p>
          </div>
        </div>

        {/* Ô tìm kiếm SKU / Tên */}
        <div className="relative w-full lg:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm SKU, tên biến thể..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* 2. Thống kê nhanh 4 Nhóm Sức Khỏe Tồn Kho */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <button
          type="button"
          onClick={() => setSelectedFilter(selectedFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'CRITICAL'
              ? 'bg-rose-100/70 border-rose-400 ring-2 ring-rose-300'
              : 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/40'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold">
            <span>Nguy Cấp (&lt; 7 ngày)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-1 text-lg font-black text-rose-800">
            {metrics.criticalCount} <span className="text-xs font-normal text-rose-600">biến thể</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter(selectedFilter === 'WARNING' ? 'ALL' : 'WARNING')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'WARNING'
              ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-300'
              : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/40'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
            <span>Cảnh Báo (7 - 21 ngày)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1 text-lg font-black text-amber-800">
            {metrics.warningCount} <span className="text-xs font-normal text-amber-600">biến thể</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter(selectedFilter === 'HEALTHY' ? 'ALL' : 'HEALTHY')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'HEALTHY'
              ? 'bg-emerald-100/70 border-emerald-400 ring-2 ring-emerald-300'
              : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/40'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
            <span>An Toàn (21 - 60 ngày)</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-lg font-black text-emerald-800">
            {metrics.healthyCount} <span className="text-xs font-normal text-emerald-600">biến thể</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter(selectedFilter === 'OVERSTOCK' ? 'ALL' : 'OVERSTOCK')}
          className={`p-3 rounded-xl border text-left transition-all ${
            selectedFilter === 'OVERSTOCK'
              ? 'bg-slate-200 border-slate-400 ring-2 ring-slate-300'
              : 'bg-slate-100/70 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center justify-between text-slate-700 text-xs font-semibold">
            <span>Tồn Đọng (&gt; 60 ngày)</span>
            <Archive className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-1 text-lg font-black text-slate-800">
            {metrics.overstockCount} <span className="text-xs font-normal text-slate-500">biến thể</span>
          </div>
        </button>
      </div>

      {/* 3. Bảng Ma Trận Tồn Kho Chi Tiết */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          Không tìm thấy biến thể nào phù hợp với bộ lọc hiện tại.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">SKU & Biến Thể</th>
                <th className="py-3 px-3 text-center">Tồn Kho</th>
                <th className="py-3 px-3 text-center">Tốc Độ Bán (Ngày)</th>
                <th className="py-3 px-3 text-center">Runout Days</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3.5 text-center">Đề Xuất Nhập Thêm</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredItems.map((item) => (
                <tr key={item.variantId} className="hover:bg-slate-50/70 transition-colors">
                  {/* SKU & Sản phẩm */}
                  <td className="py-2.5 px-3.5">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 block">
                      {item.sku}
                    </span>
                    <span className="font-medium text-slate-800 line-clamp-1 block text-xs" title={item.productName}>
                      {item.productName}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {item.variantInfo}
                    </span>
                  </td>

                  {/* Tồn kho thực tế */}
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                    <span className={item.currentStock === 0 ? 'text-rose-600 font-black' : ''}>
                      {item.currentStock.toLocaleString('vi-VN')}
                    </span>
                  </td>

                  {/* Tốc độ bán TB ngày */}
                  <td className="py-2.5 px-3 text-center text-slate-600">
                    <span className="font-semibold text-slate-700">
                      {item.avgDailySales}
                    </span>{' '}
                    <span className="text-[10px] text-slate-400">cái/ngày</span>
                  </td>

                  {/* Runout Days & Visual Progress Bar */}
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-slate-800">
                        {item.runoutDays >= 999 ? '---' : `${item.runoutDays} ngày`}
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.healthStatus === 'CRITICAL'
                              ? 'bg-rose-500'
                              : item.healthStatus === 'WARNING'
                              ? 'bg-amber-500'
                              : item.healthStatus === 'HEALTHY'
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                          style={{
                            width: `${Math.min(Math.max((item.runoutDays / 60) * 100, 5), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Trạng thái sức khỏe */}
                  <td className="py-2.5 px-3 text-center">
                    {renderHealthBadge(item.healthStatus, item.runoutDays)}
                  </td>

                  {/* Đề xuất nhập thêm */}
                  <td className="py-2.5 px-3.5 text-center">
                    {item.suggestedReorderQty > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <PlusCircle className="w-3 h-3 text-amber-600" />
                        +{item.suggestedReorderQty} cái
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal text-[11px]">Đủ an toàn</span>
                    )}
                  </td>

                  {/* Thao tác liên kết sang kho */}
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href={`/admin/inventory?sku=${encodeURIComponent(item.sku)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      Nhập kho <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Footer ghi chú */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2 pt-3 border-t border-slate-100">
        <span>
          * Hiển thị Top 20 biến thể ưu tiên cần chú ý nhất (Runout Days = Tồn kho hiện tại / Tốc độ bán trung bình 30 ngày qua).
        </span>
        <span className="font-semibold text-slate-700">
          Tổng nhu cầu nhập bù an toàn: <b className="text-amber-700 font-bold">{metrics.totalSuggestedReorder.toLocaleString('vi-VN')}</b> cái
        </span>
      </div>
    </div>
  );
}
