'use client';

import React from 'react';
import {
  X,
  ShoppingBag,
  Boxes,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  UserCheck,
  Package,
} from 'lucide-react';
import {
  ChartDrilldownRequest,
  ReportDrilldownOrder,
  WarehouseDrilldownStock,
  WarehouseDrilldownTransaction,
} from '@/types/report';
import { ADMIN_ORDER_STATUS_MAP } from '@/constants/admin-order-status';
import { formatCurrency } from '@/utils/formatters';

export interface AdminChartDrilldownModalProps {
  isOpen: boolean;
  loading: boolean;
  activeRequest: ChartDrilldownRequest | null;
  page: number;
  totalElements: number;
  totalPages: number;
  orders: ReportDrilldownOrder[];
  stocks: WarehouseDrilldownStock[];
  transactions: WarehouseDrilldownTransaction[];
  onPageChange: (page: number) => void;
  onClose: () => void;
}

/**
 * Modal Bảng Thống Kê Đối Soát Chi Tiết khi người dùng click vào bất kỳ điểm nút, cột hoặc lát cắt
 * trên các biểu đồ Báo cáo & Dashboard (Giao diện sáng cố định chuẩn Admin, không chứa useState/useEffect).
 * Hỗ trợ 3 chế độ bảng:
 * - ORDERS: Đơn hàng nào, khách nào mua, sản phẩm biến thể nào, số lượng mua, giá trị đơn hàng, trạng thái.
 * - STOCKS: Biến thể SKU nào, danh mục, phân loại, giá vốn/giá bán, số lượng tồn, giá trị vốn tồn.
 * - TRANSACTIONS: Phiếu nhập/xuất kho nào, sản phẩm biến thể, số lượng, đơn giá vốn, thành tiền, thời gian.
 */
