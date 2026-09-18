'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, FileText, Calendar, Building2, User } from 'lucide-react';
import { InventoryTransaction } from '@/types/inventory';

interface StockTicketPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: InventoryTransaction | null;
}

export function StockTicketPrintModal({
  isOpen,
  onClose,
  transaction,
}: StockTicketPrintModalProps) {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isImport = transaction.type === 'IMPORT';
  const isExport = transaction.type === 'EXPORT';

  const ticketTitle = isImport
    ? 'PHIẾU NHẬP KHO THÀNH PHẨM'
    : isExport
    ? 'PHIẾU XUẤT KHO THÀNH PHẨM'
    : 'PHIẾU KIỂM KÊ ĐIỀU CHỈNH TỒN KHO';

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedUnitCost = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.unitCost || 0);
  const formattedTotalAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.totalAmount || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none print:bg-white print:text-black">
        {/* Action Header - Hidden when printing */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 print:hidden bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileText className="w-4 h-4 text-orange-500" />
            <span>Xem & In Phiếu Kho: <strong className="font-mono text-orange-600">{transaction.ticketNumber}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu (Print / PDF)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket View Area */}
        <div id="printable-stock-ticket" className="p-6 sm:p-10 space-y-8 bg-white text-slate-900 print:p-6 print:text-black">
          {/* Company & Ticket Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 print:border-black">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center p-2 print:border">
                <Image src="/images/ap-sports_logo_no-back.png" alt="AP Sports" width={48} height={48} className="object-contain" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 print:text-black">
                  AP SPORTS STORE
                </h2>
                <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest">Flexible Enterprise Storefront</p>
                <p className="text-[11px] text-slate-500 print:text-gray-600">Hotline: 0988-XXX-XXX | Email: warehouse@apsports.com</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded-xl bg-slate-100 text-xs font-mono font-black uppercase text-orange-600 border border-slate-200 print:border-black">
                MÃ PHIẾU: {transaction.ticketNumber}
              </div>
              <p className="text-xs text-slate-500 print:text-gray-600 font-medium">
                Ngày lập: {formattedDate}
              </p>
            </div>
          </div>

          {/* Ticket Title Banner */}
          <div className="text-center space-y-1 py-2">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 print:text-black">
              {ticketTitle}
            </h1>
            <p className="text-xs font-semibold text-slate-500 print:text-gray-600">
              (Hệ thống tự động phát hành chứng từ giao dịch kho)
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs print:bg-gray-50 print:border-black">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-bold text-slate-500 print:text-gray-600">Người lập phiếu:</span>
                <strong className="text-slate-900 print:text-black">{transaction.createdByUserName || 'Quản lý kho'}</strong>
              </div>
              {transaction.supplierName && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-500" />
                  <span className="font-bold text-slate-500 print:text-gray-600">Nhà cung cấp:</span>
                  <strong className="text-slate-900 print:text-black">{transaction.supplierName} ({transaction.supplierCode})</strong>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-bold text-slate-500 print:text-gray-600">Loại giao dịch:</span>
                <strong className="text-slate-900 uppercase print:text-black">{transaction.type}</strong>
              </div>
              {transaction.note && (
                <div className="text-[11px] text-slate-600 italic">
                  Ghi chú: "{transaction.note}"
                </div>
              )}
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden print:border-black">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase print:bg-gray-200 print:text-black">
                  <th className="p-3 pl-4">#</th>
                  <th className="p-3">Mã SKU</th>
                  <th className="p-3">Tên Sản Phẩm & Biến Thể</th>
                  <th className="p-3 text-center">Số Lượng</th>
                  <th className="p-3 text-right">Đơn Giá Vốn</th>
                  <th className="p-3 pr-4 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                <tr>
                  <td className="p-3 pl-4 font-bold">1</td>
                  <td className="p-3 font-mono font-bold text-slate-800 print:text-black">{transaction.variantSku || 'SKU'}</td>
                  <td className="p-3 space-y-0.5">
                    <div className="font-extrabold text-slate-900 print:text-black">{transaction.productName}</div>
                    <div className="text-[11px] text-slate-500 print:text-gray-600">
                      Size: <strong className="text-slate-700 print:text-black">{transaction.variantSize || 'Mặc định'}</strong> • Màu: <strong className="text-slate-700 print:text-black">{transaction.variantColor || 'Mặc định'}</strong>
                    </div>
                  </td>
                  <td className="p-3 text-center font-black text-sm text-slate-900 print:text-black">
                    {transaction.quantity > 0 ? `+${transaction.quantity}` : transaction.quantity}
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-700 print:text-black">{formattedUnitCost}</td>
                  <td className="p-3 pr-4 text-right font-black text-orange-600 print:text-black">{formattedTotalAmount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Summary Row */}
          <div className="flex justify-between items-center p-4 rounded-2xl bg-orange-50 border border-orange-200 print:bg-gray-100 print:border-black">
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
              TỔNG GIÁ TRỊ PHIẾU GIAO DỊCH:
            </span>
            <span className="text-xl font-black text-orange-600 print:text-black">
              {formattedTotalAmount}
            </span>
          </div>

          {/* Signature Grid */}
          <div className="grid grid-cols-3 gap-4 text-center pt-8 border-t border-slate-200 text-xs print:border-black print:pt-4">
            <div className="space-y-12">
              <div>
                <strong className="block uppercase font-bold text-slate-900 print:text-black">Người Lập Phiếu</strong>
                <span className="text-[10px] text-slate-400 print:text-gray-600">(Ký & ghi rõ họ tên)</span>
              </div>
              <div className="text-slate-800 font-bold print:text-black">{transaction.createdByUserName || 'Nhân viên'}</div>
            </div>

            <div className="space-y-12">
              <div>
                <strong className="block uppercase font-bold text-slate-900 print:text-black">Thủ Kho AP Sports</strong>
                <span className="text-[10px] text-slate-400 print:text-gray-600">(Ký & ghi rõ họ tên)</span>
              </div>
              <div className="text-slate-400 italic">Xác nhận đã kiểm nhập/xuất</div>
            </div>

            <div className="space-y-12">
              <div>
                <strong className="block uppercase font-bold text-slate-900 print:text-black">Đại Diện Giao Nhận</strong>
                <span className="text-[10px] text-slate-400 print:text-gray-600">(Ký & ghi rõ họ tên)</span>
              </div>
              <div className="text-slate-400 italic">Bên giao/bên nhận hàng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
