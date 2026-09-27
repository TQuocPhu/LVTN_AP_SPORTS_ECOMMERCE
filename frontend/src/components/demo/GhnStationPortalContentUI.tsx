'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building,
  PackageCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Truck,
} from 'lucide-react';
import { useDemoLogistics } from '@/hooks/useDemoLogistics';
import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';
import { LogisticsMapWrapper } from '@/components/common/map/LogisticsMapWrapper';

export function GhnStationPortalContentUI() {
  const {
    orders,
    loading,
    updatingId,
    refetch,
    handleUpdateStatus,
    formatCurrency,
    formatDate,
  } = useDemoLogistics('processing');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-12">
      {/* Portal Top Bar */}
      <header className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white px-6 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                  Portal 1 / GHN Station
                </span>
                <h1 className="text-lg font-black tracking-tight">
                  Bưu Cục Trạm GHN Express (Ninh Kiều, Cần Thơ)
                </h1>
              </div>
              <p className="text-xs text-orange-100">
                Tiếp nhận và xác nhận kiện hàng từ Kho AP Sports (`processing` → `shipped`)
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
              href="/demo/carrier-logistics"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-black text-xs shadow-sm transition-all"
            >
              <span>Sang Portal 2: Trung Tâm Vận Chuyển</span>
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
              <PackageCheck className="w-4 h-4 text-orange-600" />
              <span>Bưu Cục GHN Tiếp Nhận Kiện Hàng Từ Shop AP Sports</span>
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm tra thông tin giao nhận và xác nhận nhận kiện hàng để chuyển tiếp sang Trung Tâm Vận Chuyển GHN.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs shrink-0">
            {orders.length} Đơn Hàng Chờ Bưu Cục
          </span>
        </div>

        {/* List of Orders */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-slate-500 text-xs">
              Đang nạp danh sách đơn hàng chờ tiếp nhận bưu cục GHN...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 text-slate-400">
            <PackageCheck className="w-12 h-12 mx-auto text-slate-300" />
            <p className="font-bold text-sm">Hiện không có đơn hàng nào chờ tiếp nhận tại Bưu cục GHN</p>
            <p className="text-xs text-slate-500">
              Hãy chuyển đơn hàng từ Admin Portal (`/admin/orders`) sang trạng thái <strong>&quot;Xuất Kho AP Sports (processing)&quot;</strong> để hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        #{order.orderCode}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 font-bold text-xs">
                        Mã Vận Đơn: {order.trackingCode || 'GHN-STATION'}
                      </span>
                    </div>
                  </div>

                  {/* Information Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-orange-600 font-extrabold uppercase flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" /> Điểm Xuất Hàng (Kho AP Sports):
                      </span>
                      <p className="font-bold text-slate-900">{STORE_LOCATION_CONSTANTS.STORE_NAME}</p>
                      <p className="text-slate-500">{STORE_LOCATION_CONSTANTS.STORE_ADDRESS}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Điểm Giao Hàng (Khách Hàng):
                      </span>
                      <p className="font-bold text-slate-900">{order.customerName} ({order.customerPhone || '---'})</p>
                      <p className="text-slate-500">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}
                      </p>
                    </div>
                  </div>

                  {/* Static Map View for Station */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                      <MapPin className="w-4 h-4 text-orange-600" /> Bản Đồ Định Vị Tuyến Đường Giao Hàng
                    </span>
                    <LogisticsMapWrapper
                      orderId={order.id}
                      orderCode={order.orderCode}
                      originLat={STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE}
                      originLng={STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE}
                      originName={STORE_LOCATION_CONSTANTS.STORE_NAME}
                      originAddress={STORE_LOCATION_CONSTANTS.STORE_ADDRESS}
                      destLat={order.gpsLatitude}
                      destLng={order.gpsLongitude}
                      destName={order.customerName}
                      destAddress={`${order.shippingAddress?.address || ''}, ${
                        order.shippingAddress?.city || ''
                      }`}
                      orderStatus="processing"
                      progressPercentage={0}
                      trackingCode={order.trackingCode}
                      height="280px"
                    />
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Tổng tiền thanh toán: <strong className="text-slate-900 text-sm">{formatCurrency(order.finalAmount)}</strong>
                    </div>

                    <button
                      type="button"
                      disabled={updatingId === order.id}
                      onClick={() =>
                        handleUpdateStatus(
                          order.id,
                          'shipped',
                          'Bưu cục GHN đã tiếp nhận kiện hàng thành công và chuyển sang Trung Tâm Vận Chuyển'
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {updatingId === order.id
                          ? 'Đang Cập Nhật...'
                          : 'Xác Nhận Đã Nhận Kiện Hàng Từ Kho AP Sports'}
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
