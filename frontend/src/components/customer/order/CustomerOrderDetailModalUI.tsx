'use client';

import React from 'react';
import {
  X,
  ShoppingBag,
  Warehouse,
  MapPin,
  CreditCard,
  Banknote,
  Package,
  Tag,
  History,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  CircleCheck,
  RefreshCw,
  Phone,
  User,
} from 'lucide-react';
import { OrderResponse, OrderItem } from '@/types/order';
import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';
import { LogisticsMapWrapper } from '@/components/common/map/LogisticsMapWrapper';
import { calculateRealTimeProgress } from '@/utils/logistics-sync';

interface CustomerOrderDetailModalUIProps {
  isOpen: boolean;
  order: OrderResponse | null;
  onClose: () => void;
  onOpenActionModal: (type: 'cancel' | 'return', order: OrderResponse) => void;
  formatCurrency: (val?: number) => string;
  formatDate: (dateStr?: string) => string;
}

export function CustomerOrderDetailModalUI({
  isOpen,
  order,
  onClose,
  onOpenActionModal,
  formatCurrency,
  formatDate,
}: CustomerOrderDetailModalUIProps) {
  if (!isOpen || !order) return null;

  const currentStatus = order.status?.toLowerCase() || '';

  // Calculate simulation progress percentage for customer view based on real-world timestamp
  const simProgress = calculateRealTimeProgress(
    order.status,
    order.updatedAt,
    171.9
  );

  // Stepper helper
  const getStepIdx = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'shipping':
        return 4;
      case 'delivered':
      case 'completed':
        return 5;
      default:
        return 0;
    }
  };

  const stepIdx = getStepIdx(currentStatus);

  const renderVariantAttributes = (attrStr?: string) => {
    if (!attrStr) return null;
    try {
      if (attrStr.startsWith('{')) {
        const parsed = JSON.parse(attrStr);
        return Object.entries(parsed).map(([k, v], idx) => (
          <span
            key={idx}
            className="px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-[10px] font-medium border border-orange-200 dark:border-orange-800"
          >
            {k}: {String(v)}
          </span>
        ));
      }
    } catch {
      // String fallback
    }
    return (
      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
        {attrStr}
      </span>
    );
  };

  const isCancelable = ['pending', 'confirmed', 'processing'].includes(currentStatus);
  const isReturnable = currentStatus === 'delivered';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto transition-colors">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black border border-orange-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                  Đơn Hàng #{order.orderCode}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ngày đặt: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Stepper Timeline */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[10px] font-bold uppercase">
            {[
              { key: 'pending', label: '1. Chờ Duyệt', icon: Clock },
              { key: 'confirmed', label: '2. Đã Duyệt', icon: CheckCircle2 },
              { key: 'processing', label: '3. Đóng Gói', icon: Warehouse },
              { key: 'shipped', label: '4. Gửi GHN', icon: Package },
              { key: 'shipping', label: '5. Đang Giao', icon: RefreshCw },
              { key: 'delivered', label: '6. Đã Giao', icon: CircleCheck },
            ].map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx <= stepIdx;
              const isCurrent = idx === stepIdx;

              return (
                <div
                  key={step.key}
                  className={`p-2 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-orange-500 text-white border-orange-400 shadow-sm ring-2 ring-orange-500/20'
                      : isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mx-auto mb-1" />
                  <span className="block truncate">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Store Warehouse Origin vs Recipient Address Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Hub */}
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <Warehouse className="w-4 h-4" /> Kho Bãi Xuất Hàng Shop
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {STORE_LOCATION_CONSTANTS.STORE_NAME}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {STORE_LOCATION_CONSTANTS.STORE_ADDRESS}
              </p>
            </div>

            {/* Recipient Destination */}
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
              <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Nơi Nhận Hàng Của Bạn
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {order.shippingAddress?.fullName || 'Khách hàng'} (
                {order.shippingAddress?.phone || '---'})
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {order.shippingAddress?.address}, {order.shippingAddress?.city}
              </p>
            </div>
          </div>

          {/* Logistics OSRM Road Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase text-[11px] text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                Bản Đồ Định Vị & Lộ Trình Giao Hàng Real-Time
              </span>
              {order.trackingCode && (
                <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Mã vận đơn: {order.trackingCode}
                </span>
              )}
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
              destName={order.shippingAddress?.fullName}
              destAddress={`${order.shippingAddress?.address || ''}, ${
                order.shippingAddress?.city || ''
              }`}
              orderStatus={order.status}
              progressPercentage={simProgress}
              trackingCode={order.trackingCode}
              height="320px"
            />
          </div>

          {/* Products List */}
          <div className="space-y-3">
            <span className="font-black uppercase text-[11px] text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-orange-500" />
              Sản Phẩm Trong Đơn Hàng
            </span>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-4">Sản Phẩm</th>
                    <th className="py-2.5 px-4">Đơn Giá</th>
                    <th className="py-2.5 px-4 text-center">Số Lượng</th>
                    <th className="py-2.5 px-4 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items?.map((item: OrderItem, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                              SP
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">
                              {item.productName}
                            </p>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {item.sku && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                                  SKU: {item.sku}
                                </span>
                              )}
                              {item.attributes && renderVariantAttributes(item.attributes)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{formatCurrency(item.price)}</td>
                      <td className="py-3 px-4 text-center font-bold">x{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-black">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Financial Breakdown Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Method Details */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="font-black uppercase text-[11px] text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Thanh Toán
              </span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Hình thức:</span>
                <span className="font-bold">
                  {order.paymentMethod === 'VNPAY' ? 'VNPay Sandbox' : 'COD (Tiền mặt)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Trạng thái thanh toán:</span>
                <span className="font-bold uppercase text-orange-600 dark:text-orange-400">
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển (GHN):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Giảm giá voucher:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(order.discountAmount)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-black text-slate-900 dark:text-slate-100 uppercase">
                  Tổng Tiền:
                </span>
                <span className="text-base font-black text-orange-600 dark:text-orange-400">
                  {formatCurrency(order.finalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons inside Modal */}
          {(isCancelable || isReturnable) && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              {isCancelable && (
                <button
                  type="button"
                  onClick={() => onOpenActionModal('cancel', order)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Hủy Đơn Hàng Này</span>
                </button>
              )}

              {isReturnable && (
                <button
                  type="button"
                  onClick={() => onOpenActionModal('return', order)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yêu Cầu Trả Hàng / Hoàn Tiền</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
