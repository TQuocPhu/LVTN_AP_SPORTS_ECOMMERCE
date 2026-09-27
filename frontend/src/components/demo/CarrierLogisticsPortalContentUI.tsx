'use client';

import React from 'react';
import Link from 'next/link';
import {
  Truck,
  PackageCheck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Navigation,
} from 'lucide-react';
import { useDemoLogistics } from '@/hooks/useDemoLogistics';

export function CarrierLogisticsPortalContentUI() {
  const {
    orders,
    loading,
    updatingId,
    refetch,
    handleUpdateStatus,
    formatCurrency,
    formatDate,
  } = useDemoLogistics('shipped');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Portal Top Bar */}
      <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-black text-[10px] uppercase">
                  Portal 2 / LVTN Demo
                </span>
                <h1 className="text-lg font-black tracking-tight">
                  Trung Tâm Điều Hành Xe Tải Vận Chuyển GHN Transit Hub
                </h1>
              </div>
              <p className="text-xs text-blue-100">
                Điều phối đội xe tải phân loại & luân chuyển kiện hàng tới trạm Shipper
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Làm Mới
            </button>
            <Link
              href="/demo/shipper-app"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-black text-xs shadow-sm transition-all"
            >
              <span>Sang Portal 3: App Shipper Giao Hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Portal Banner Notice */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Danh Sách Kiện Hàng Đã Bán Giao Cho GHN (`shipped`)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Nhân viên điều hành Trung tâm Vận chuyển bấm <strong>&quot;Xe Tải Xuất Phát Giao Hàng&quot;</strong> để phân công Shipper và bắt đầu quá trình di chuyển đường bộ (<strong>SHIPPING</strong>).
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs shrink-0">
            {orders.length} Kiện Hàng Đang Chờ Xuất Phát
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-slate-500 text-xs">
                Đang nạp danh sách kiện hàng tại Trung Tâm Điều Hành Xe Tải GHN...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center space-y-3 text-slate-400">
              <Truck className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-sm">Hiện không có kiện hàng nào đang chờ xuất phát xe tải</p>
              <p className="text-xs text-slate-500">
                Hãy tiếp nhận đơn từ <strong>Portal 1: Bưu Cục GHN (`/demo/ghn-station`)</strong> để chuyển đơn sang trạng thái `shipped`.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500">
                    <th className="py-3 px-4">Mã Đơn & Vận Đơn</th>
                    <th className="py-3 px-4">Địa Chỉ Nhận Hàng</th>
                    <th className="py-3 px-4">Tọa Độ GPS Đích</th>
                    <th className="py-3 px-4 text-right">Giá Trị Kiện Hàng</th>
                    <th className="py-3 px-4 text-center">Thao Tác Điều Hành Logistics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <span className="font-mono font-black text-slate-900 block">
                          #{order.orderCode}
                        </span>
                        <span className="font-mono text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-bold text-[10px] inline-block mt-1">
                          {order.trackingCode || 'GHN-AUTO'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-slate-500 text-[11px] line-clamp-1">
                          {order.shippingAddress?.address}, {order.shippingAddress?.city}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-blue-700 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span>
                            {order.gpsLatitude
                              ? `${order.gpsLatitude.toFixed(4)}, ${order.gpsLongitude?.toFixed(4)}`
                              : 'Chưa có GPS'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-black text-slate-900">
                        {formatCurrency(order.finalAmount)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          disabled={updatingId === order.id}
                          onClick={() =>
                            handleUpdateStatus(
                              order.id,
                              'shipping',
                              'Xe tải vận chuyển liên tỉnh GHN đã xuất kho bàn giao cho Shipper phát hàng'
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>
                            {updatingId === order.id
                              ? 'Đang Điều Xe...'
                              : 'Xe Tải Xuất Phát Giao Hàng (Kích Hoạt Map Shipping)'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
