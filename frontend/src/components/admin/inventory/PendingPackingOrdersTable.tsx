'use client';

import React from 'react';
import {
  PackageCheck,
  Scan,
  Clock,
  User,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { AdminOrderDetail } from '@/types/admin-order';
import { useOrderPackingScanner } from '@/hooks/useOrderPackingScanner';
import { OrderPackingScannerModal } from '@/components/admin/order/OrderPackingScannerModal';

interface PendingPackingOrdersTableProps {
  orders: AdminOrderDetail[];
  loading: boolean;
  selectedOrder: AdminOrderDetail | null;
  onSelectOrder: (order: AdminOrderDetail | null) => void;
  onOrderPacked: (updated: AdminOrderDetail) => void;
}

export function PendingPackingOrdersTable({
  orders,
  loading,
  selectedOrder,
  onSelectOrder,
  onOrderPacked,
}: PendingPackingOrdersTableProps) {
  // Hook máy quét barcode cho đơn hàng đang chọn
  const scanner = useOrderPackingScanner({
    order: selectedOrder,
    onSuccess: (updated) => {
      onOrderPacked(updated);
    },
  });

  const handleOpenScanner = (order: AdminOrderDetail) => {
    onSelectOrder(order);
    scanner.openModal();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-bold text-slate-500 text-xs">Đang tải danh sách đơn hàng chờ kiểm đếm đóng gói...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-black text-slate-800">Không có đơn hàng nào chờ đóng gói</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Tất cả đơn hàng đã được kiểm đếm Barcode 100% hoặc đã được xuất kho bàn giao vận chuyển.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-600 font-bold">
          Có <strong className="text-indigo-600 font-black">{orders.length}</strong> đơn hàng đã duyệt cần thủ kho kiểm đếm Barcode và niêm phong:
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Mã Đơn Hàng</th>
              <th className="p-4">Khách Hàng & Địa Chỉ</th>
              <th className="p-4">Số Lượng Mặt Hàng</th>
              <th className="p-4">Tổng Tiền</th>
              <th className="p-4">Ngày Duyệt Đơn</th>
              <th className="p-4 text-right">Thao Tác Kho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {orders.map((order) => {
              const totalItemsCount = order.items?.reduce((sum, it) => sum + it.quantity, 0) || 0;

              return (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 text-sm">
                    <span className="text-indigo-600">#{order.orderCode}</span>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      {order.paymentMethod?.toUpperCase()} • {order.status}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerName || 'Khách hàng'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                      {order.shippingAddress?.address || '---'}, {order.shippingAddress?.city || ''}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4 text-orange-500" />
                      <span>{totalItemsCount} món</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ({order.items?.length || 0} dòng sản phẩm)
                    </div>
                  </td>
                  <td className="p-4 font-black text-slate-900 text-sm">
                    {formatCurrency(order.finalAmount || order.totalPrice)}
                  </td>
                  <td className="p-4 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenScanner(order)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Scan className="w-4 h-4" />
                      <span>Quét Barcode Đóng Gói</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Scanner */}
      <OrderPackingScannerModal
        isOpen={scanner.isOpen}
        onClose={scanner.closeModal}
        order={selectedOrder}
        scannedMap={scanner.scannedMap}
        manualCode={scanner.manualCode}
        onManualCodeChange={scanner.setManualCode}
        onScanCode={scanner.handleScanCode}
        onReset={scanner.handleReset}
        onSubmit={scanner.handleSubmit}
        note={scanner.note}
        onNoteChange={scanner.setNote}
        loading={scanner.loading}
        totalRequired={scanner.totalRequired}
        totalScanned={scanner.totalScanned}
        isAllScanned={scanner.isAllScanned}
        progressPercentage={scanner.progressPercentage}
        inputRef={scanner.inputRef}
      />
    </div>
  );
}
