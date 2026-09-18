'use client';

import React from 'react';
import { X, Package, Printer, Building2, Calendar, User } from 'lucide-react';
import { InventoryTransaction } from '@/types/inventory';
import { getTicketSummary } from '@/hooks/useWarehouseInventory';

interface StockTicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: InventoryTransaction | null;
  onPrint?: (transaction: InventoryTransaction) => void;
}

export function StockTicketDetailsModal({
  isOpen,
  onClose,
  transaction,
  onPrint,
}: StockTicketDetailsModalProps) {
  if (!isOpen || !transaction) return null;

  const isImport = transaction.type === 'IMPORT';
  const isExport = transaction.type === 'EXPORT';

  const {
    formattedDate,
    itemsToRender,
    formattedTotalTicketValue,
    totalTicketQty,
  } = getTicketSummary(transaction);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Chi Tiết Mặt Hàng Trong Phiếu
              </h3>
              <span className="px-2.5 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-mono font-extrabold border border-orange-200">
                {transaction.code || transaction.ticketNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Danh sách chi tiết các biến thể và số lượng thực hiện trong giao dịch
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Metadata Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-400 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>Thời gian lập:</span>
              </div>
              <div className="font-bold text-slate-900">{formattedDate}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-400 font-bold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span>Người thực hiện:</span>
              </div>
              <div className="font-bold text-slate-900">{transaction.createdByUserName || 'Quản lý kho'}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-400 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-500" />
                <span>Nhà cung cấp:</span>
              </div>
              <div className="font-bold text-slate-900 truncate">
                {transaction.supplierName ? `${transaction.supplierName} (${transaction.supplierCode})` : '---'}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Sản Phẩm & Biến Thể</th>
                  <th className="py-3 px-4">Mã SKU</th>
                  <th className="py-3 px-4 text-center">Số Lượng</th>
                  <th className="py-3 px-4 text-right">Giá Vốn</th>
                  <th className="py-3 px-4 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {itemsToRender.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        Size: <strong className="text-slate-700">{item.variantSize || 'Mặc định'}</strong> • Màu: <strong className="text-slate-700">{item.variantColor || 'Mặc định'}</strong>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 break-all">{item.variantSku}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-sm">
                      <span className={isImport ? 'text-emerald-600' : isExport ? 'text-blue-600' : 'text-purple-600'}>
                        {isImport ? `+${item.quantity}` : isExport ? `-${item.quantity}` : item.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      {item.formattedUnitCost}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-orange-600">
                      {item.formattedTotalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
            <span>Tổng số lượng: <strong className="text-orange-600">{totalTicketQty} món</strong></span>
            <span>|</span>
            <span>Tổng giá trị: <strong className="text-orange-600 text-sm">{formattedTotalTicketValue}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {onPrint && (
              <button
                onClick={() => {
                  onClose();
                  onPrint(transaction);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Kho</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
