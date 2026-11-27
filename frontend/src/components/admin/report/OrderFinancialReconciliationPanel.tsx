'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  DailyReconciliationRow,
  FinancialReconciliationResponse,
} from '@/types/report';
import { formatCurrency } from '@/utils/formatters';

interface OrderFinancialReconciliationPanelProps {
  data: FinancialReconciliationResponse | null;
  paginatedRows: DailyReconciliationRow[];
  page: number;
  totalPages: number;
  loading: boolean;
  paymentMethodFilter: 'ALL' | 'COD' | 'VNPAY';
  onChangePaymentMethod: (method: 'ALL' | 'COD' | 'VNPAY') => void;
  onPageChange: (page: number) => void;
  onSelectDailyRow: (row: DailyReconciliationRow) => void;
}

/**
 * Khối Đối Soát Tài Chính & Sổ Cái Dòng Tiền Theo Ngày (Admin Light Mode).
 * Tái sử dụng chung bộ lọc thời gian từ ReportFilterBar phía trên, hỗ trợ phân trang 10 ngày/trang.
 * Thuần UI: không sử dụng useState / useEffect.
 */
export const OrderFinancialReconciliationPanel: React.FC<OrderFinancialReconciliationPanelProps> = ({
  data,
  paginatedRows,
  page,
  totalPages,
  loading,
  paymentMethodFilter,
  onChangePaymentMethod,
  onPageChange,
  onSelectDailyRow,
}) => {
  const allRowsCount = data?.dailyRows?.length || 0;
  const rows = paginatedRows;
  const exceptions = data?.exceptions || [];

  return (
    <div className="space-y-6 pt-2">
      {/* Tiêu đề & Bộ lọc kênh thanh toán */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Đối Soát Dòng Tiền Theo Ngày & Kênh Thanh Toán
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cân đối sổ cái: <strong>Doanh thu gộp</strong> ={' '}
                <span className="text-emerald-600 font-semibold">Thực thu (Đã giao)</span> +{' '}
                <span className="text-cyan-700 font-semibold">Tạm thu VNPay</span> +{' '}
                <span className="text-amber-600 font-semibold">Chờ thu COD</span> +{' '}
                <span className="text-rose-600 font-semibold">Hủy / Hoàn</span> (Click vào từng ngày để soi đơn)
              </p>
            </div>
          </div>

          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {(['ALL', 'VNPAY', 'COD'] as const).map((method) => {
              const active = paymentMethodFilter === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => onChangePaymentMethod(method)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {method === 'ALL' ? 'Tất cả kênh' : method === 'VNPAY' ? 'VNPay' : 'COD'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bảng Sổ Cái Đối Soát Theo Ngày */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 font-bold">Ngày</th>
                <th className="py-3 px-3 font-bold text-right">Số đơn</th>
                <th className="py-3 px-3 font-bold text-right">Doanh thu gộp</th>
                <th className="py-3 px-3 font-bold text-right">Giảm Voucher</th>
                <th className="py-3 px-3 font-bold text-right">Thực thu VNPay</th>
                <th className="py-3 px-3 font-bold text-right">Thực thu COD</th>
                <th className="py-3 px-3 font-bold text-right text-emerald-700">Thực Thu (Đã giao)</th>
                <th className="py-3 px-3 font-bold text-right text-cyan-700">Tạm thu VNPay</th>
                <th className="py-3 px-3 font-bold text-right text-amber-700">Chờ thu COD</th>
                <th className="py-3 px-3 font-bold text-right text-slate-600">Hủy / Lỗi TT</th>
                <th className="py-3 px-3 font-bold text-right text-rose-700">Cần hoàn tiền</th>
                <th className="py-3 px-3 font-bold text-right text-indigo-700">Đã hoàn tiền</th>
                <th className="py-3 px-3 font-bold text-right">Tỷ lệ thu</th>
                <th className="py-3 px-2 font-bold text-center">Soi đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={14} className="py-10 text-center text-slate-400 font-medium">
                    Đang tổng hợp sổ cái đối soát dòng tiền...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-10 text-center text-slate-400 italic">
                    Không có giao dịch phát sinh trong kỳ đối soát này.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.date}
                    onClick={() => onSelectDailyRow(row)}
                    className="hover:bg-orange-50/60 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {row.label}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      {row.orderCount}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(row.grossRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                      {formatCurrency(row.discountAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-700 font-medium whitespace-nowrap">
                      {formatCurrency(row.vnpayCollectedRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 font-medium whitespace-nowrap">
                      {formatCurrency(row.codCollectedRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(row.netCollectedRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-cyan-700 whitespace-nowrap">
                      {formatCurrency(row.vnpayPrepaidPendingRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-amber-700 whitespace-nowrap">
                      {formatCurrency(row.pendingReconciliationRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 whitespace-nowrap">
                      {formatCurrency(row.cancelledUnpaidRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                      {formatCurrency(row.pendingRefundRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-indigo-700 whitespace-nowrap">
                      {formatCurrency(row.refundedRevenue)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700 whitespace-nowrap">
                      {row.collectionRate.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <ExternalLink className="w-3.5 h-3.5 text-orange-500 inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && allRowsCount > 0 && data && (
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300 text-xs font-black text-slate-900">
                  <td className="py-3 px-2.5 whitespace-nowrap">TỔNG KỲ ĐỐI SOÁT</td>
                  <td className="py-3 px-3 text-right">{data.totalOrders}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">{formatCurrency(data.grossRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-slate-600">{formatCurrency(data.totalDiscountAmount)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-blue-700">{formatCurrency(data.vnpayCollectedRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">{formatCurrency(data.codCollectedRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-emerald-700">{formatCurrency(data.netCollectedRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-cyan-700">{formatCurrency(data.vnpayPrepaidPendingRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-amber-700">{formatCurrency(data.pendingReconciliationRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-slate-700">{formatCurrency((data.cancelledUnpaidRevenue || 0) + (data.paymentFailedRevenue || 0))}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-rose-700">{formatCurrency(data.pendingRefundRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap text-indigo-700">{formatCurrency(data.refundedRevenue)}</td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">{data.collectionRate.toFixed(1)}%</td>
                  <td className="py-3 px-2" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Thanh phân trang 10 ngày / trang */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-1 text-xs">
            <span className="text-slate-500">
              Hiển thị <strong className="text-slate-800">{rows.length}</strong> /{' '}
              <strong className="text-slate-800">{allRowsCount}</strong> ngày phát sinh (Trang{' '}
              <strong className="text-slate-800">{page + 1}</strong>/{totalPages})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page <= 0}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Cảnh báo chênh lệch cần kế toán xử lý (nếu có) */}
        {!loading && exceptions.length > 0 && (
          <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Đơn cần hoàn tiền & chênh lệch đối soát ({exceptions.length} đơn)</span>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
              >
                <span>Mở Quản Lý Đơn Hàng để xác nhận hoàn tiền</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg border border-rose-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-rose-50 text-rose-900 border-b border-rose-200">
                    <th className="py-2 px-3 font-bold">Mã đơn</th>
                    <th className="py-2 px-3 font-bold">Khách hàng</th>
                    <th className="py-2 px-3 font-bold">Kênh / TT</th>
                    <th className="py-2 px-3 font-bold">Trạng thái đơn</th>
                    <th className="py-2 px-3 font-bold text-right">Số tiền</th>
                    <th className="py-2 px-3 font-bold">Nội dung chênh lệch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {exceptions.map((ex) => (
                    <tr key={ex.orderId}>
                      <td className="py-2 px-3 font-bold text-slate-900">{ex.orderCode}</td>
                      <td className="py-2 px-3 text-slate-700">{ex.customerName}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {ex.paymentMethod} ({ex.paymentStatus})
                      </td>
                      <td className="py-2 px-3 text-slate-700">{ex.orderStatus}</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-700 whitespace-nowrap">
                        {formatCurrency(ex.amount)}
                      </td>
                      <td className="py-2 px-3 text-rose-700 font-medium">{ex.issueDescription}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
