'use client';

import React from 'react';
import {
  Smartphone,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useDemoLogistics } from '@/hooks/useDemoLogistics';
import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';
import { LogisticsMapWrapper } from '@/components/common/map/LogisticsMapWrapper';
import { calculateRealTimeProgress } from '@/utils/logistics-sync';

export function ShipperAppPortalContentUI() {
  const {
    orders,
    loading,
    updatingId,
    refetch,
    handleUpdateStatus,
    formatCurrency,
    formatDate,
  } = useDemoLogistics('shipping');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* App Top Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 sticky top-0 z-20 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px] uppercase">
                  Portal 3 / GHN App
                </span>
                <h1 className="text-base font-black text-white tracking-tight">
                  GHN Express Mobile App (Shipper Portal)
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">
                Ứng dụng điều khiển xe giao hàng (Đồng bộ thời gian thực 60km/h đa thiết bị qua Backend)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refetch}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all cursor-pointer"
              title="Cập nhật danh sách đơn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container - Centered Mobile Interface Layout */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
        {/* Banner Status */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-xs text-slate-200">
              Đang tuyến giao: <strong className="text-emerald-400">{orders.length} đơn hàng</strong> cần giao hôm nay
            </span>
          </div>
          <span className="text-[10px] font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded-lg">
            REAL-TIME BACKEND SYNC (60 KM/H)
          </span>
        </div>

        {/* List of Orders assigned to Shipper */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-slate-400 text-xs">Đang tải danh sách đơn giao của Shipper...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-800/60 rounded-2xl border border-slate-700 p-8">
            <ShieldCheck className="w-12 h-12 mx-auto text-emerald-400" />
            <h3 className="font-black text-slate-200 text-base">Tất cả đơn hàng đã giao hoàn tất!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Không có đơn hàng nào đang ở trạng thái `shipping`. Hãy xuất phát xe tải từ <strong>Portal 2: GHN Transit (`/demo/carrier-logistics`)</strong> để nhận đơn mới!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentProgress = calculateRealTimeProgress(
                order.status,
                order.updatedAt,
                171.9
              );

              return (
                <div
                  key={order.id}
                  className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4 shadow-md hover:border-slate-600 transition-all"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-emerald-400 uppercase tracking-wide">
                        Mã Đơn: #{order.orderCode}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Thời gian nhận: {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono text-[11px] font-bold">
                      Vận đơn: {order.trackingCode || 'GHN-SHIPPED'}
                    </span>
                  </div>

                  {/* Recipient Details */}
                  <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-sm">
                        {order.shippingAddress?.fullName || order.customerName}
                      </span>
                      <a
                        href={`tel:${order.shippingAddress?.phone || order.customerPhone}`}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{order.shippingAddress?.phone || order.customerPhone || 'Gọi ĐT'}</span>
                      </a>
                    </div>

                    <p className="text-xs text-slate-300 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}
                      </span>
                    </p>
                  </div>

                  {/* Live Progress Banner Box */}
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Xe đang di chuyển (Tự động 60km/h):
                    </span>
                    <span className="font-mono text-emerald-400 font-black text-sm bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                      {currentProgress}% Tiến trình
                    </span>
                  </div>

                  {/* Interactive Map View for Shipper */}
                  <LogisticsMapWrapper
                    orderId={order.id}
                    orderCode={order.orderCode}
                    originLat={STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE}
                    originLng={STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE}
                    originName={STORE_LOCATION_CONSTANTS.STORE_NAME}
                    originAddress={STORE_LOCATION_CONSTANTS.STORE_ADDRESS}
                    destLat={order.gpsLatitude}
                    destLng={order.gpsLongitude}
                    destName={order.shippingAddress?.fullName || order.customerName}
                    destAddress={`${order.shippingAddress?.address || ''}, ${
                      order.shippingAddress?.city || ''
                    }`}
                    orderStatus="shipping"
                    progressPercentage={currentProgress}
                    trackingCode={order.trackingCode}
                    height="280px"
                  />

                  {/* Payment Breakdown & Final Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Số tiền COD cần thu:
                      </span>
                      <span className="text-lg font-black text-emerald-400">
                        {formatCurrency(order.finalAmount)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() =>
                        handleUpdateStatus(
                          order.id,
                          'delivered',
                          'Shipper GHN đã giao hàng thành công cho người nhận và thu tiền COD'
                        )
                      }
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {updatingId === order.id
                          ? 'Đang Cập Nhật...'
                          : 'Xác Nhận Giao Hàng Thành Công (Đã Thu COD)'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
