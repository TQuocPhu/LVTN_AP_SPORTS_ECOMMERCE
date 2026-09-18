'use client';

import React from 'react';
import {
  InventoryTransaction,
  TransactionType,
  Supplier,
} from '@/types/inventory';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Printer,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

interface InventoryTransactionTableProps {
  transactions: InventoryTransaction[];
  loading: boolean;
  totalElements: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  typeFilter: TransactionType | undefined;
  onTypeFilterChange: (type: TransactionType | undefined) => void;
  supplierFilter: number | undefined;
  onSupplierFilterChange: (supplierId: number | undefined) => void;
  suppliers: Supplier[];
  keyword: string;
  onKeywordChange: (val: string) => void;
  fromDate: string;
  onFromDateChange: (val: string) => void;
  toDate: string;
  onToDateChange: (val: string) => void;
  onSelectTicketToPrint: (transaction: InventoryTransaction) => void;
}

export function InventoryTransactionTable({
  transactions,
  loading,
  totalElements,
  page,
  pageSize,
  onPageChange,
  typeFilter,
  onTypeFilterChange,
  supplierFilter,
  onSupplierFilterChange,
  suppliers,
  keyword,
  onKeywordChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onSelectTicketToPrint,
}: InventoryTransactionTableProps) {
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderBadge = (type: TransactionType) => {
    switch (type) {
      case 'IMPORT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>NHẬP KHO</span>
          </span>
        );
      case 'EXPORT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
            <span>XUẤT KHO</span>
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>KIỂM KÊ</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Mã phiếu, Tên SP, SKU..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={typeFilter || ''}
              onChange={(e) => onTypeFilterChange(e.target.value ? (e.target.value as TransactionType) : undefined)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-500 transition-all"
            >
              <option value="">-- Tất cả loại phiếu --</option>
              <option value="IMPORT">Nhập Kho (Import)</option>
              <option value="EXPORT">Xuất Kho (Export)</option>
              <option value="ADJUSTMENT">Kiểm Kê Kho (Audit)</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={supplierFilter || ''}
              onChange={(e) => onSupplierFilterChange(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:border-orange-500 transition-all"
            >
              <option value="">-- Tất cả Nhà Cung Cấp --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
              />
            </div>
            <span className="text-slate-400 text-xs">-</span>
            <div className="relative flex-1">
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="w-full px-2 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Mã Phiếu</th>
                <th className="py-4 px-6">Loại Phiếu</th>
                <th className="py-4 px-6">Sản Phẩm & Biến Thể</th>
                <th className="py-4 px-6">Nhà Cung Cấp</th>
                <th className="py-4 px-6 text-center">Số Lượng</th>
                <th className="py-4 px-6 text-right">Giá Vốn</th>
                <th className="py-4 px-6 text-center">Tồn (Trước ➔ Sau)</th>
                <th className="py-4 px-6">Thời Gian</th>
                <th className="py-4 px-6 text-center">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-orange-500" />
                    Đang tải nhật ký giao dịch kho...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400 font-medium">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50 text-slate-400" />
                    Không tìm thấy giao dịch xuất nhập kho nào phù hợp.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Code */}
                    <td className="py-4 px-6 font-mono font-bold text-orange-600">
                      {tx.ticketNumber || tx.code}
                    </td>

                    {/* Type Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {renderBadge(tx.type)}
                    </td>

                    {/* Product & Variant */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {tx.productName || 'Sản phẩm'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono pt-0.5">
                        SKU: {tx.variantSku} {tx.variantSize ? `| Size: ${tx.variantSize}` : ''} {tx.variantColor ? `| Màu: ${tx.variantColor}` : ''}
                      </div>
                    </td>

                    {/* Supplier */}
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {tx.supplierName || '---'}
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-6 text-center font-extrabold text-sm">
                      <span
                        className={
                          tx.type === 'IMPORT'
                            ? 'text-emerald-600'
                            : tx.type === 'EXPORT'
                            ? 'text-blue-600'
                            : 'text-purple-600'
                        }
                      >
                        {tx.type === 'IMPORT' ? `+${tx.quantity}` : tx.type === 'EXPORT' ? `-${tx.quantity}` : tx.quantity}
                      </span>
                    </td>

                    {/* Cost */}
                    <td className="py-4 px-6 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(tx.unitCost)}
                    </td>

                    {/* Stock Before -> After */}
                    <td className="py-4 px-6 text-center font-mono text-xs text-slate-500 whitespace-nowrap">
                      <span>{tx.stockBefore ?? '---'}</span>
                      <span className="mx-1 text-slate-400">➔</span>
                      <strong className="text-slate-900 font-bold">{tx.stockAfter ?? '---'}</strong>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>

                    {/* Print Action */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => onSelectTicketToPrint(tx)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200/80 transition-colors shadow-2xs"
                        title="Xem & In Phiếu Kho"
                      >
                        <Printer className="w-3.5 h-3.5 text-orange-500" />
                        <span>In Phiếu</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
          <div>
            Hiển thị <strong className="text-slate-900">{transactions.length}</strong> trên tổng số <strong className="text-slate-900">{totalElements}</strong> phiếu
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
