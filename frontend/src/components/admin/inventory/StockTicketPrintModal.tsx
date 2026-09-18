'use client';

import React from 'react';
import Image from 'next/image';
import { X, Printer, FileText, Calendar, Building2, User } from 'lucide-react';
import { InventoryTransaction } from '@/types/inventory';
import { getTicketSummary } from '@/hooks/useWarehouseInventory';
import { printStockTicketDocument } from '@/utils/stockTicketPrinter';

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
    printStockTicketDocument(transaction);
  };

  const {
    ticketTitle,
    formattedDate,
    itemsToRender,
    formattedTotalTicketValue,
  } = getTicketSummary(transaction);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static print:inset-auto">
      {/* Global CSS for 100% Pure White Paper Printout */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Hide all background elements on page */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY printable modal container and its contents */
          .print-pure-white-page,
          .print-pure-white-page * {
            visibility: visible !important;
          }
          .print-pure-white-page {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 15px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            z-index: 9999999 !important;
            overflow: visible !important;
          }
          .print-hidden-element {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col print-pure-white-page">
        {/* Action Header - Hidden when printing */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 print-hidden-element print:hidden bg-slate-50 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <FileText className="w-4 h-4 text-orange-500" />
            <span>Mã Phiếu: <strong className="font-mono text-orange-600">{transaction.code || transaction.ticketNumber}</strong></span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket View Area */}
        <div id="printable-stock-ticket" className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 bg-white text-slate-900 print:overflow-visible print:p-0 print:text-black">
          {/* Company & Ticket Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4 print:border-black">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center p-1.5 print:border">
                <Image src="/images/ap-sports_logo_no-back.png" alt="AP Sports" width={40} height={40} className="object-contain" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 print:text-black">
                  AP SPORTS STORE
                </h2>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Enterprise Inventory System</p>
                <p className="text-[10px] text-slate-500 print:text-gray-600">Hotline: 0988-XXX-XXX • Email: warehouse@apsports.com</p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-[11px] font-mono font-extrabold uppercase text-orange-600 border border-slate-200 print:border-black">
                {transaction.code || transaction.ticketNumber}
              </div>
              <p className="text-[11px] text-slate-500 print:text-gray-600 font-medium">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Ticket Title Banner */}
          <div className="text-center space-y-0.5">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 print:text-black">
              {ticketTitle}
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 print:text-gray-600">
              (Chứng từ xác nhận xuất nhập kho hệ thống AP Sports)
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs print:bg-gray-50 print:border-black">
            <div className="space-y-1">
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

            <div className="space-y-1 text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-bold text-slate-500 print:text-gray-600">Loại phiếu:</span>
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
          <div className="border border-slate-200 rounded-xl overflow-hidden print:border-black">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase print:bg-gray-200 print:text-black">
                  <th className="p-2.5 pl-3">STT</th>
                  <th className="p-2.5">Mã SKU</th>
                  <th className="p-2.5">Tên Sản Phẩm & Biến Thể</th>
                  <th className="p-2.5 text-center">Số Lượng</th>
                  <th className="p-2.5 text-right">Đơn Giá Vốn</th>
                  <th className="p-2.5 pr-3 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                {itemsToRender.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 pl-3 font-bold">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-800 print:text-black max-w-[120px] break-all">{item.variantSku}</td>
                    <td className="p-2.5 space-y-0.5 max-w-[200px]">
                      <div className="font-extrabold text-slate-900 print:text-black">{item.productName}</div>
                      <div className="text-[11px] text-slate-500 print:text-gray-600">
                        Size: <strong className="text-slate-700 print:text-black">{item.variantSize || 'Mặc định'}</strong> • Màu: <strong className="text-slate-700 print:text-black">{item.variantColor || 'Mặc định'}</strong>
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-black text-xs text-slate-900 print:text-black">
                      {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                    </td>
                    <td className="p-2.5 text-right font-semibold text-slate-700 print:text-black">
                      {item.formattedUnitCost}
                    </td>
                    <td className="p-2.5 pr-3 text-right font-black text-orange-600 print:text-black">
                      {item.formattedTotalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Summary Row */}
          <div className="flex justify-between items-center p-3 rounded-xl bg-orange-50 border border-orange-200 print:bg-gray-100 print:border-black">
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
              TỔNG GIÁ TRỊ PHIẾU GIAO DỊCH:
            </span>
            <span className="text-lg font-black text-orange-600 print:text-black">
              {formattedTotalTicketValue}
            </span>
          </div>

          {/* Signature Grid */}
          <div className="grid grid-cols-3 gap-3 text-center pt-6 border-t border-slate-200 text-xs print:border-black print:pt-3">
            <div className="space-y-8">
              <div>
                <strong className="block uppercase font-bold text-slate-900 print:text-black">Người Lập Phiếu</strong>
                <span className="text-[10px] text-slate-400 print:text-gray-600">(Ký & ghi rõ họ tên)</span>
              </div>
              <div className="text-slate-800 font-bold print:text-black">{transaction.createdByUserName || 'Nhân viên'}</div>
            </div>

            <div className="space-y-8">
              <div>
                <strong className="block uppercase font-bold text-slate-900 print:text-black">Thủ Kho AP Sports</strong>
                <span className="text-[10px] text-slate-400 print:text-gray-600">(Ký & ghi rõ họ tên)</span>
              </div>
              <div className="text-slate-400 italic">Xác nhận đã xuất/nhập</div>
            </div>

            <div className="space-y-8">
              <div>
                <strong className="block uppercase font-bold text-slate-900 print:text-black">Đại Diện Giao Nhận</strong>
                <span className="text-[10px] text-slate-400 print:text-gray-600">(Ký & ghi rõ họ tên)</span>
              </div>
              <div className="text-slate-400 italic">Bên nhận / giao hàng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