export const AdminChartDrilldownModal: React.FC<AdminChartDrilldownModalProps> = ({
  isOpen,
  loading,
  activeRequest,
  page,
  totalElements,
  totalPages,
  orders,
  stocks,
  transactions,
  onPageChange,
  onClose,
}) => {
  if (!isOpen || !activeRequest) return null;

  const formatDateTimeVi = (iso?: string | null) => {
    if (!iso) return '---';
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pageOrderRevenue = orders.reduce((s, o) => s + (o.finalAmount || 0), 0);
  const pageOrderQty = orders.reduce((s, o) => s + (o.totalQuantity || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="flex items-start sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
              {activeRequest.mode === 'STOCKS' ? (
                <Boxes className="w-5 h-5" />
              ) : activeRequest.mode === 'TRANSACTIONS' ? (
                <ArrowLeftRight className="w-5 h-5" />
              ) : (
                <ShoppingBag className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {activeRequest.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white">
                  Tổng: {totalElements} bản ghi
                </span>
              </div>
              {activeRequest.subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{activeRequest.subtitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tóm tắt nhanh trang hiện tại cho bảng Đơn hàng */}
        {activeRequest.mode === 'ORDERS' && !loading && orders.length > 0 && (
          <div className="px-6 py-2.5 bg-orange-50/60 border-b border-orange-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600">
              Đang hiển thị <strong className="text-slate-900">{orders.length}</strong> /{' '}
              <strong className="text-slate-900">{totalElements}</strong> đơn hàng khớp nút biểu đồ
            </span>
            <div className="flex items-center gap-4">
              <span className="text-slate-600">
                SL sản phẩm trang này: <strong className="text-slate-900">{pageOrderQty} món</strong>
              </span>
              <span className="text-slate-600">
                Tổng giá trị trang này:{' '}
                <strong className="text-orange-600">{formatCurrency(pageOrderRevenue)}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Body Bảng dữ liệu chi tiết */}
        <div className="flex-1 overflow-auto p-0">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-9 h-9 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">
                Đang truy xuất dữ liệu bảng chi tiết...
              </p>
            </div>
          ) : activeRequest.mode === 'ORDERS' ? (
            orders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                Không có đơn hàng nào phát sinh tại mốc dữ liệu vừa chọn.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Mã Đơn & Ngày Đặt</th>
                    <th className="py-3 px-4 whitespace-nowrap">Người Mua</th>
                    <th className="py-3 px-4 min-w-[280px]">Sản Phẩm & Biến Thể Đã Mua</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Tổng SL</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Giá Trị Đơn</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord) => {
                    const statusMeta = ADMIN_ORDER_STATUS_MAP[ord.status?.toLowerCase() || ''];
                    const isVnPay = ord.paymentMethod?.toUpperCase() === 'VNPAY';
                    return (
                      <tr key={ord.orderId} className="hover:bg-slate-50/80 align-top">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-black text-slate-900">
                            #{ord.orderCode}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {formatDateTimeVi(ord.createdAt)}
                          </div>
                          {ord.processedByStaffName && (
                            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
                              <UserCheck className="w-3 h-3" />
                              <span>NV: {ord.processedByStaffName}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{ord.customerName}</div>
                          {ord.customerPhone && (
                            <div className="text-[11px] text-slate-500">{ord.customerPhone}</div>
                          )}
                          {ord.customerEmail && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                              {ord.customerEmail}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1.5">
                            {ord.items.map((it, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-xl border text-[11px] flex items-start justify-between gap-2 ${
                                  it.matchedFilter
                                    ? 'bg-orange-50/70 border-orange-300'
                                    : 'bg-slate-50 border-slate-200/80'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 flex items-center gap-1">
                                    <Package className="w-3 h-3 text-orange-500 shrink-0" />
                                    <span className="truncate">{it.productName}</span>
                                  </div>
                                  <div className="text-slate-600 mt-0.5">
                                    <span className="font-semibold text-orange-700">
                                      {it.variantLabel}
                                    </span>
                                    {it.sku && (
                                      <span className="text-slate-400 font-mono ml-1.5">
                                        ({it.sku})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-black text-slate-900">x{it.quantity}</span>
                                  <div className="text-[10px] text-slate-500">
                                    {formatCurrency(it.unitPrice)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center font-black text-slate-900 whitespace-nowrap">
                          {ord.totalQuantity} món
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="font-black text-slate-900 text-xs">
                            {formatCurrency(ord.finalAmount)}
                          </div>
                          {ord.discountAmount > 0 && (
                            <div className="text-[10px] text-rose-600">
                              Giảm: -{formatCurrency(ord.discountAmount)}
                            </div>
                          )}
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-slate-600">
                            {isVnPay ? (
                              <CreditCard className="w-3 h-3 text-blue-500" />
                            ) : (
                              <Banknote className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>{isVnPay ? 'VNPay' : 'COD'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              statusMeta?.badgeClass ||
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {statusMeta?.label || ord.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : activeRequest.mode === 'STOCKS' ? (
            stocks.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Boxes className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                Không có biến thể SKU nào thuộc nhóm tồn kho này.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">SKU / Barcode</th>
                    <th className="py-3 px-4">Sản Phẩm & Danh Mục</th>
                    <th className="py-3 px-4">Phân Loại Biến Thể</th>
                    <th className="py-3 px-4 text-right">Giá Vốn</th>
                    <th className="py-3 px-4 text-right">Giá Bán</th>
                    <th className="py-3 px-4 text-center">Tồn Kho</th>
                    <th className="py-3 px-4 text-right">Giá Trị Vốn Tồn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stocks.map((st) => (
                    <tr key={st.variantId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-slate-900">{st.sku}</div>
                        {st.barcode && (
                          <div className="text-[10px] text-slate-400">{st.barcode}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{st.productName}</div>
                        <div className="text-[11px] text-slate-500">{st.categoryName}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-orange-700">{st.variantLabel}</td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatCurrency(st.costPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        {formatCurrency(st.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                            st.stockQuantity === 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : st.stockQuantity <= 5
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {st.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {formatCurrency(st.inventoryValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              Không có phiếu giao dịch nhập/xuất kho nào trong mốc thời gian vừa chọn.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Mã Phiếu & Thời Gian</th>
                  <th className="py-3 px-4 text-center">Loại</th>
                  <th className="py-3 px-4">Sản Phẩm & Biến Thể</th>
                  <th className="py-3 px-4 text-center">Số Lượng</th>
                  <th className="py-3 px-4 text-right">Đơn Giá Vốn</th>
                  <th className="py-3 px-4 text-right">Tổng Trị Giá</th>
                  <th className="py-3 px-4">Người Lập / Ghi Chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isImport = tx.transactionType === 'IMPORT';
                  return (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{tx.ticketCode}</div>
                        <div className="text-[11px] text-slate-400">
                          {formatDateTimeVi(tx.createdAt)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isImport
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          {isImport ? 'NHẬP KHO' : 'XUẤT KHO'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{tx.productName}</div>
                        <div className="text-[11px] text-orange-700 font-semibold">
                          {tx.variantLabel}{' '}
                          {tx.sku && <span className="text-slate-400 font-mono">({tx.sku})</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-black text-slate-900">
                        {isImport ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatCurrency(tx.unitCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {formatCurrency(tx.totalAmount)}
                      </td>
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-800">{tx.createdByName}</div>
                        {tx.supplierName && (
                          <div className="text-[11px] text-sky-700">NCC: {tx.supplierName}</div>
                        )}
                        {tx.note && (
                          <div className="text-[11px] text-slate-500 line-clamp-2">{tx.note}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Phân trang */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Trang <strong className="text-slate-900">{totalPages === 0 ? 0 : page + 1}</strong> /{' '}
            <strong className="text-slate-900">{totalPages}</strong> ({totalElements} dòng)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || page <= 0}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Trước</span>
            </button>
            <button
              type="button"
              disabled={loading || page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-2 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
