'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useOrderSuccess } from '@/hooks/useOrderSuccess';
import { CheckCircle2, ShoppingBag, Truck, MapPin, Package, FileText } from 'lucide-react';

export default function OrderSuccessContentUI() {
  const { loading, order, errorMsg } = useOrderSuccess();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 text-center">
        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Không Tìm Thấy Đơn Hàng</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-md">{errorMsg || 'Đơn hàng không tồn tại hoặc đã bị gỡ bỏ.'}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md shadow-emerald-500/20"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Quay về Trang chủ</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/40">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Banner thành công */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700/60 p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-full text-emerald-600 dark:text-emerald-400 mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Đặt Hàng Thành Công!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Mã đơn hàng: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">#{order.orderCode}</span>
          </p>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Email xác nhận đơn hàng đã được gửi tới tài khoản của bạn. Đơn hàng đang được hệ thống AP Sports chuẩn bị.
          </p>
        </div>

        {/* Thông tin Đơn hàng & Địa chỉ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột trái: Thông tin nhận hàng & GHN */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3 text-gray-900 dark:text-gray-100 font-bold text-base">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2>Địa Chỉ Nhận Hàng</h2>
            </div>
            {order.shippingAddress ? (
              <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{order.shippingAddress.fullName}</p>
                <p className="text-gray-600 dark:text-gray-400">Điện thoại: {order.shippingAddress.phone}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.address}, {order.shippingAddress.city}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có thông tin địa chỉ</p>
            )}

            {/* Chi cục kho GHN gần nhất */}
            {order.ghnStationName && (
              <div className="pt-3 border-t border-gray-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                  <Truck className="w-4 h-4" />
                  <span>Bưu Cục Kho GHN Xử Lý Gần Nhất:</span>
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{order.ghnStationName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.ghnStationAddress}</p>
                {order.ghnStationLatitude && order.ghnStationLongitude && (
                  <p className="text-[11px] text-gray-400 font-mono mt-1">
                    GPS: ({order.ghnStationLatitude.toFixed(5)}, {order.ghnStationLongitude.toFixed(5)})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cột phải: Phương thức & Tổng tiền */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-700 pb-3 text-gray-900 dark:text-gray-100 font-bold text-base">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2>Thanh Toán & Vận Chuyển</h2>
            </div>
            <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Phương thức thanh toán:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {order.paymentMethod === 'VNPAY' ? 'VNPay Sandbox' : 'Thanh toán COD'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Trạng thái đơn hàng:</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {order.status.toUpperCase()}
                </span>
              </div>
              {order.trackingCode && (
                <div className="flex justify-between">
                  <span>Mã vận đơn GHN:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{order.trackingCode}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tiền hàng:</span>
                <span>{order.totalPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí vận chuyển GHN:</span>
                <span>{order.shippingFee.toLocaleString('vi-VN')} đ</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Giảm giá Voucher:</span>
                  <span>-{order.discountAmount.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between font-bold text-gray-900 dark:text-gray-100 text-base">
                <span>Tổng cộng:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{order.finalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm trong đơn hàng */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/60 p-5 sm:p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base border-b border-gray-100 dark:border-slate-700 pb-3">
            Sản Phẩm Đã Đặt ({order.items.length})
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl bg-gray-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-gray-200 dark:border-slate-600">
                  {item.image ? (
                    <Image src={item.image} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">AP Sports</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{item.productName}</p>
                  {(item.color || item.size) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.color && `Màu: ${item.color}`} {item.size && `| Size: ${item.size}`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Số lượng: x{item.quantity}</p>
                </div>
                <div className="text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons Action */}
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-md shadow-emerald-500/20 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Tiếp Tục Mua Sắm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
