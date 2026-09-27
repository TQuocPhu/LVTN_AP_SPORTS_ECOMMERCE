'use client';

import React from 'react';
import {
  X,
  UserCheck,
  CreditCard,
  History,
  ShoppingBag,
  Package,
  Banknote,
  RefreshCw,
  XCircle,
  Clock,
  CircleCheck,
  FileText,
  Tag,
  Check,
  MapPin,
  Building,
  Phone,
  User,
  Navigation,
  Warehouse,
} from 'lucide-react';
import { AdminOrderDetail } from '@/types/admin-order';
import { STORE_LOCATION_CONSTANTS } from '@/constants/location-constants';
import { LogisticsMapWrapper } from '@/components/common/map/LogisticsMapWrapper';
import { LogisticsControlPanel } from '@/components/admin/order/LogisticsControlPanel';
import { useAdminOrderDetailModal } from '@/hooks/useAdminOrderDetailModal';

interface AdminOrderDetailModalProps {
  isOpen: boolean;
  order: AdminOrderDetail | null;
  loading: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export function AdminOrderDetailModal({
  isOpen,
  order,
  loading,
  onClose,
  onStatusUpdated,
}: AdminOrderDetailModalProps) {
  const {
    currentOrder,
    einvoiceSent,
    toastMessage,
    setToastMessage,
    updatingStatus,
    simProgress,
    setSimProgress,
    handleSendEinvoice,
    handleUpdateStatus,
    formatCurrency,
    formatDate,
  } = useAdminOrderDetailModal({
    order,
    onStatusUpdated,
  });

  if (!isOpen) return null;

  const renderVariantAttributes = (attrStr?: string) => {
    if (!attrStr) return null;
    try {
      if (attrStr.startsWith('{')) {
        const parsed = JSON.parse(attrStr);
        return Object.entries(parsed).map(([k, v], idx) => (
          <span
            key={idx}
            className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200"
          >
            {k}: {String(v)}
          </span>
        ));
      }
    } catch {
      // String format fallback
    }
    return (
      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
        {attrStr}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto transition-all">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black border border-orange-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Đơn Hàng #{currentOrder?.orderCode}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-50 text-orange-600 border border-orange-200">
                  {currentOrder?.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ngày đặt: {formatDate(currentOrder?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSendEinvoice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                einvoiceSent
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
              title="Gửi hóa đơn điện tử E-Invoice tới email khách hàng"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{einvoiceSent ? 'Đã Phát E-Invoice' : 'Gửi Hóa Đơn Điện Tử'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold text-slate-500">Đang tải thông tin chi tiết đơn hàng...</p>
            </div>
          ) : !currentOrder ? (
            <div className="py-12 text-center text-slate-400">
              Không tìm thấy thông tin đơn hàng
            </div>
          ) : (
            <>
              {/* Control Panel: Logistics Simulation & Status Transition */}
              <LogisticsControlPanel
                currentStatus={currentOrder.status}
                trackingCode={currentOrder.trackingCode}
                onUpdateStatus={handleUpdateStatus}
                onProgressChange={(val) => setSimProgress(val)}
                updating={updatingStatus}
              />

              {/* Warehouse Origin vs Recipient Destination Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Origin Warehouse Card */}
                <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-orange-700 flex items-center gap-1.5">
                      <Warehouse className="w-4 h-4 text-orange-600" />
                      Kho Bãi Xuất Hàng Shop
                    </span>
                    <span className="px-2 py-0.5 rounded bg-orange-200/80 text-orange-800 text-[10px] font-bold">
                      Origin Hub
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      {STORE_LOCATION_CONSTANTS.STORE_NAME}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {STORE_LOCATION_CONSTANTS.STORE_ADDRESS}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-orange-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Tọa độ GPS Kho:</span>
                    <span className="font-mono font-bold text-orange-800">
                      ({STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE},{' '}
                      {STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE})
                    </span>
                  </div>
                </div>

                {/* Receiver Destination Card */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-emerald-700 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      Người Nhận & Địa Chỉ Giao Hàng
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-800 text-[10px] font-bold">
                      Destination
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <span>{currentOrder.shippingAddress?.fullName || currentOrder.customerName}</span>
                      <span className="text-slate-500 font-normal text-xs">
                        ({currentOrder.shippingAddress?.phone || currentOrder.customerPhone || '---'})
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {currentOrder.shippingAddress?.address || 'Chưa cập nhật số nhà'},{' '}
                      {currentOrder.shippingAddress?.city || ''}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Tọa độ GPS Đích:</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {currentOrder.gpsLatitude
                        ? `(${currentOrder.gpsLatitude.toFixed(5)}, ${currentOrder.gpsLongitude?.toFixed(5)})`
                        : '---'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Logistics Leaflet Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black uppercase text-[11px] text-slate-900">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>Bản Đồ Định Vị & Lộ Trình Vận Chuyển Real-Time (OSRM Road Engine)</span>
                  </div>
                  {currentOrder.trackingCode && (
                    <span className="font-mono text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      Mã vận đơn: {currentOrder.trackingCode}
                    </span>
                  )}
                </div>

                <LogisticsMapWrapper
                  orderId={currentOrder.id}
                  orderCode={currentOrder.orderCode}
                  originLat={STORE_LOCATION_CONSTANTS.STORE_GPS_LATITUDE}
                  originLng={STORE_LOCATION_CONSTANTS.STORE_GPS_LONGITUDE}
                  originName={STORE_LOCATION_CONSTANTS.STORE_NAME}
                  originAddress={STORE_LOCATION_CONSTANTS.STORE_ADDRESS}
                  destLat={currentOrder.gpsLatitude}
                  destLng={currentOrder.gpsLongitude}
                  destName={currentOrder.shippingAddress?.fullName || currentOrder.customerName}
                  destAddress={`${currentOrder.shippingAddress?.address || ''}, ${
                    currentOrder.shippingAddress?.city || ''
                  }`}
                  orderStatus={currentOrder.status}
                  progressPercentage={simProgress}
                  trackingCode={currentOrder.trackingCode}
                  height="340px"
                />
              </div>

              {/* Customer Account & Payment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Account Info Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 uppercase text-[11px] text-orange-600">
                    <User className="w-4 h-4" />
                    <span>Thông Tin Tài Khoản Đặt Hàng & Nhân Viên</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {currentOrder.customerName || 'Khách hàng'}
                    </span>
                  </div>
                  <div className="text-slate-500 space-y-0.5">
                    <p>
                      Email:{' '}
                      <span className="font-medium text-slate-800">
                        {currentOrder.customerEmail || '---'}
                      </span>
                    </p>
                    <p>
                      SĐT tài khoản:{' '}
                      <span className="font-medium text-slate-800">
                        {currentOrder.customerPhone || '---'}
                      </span>
                    </p>
                    <p>
                      Nhân viên xử lý:{' '}
                      <span className="font-medium text-slate-800">
                        {currentOrder.processedByStaff?.name || 'Chưa phân công'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Payment Info Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-orange-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Thanh Toán & Ghi Chú</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Phương thức:</span>
                    <span className="inline-flex items-center gap-1 font-extrabold text-slate-900">
                      {currentOrder.paymentMethod?.toUpperCase() === 'VNPAY' ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-blue-500" /> VNPay Sandbox
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" /> COD (Tiền mặt)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Trạng thái TT:</span>
                    {(() => {
                      switch (currentOrder.paymentStatus?.toLowerCase()) {
                        case 'completed':
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <CircleCheck className="w-3 h-3" /> Đã thanh toán
                            </span>
                          );
                        case 'refunded':
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-700 border border-cyan-200">
                              <RefreshCw className="w-3 h-3" /> Đã hoàn tiền
                            </span>
                          );
                        case 'failed':
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Thất bại
                            </span>
                          );
                        default:
                          return (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Chờ thanh toán
                            </span>
                          );
                      }
                    })()}
                  </div>
                  {currentOrder.note && (
                    <div className="pt-2 border-t border-slate-200 text-slate-500 italic">
                      &quot;{currentOrder.note}&quot;
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-slate-900">
                  <Package className="w-4 h-4 text-orange-500" />
                  <span>Danh Sách Sản Phẩm & Biến Thể Trong Đơn</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500">
                        <th className="py-2.5 px-4">Sản Phẩm & Biến Thể</th>
                        <th className="py-2.5 px-4">Đơn Giá</th>
                        <th className="py-2.5 px-4 text-center">Số Lượng</th>
                        <th className="py-2.5 px-4 text-right">Thành Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentOrder.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.productName}
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                  SP
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900">{item.productName}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  {item.sku && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">
                                      SKU: {item.sku}
                                    </span>
                                  )}
                                  {item.attributes && renderVariantAttributes(item.attributes)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-900">
                            x{item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coupon Card & Financial Breakdown Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Khung Mã Khuyến Mãi */}
                <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
                  <div className="flex items-center gap-2 font-black uppercase text-[11px] text-orange-700">
                    <Tag className="w-4 h-4" />
                    <span>Mã Khuyến Mãi Đã Khách Chọn</span>
                  </div>
                  {currentOrder.couponCode || currentOrder.discountAmount > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-orange-900 text-xs font-mono px-2 py-0.5 bg-orange-100 rounded border border-orange-300">
                          {currentOrder.couponCode || 'AP SPORTS VOUCHER'}
                        </span>
                        <span className="font-black text-emerald-600 text-sm">
                          -{formatCurrency(currentOrder.discountAmount)}
                        </span>
                      </div>
                      {currentOrder.couponName && (
                        <p className="text-xs text-orange-800 font-medium">
                          {currentOrder.couponName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic pt-1">
                      Đơn hàng không sử dụng mã khuyến mãi.
                    </p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between text-slate-500">
                    <span>Tạm tính hàng hoá:</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(currentOrder.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Phí vận chuyển (GHN):</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(currentOrder.shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Giảm giá khuyến mãi:</span>
                    <span className="font-bold text-emerald-600">
                      -{formatCurrency(currentOrder.discountAmount)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-900 uppercase text-xs">
                      Tổng Tiền Thanh Toán:
                    </span>
                    <span className="text-base font-black text-orange-600">
                      {formatCurrency(currentOrder.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status History Timeline */}
              {currentOrder.statusHistories && currentOrder.statusHistories.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 font-bold uppercase text-[11px] text-slate-900">
                    <History className="w-4 h-4 text-orange-500" />
                    <span>Lịch Sử Cập Nhật Trạng Thái Đơn Hàng</span>
                  </div>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {currentOrder.statusHistories.map((h, i) => (
                      <div key={i} className="relative flex items-start justify-between">
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-white" />
                        <div>
                          <p className="font-bold text-slate-900">
                            Trạng thái: <span className="uppercase text-orange-600">{h.status}</span>
                          </p>
                          {h.note && <p className="text-slate-500 italic">&quot;{h.note}&quot;</p>}
                          <p className="text-[10px] text-slate-400">
                            Thực hiện bởi: {h.changedByName || 'Hệ thống'}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {formatDate(h.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
