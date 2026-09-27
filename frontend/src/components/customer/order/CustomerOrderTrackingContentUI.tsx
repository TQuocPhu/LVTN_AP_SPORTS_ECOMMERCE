'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  CreditCard,
  Banknote,
  AlertCircle,
  RefreshCw,
  Building,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';
import { LogisticsMapWrapper } from '@/components/common/map/LogisticsMapWrapper';
import { useCustomerOrderTracking } from '@/hooks/useCustomerOrderTracking';

interface CustomerOrderTrackingContentUIProps {
  orderCode: string;
}

export function CustomerOrderTrackingContentUI({
  orderCode,
}: CustomerOrderTrackingContentUIProps) {
  const {
    order,
    loading,
    error,
    retryingVNPay,
    simProgress,
    handleRetryVNPay,
    formatCurrency,
    formatDate,
  } = useCustomerOrderTracking(orderCode);

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-600 text-sm">
          Đang nạp thông tin tra cứu & bản đồ vận chuyển đơn hàng #{orderCode}...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto my-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">
            {error || 'Không tìm thấy thông tin đơn hàng'}
          </h2>
          <p className="text-slate-500 text-sm">
            Mã đơn hàng <code className="font-mono text-slate-800">{orderCode}</code> không tồn tại hoặc bạn không có quyền truy cập.
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Về Trang Cửa Hàng
        </Link>
      </div>
    );
  }

  const getStepIndex = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipping':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const stepIdx = getStepIndex(order.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span>Chi Tiết Đơn Hàng #{order.orderCode}</span>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-orange-100 text-orange-700 border border-orange-200">
                  {order.status}
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Thời gian khởi tạo: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {order.trackingCode && (
          <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-xl">
            <Truck className="w-4 h-4 text-cyan-700" />
            <div>
              <p className="text-[10px] font-bold text-cyan-600 uppercase">Mã Vận Đơn GHN</p>
              <p className="font-mono text-sm font-black text-cyan-900">{order.trackingCode}</p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Failed Banner with Retry Button */}
      {order.status?.toLowerCase() === 'payment_failed' && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm">Giao dịch thanh toán VNPay chưa hoàn tất</h4>
              <p className="text-xs text-rose-700 mt-1">
                Đơn hàng của bạn hiện ở trạng thái chờ thanh toán lại. Tồn kho đã được tạm thời khôi phục an toàn.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetryVNPay}
            disabled={retryingVNPay}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {retryingVNPay ? 'Đang Khởi Tạo VNPay...' : 'Thanh Toán Lại Bằng VNPay Sandbox'}
          </button>
        </div>
      )}

      {/* Logistics Status Stepper Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Tiến Độ Vận Chuyển Đơn Hàng
        </h3>

        <div className="grid grid-cols-5 gap-2 text-center text-[10px] sm:text-xs font-bold uppercase">
          {[
            { key: 'pending', label: '1. Chờ Duyệt', icon: Clock },
            { key: 'confirmed', label: '2. Đã Xác Nhận', icon: CheckCircle2 },
            { key: 'processing', label: '3. Đang Đóng Gói', icon: Building },
            { key: 'shipping', label: '4. Đang Giao Hàng', icon: Truck },
            { key: 'delivered', label: '5. Hoàn Thành', icon: CheckCircle2 },
          ].map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= stepIdx;
            const isCurrent = idx === stepIdx;

            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md ring-2 ring-orange-500/20'
                    : isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1.5" />
                <span className="block truncate">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Logistics Leaflet Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black uppercase text-xs text-slate-900">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Bản Đồ Định Vị & Lộ Trình Vận Chuyển Real-Time</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Tọa độ GPS điểm đến được bảo mật
          </span>
        </div>

        <LogisticsMapWrapper
          orderId={order.id}
          orderCode={order.orderCode}
          originLat={STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE}
          originLng={STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE}
          originName={STORE_LOCATION_CONSTANTS.STORE_NAME}
          originAddress={STORE_LOCATION_CONSTANTS.STORE_ADDRESS}
          destLat={order.gpsLatitude}
          destLng={order.gpsLongitude}
          destName={order.shippingAddress?.fullName || 'Khách hàng'}
          destAddress={`${order.shippingAddress?.address || ''}, ${
            order.shippingAddress?.city || ''
          }`}
          orderStatus={order.status}
          progressPercentage={simProgress}
          trackingCode={order.trackingCode}
          height="380px"
        />
      </div>

      {/* Main Grid: Customer & Delivery Address + Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Address & Items List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-orange-600 uppercase flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Điểm Xuất Hàng
              </span>
              <h4 className="font-bold text-slate-900 text-xs">
                {STORE_LOCATION_CONSTANTS.STORE_NAME}
              </h4>
              <p className="text-xs text-slate-500">{STORE_LOCATION_CONSTANTS.STORE_ADDRESS}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Nơi Nhận Hàng
              </span>
              <h4 className="font-bold text-slate-900 text-xs">
                {order.shippingAddress?.fullName || 'Khách hàng'} ({order.shippingAddress?.phone || '---'})
              </h4>
              <p className="text-xs text-slate-500">
                {order.shippingAddress?.address}, {order.shippingAddress?.city}
              </p>
            </div>
          </div>

          {/* Items List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-900 text-xs uppercase">
              <Package className="w-4 h-4 text-orange-500" />
              <span>Sản Phẩm Trong Đơn Hàng</span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                      SP
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {item.productName}
                    </h4>
                    {item.sku && (
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">SKU: {item.sku}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">
                      {formatCurrency(item.price)} × <strong className="text-slate-900">{item.quantity}</strong>
                    </p>
                  </div>

                  <div className="text-right font-black text-slate-900 text-sm shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Order Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
              Tóm Tắt Thanh Toán
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng (GHN):</span>
                <span className="font-bold text-slate-900">{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Giảm giá Voucher:</span>
                <span className="font-bold text-emerald-600">-{formatCurrency(order.discountAmount)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                <span className="text-slate-900 uppercase text-xs">Tổng Thanh Toán:</span>
                <span className="text-orange-600 text-base">{formatCurrency(order.finalAmount)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phương thức:</span>
                <span className="font-bold text-slate-900">
                  {order.paymentMethod?.toUpperCase() === 'VNPAY' ? 'VNPay Sandbox' : 'COD (Tiền mặt)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trạng thái TT:</span>
                <span className="font-bold text-emerald-600">{order.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
