'use client';

import React from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Clock,
  Package,
  CheckCircle2,
  CircleCheck,
  XCircle,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  Truck,
  Warehouse,
} from 'lucide-react';
import { useCustomerOrders, CustomerOrderStatusTab } from '@/hooks/useCustomerOrders';
import { OrderItem } from '@/types/order';
import { CustomerOrderDetailModalUI } from './CustomerOrderDetailModalUI';

export function CustomerOrdersContentUI() {
  const {
    orders,
    loading,
    activeTab,
    keyword,
    setKeyword,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    page,
    totalPages,
    setPage,
    selectedOrder,
    isDetailModalOpen,
    updatingCode,
    toastMessage,
    actionModal,
    setActionModal,
    handleTabChange,
    handleOpenDetailModal,
    handleCloseDetailModal,
    handleOpenActionModal,
    handleCloseActionModal,
    handleConfirmAction,
    formatCurrency,
    formatDate,
  } = useCustomerOrders();

  const statusTabs: { key: CustomerOrderStatusTab; label: string; icon: React.ElementType }[] = [
    { key: 'ALL', label: 'Tất Cả', icon: ShoppingBag },
    { key: 'pending', label: 'Chờ Duyệt', icon: Clock },
    { key: 'confirmed', label: 'Đã Duyệt', icon: CheckCircle2 },
    { key: 'processing', label: 'Đóng Gói Kho', icon: Warehouse },
    { key: 'shipped', label: 'Gửi Bưu Cục', icon: Package },
    { key: 'shipping', label: 'Đang Giao', icon: Truck },
    { key: 'delivered', label: 'Hoàn Thành', icon: CircleCheck },
    { key: 'cancelled', label: 'Đã Hủy', icon: XCircle },
    { key: 'returned', label: 'Trả Hàng', icon: RotateCcw },
  ];

  const renderStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Chờ Duyệt</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã Duyệt</span>
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
            <Warehouse className="w-3 h-3" />
            <span>Đang Đóng Gói Kho</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>Bàn Giao GHN</span>
          </span>
        );
      case 'shipping':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>Đang Giao Hàng</span>
          </span>
        );
      case 'delivered':
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CircleCheck className="w-3 h-3" />
            <span>Giao Thành Công</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Đã Hủy</span>
          </span>
        );
      case 'returned':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            <span>Yêu Cầu Trả Hàng</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Toast Notification Popup */}
        {toastMessage && (
          <div className="fixed top-20 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Title */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center font-black">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">
                Quản Lý Đơn Hàng Cá Nhân
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi trạng thái đơn hàng, vị trí bản đồ vận chuyển real-time và yêu cầu trả hàng
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm overflow-x-auto no-scrollbar transition-colors">
          <div className="flex items-center gap-1.5 min-w-max">
            {statusTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Sort Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          {/* Keyword Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã đơn hàng hoặc vận đơn..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Sort Selection Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
              Sắp xếp:
            </span>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [sb, sd] = e.target.value.split('-');
                setSortBy(sb);
                setSortDir(sd);
              }}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
            >
              <option value="createdAt-DESC">Mới nhất (Mặc định)</option>
              <option value="createdAt-ASC">Cũ nhất</option>
              <option value="finalAmount-DESC">Giá trị đơn: Cao nhất</option>
              <option value="finalAmount-ASC">Giá trị đơn: Thấp nhất</option>
            </select>
          </div>
        </div>

        {/* Orders List Container */}
        {loading ? (
          <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-xs text-slate-500 dark:text-slate-400">
              Đang tải danh sách đơn hàng cá nhân...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="font-black text-base text-slate-800 dark:text-slate-200">
              Không tìm thấy đơn hàng nào!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Bạn chưa có đơn hàng nào thuộc mục chọn này. Hãy khám phá sản phẩm và mua sắm ngay tại cửa hàng AP Sports!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStatus = order.status?.toLowerCase() || '';
              const isCancelable = ['pending', 'confirmed', 'processing'].includes(currentStatus);
              const isReturnable = currentStatus === 'delivered';

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                        #{order.orderCode}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.trackingCode && (
                        <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {order.trackingCode}
                        </span>
                      )}
                      {renderStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2">
                    {order.items?.map((item: OrderItem, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80"
                      >
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 shrink-0">
                              SP
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {formatCurrency(item.price)} x{' '}
                              <strong className="text-slate-900 dark:text-slate-100">
                                {item.quantity}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <span className="font-black text-xs text-slate-900 dark:text-slate-100 shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Breakdown & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Tổng thanh toán:
                      </span>
                      <span className="text-base font-black text-orange-600 dark:text-orange-400">
                        {formatCurrency(order.finalAmount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetailModal(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Chi Tiết & Định Vị Bản Đồ</span>
                      </button>

                      {isCancelable && (
                        <button
                          type="button"
                          disabled={updatingCode === order.orderCode}
                          onClick={() => handleOpenActionModal('cancel', order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Hủy Đơn</span>
                        </button>
                      )}

                      {isReturnable && (
                        <button
                          type="button"
                          disabled={updatingCode === order.orderCode}
                          onClick={() => handleOpenActionModal('return', order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Trả Hàng</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Customer Order Detail & Map Modal */}
        <CustomerOrderDetailModalUI
          isOpen={isDetailModalOpen}
          order={selectedOrder}
          onClose={handleCloseDetailModal}
          onOpenActionModal={handleOpenActionModal}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />

        {/* Confirmation Modal for Cancel or Return */}
        {actionModal.type && actionModal.order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 my-auto transition-colors">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-black text-base uppercase flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <span>
                    {actionModal.type === 'cancel'
                      ? 'Xác Nhận Hủy Đơn Hàng'
                      : 'Yêu Cầu Trả Hàng / Hoàn Tiền'}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={handleCloseActionModal}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Bạn có chắc chắn muốn{' '}
                <strong>
                  {actionModal.type === 'cancel'
                    ? 'hủy đơn hàng này'
                    : 'gửi yêu cầu trả hàng/hoàn tiền'}
                </strong>{' '}
                cho đơn <strong>#{actionModal.order.orderCode}</strong> không?
              </p>

              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Lý do (Tùy chọn):
                </label>
                <textarea
                  rows={3}
                  value={actionModal.reason}
                  onChange={(e) =>
                    setActionModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Nhập lý do thực hiện thao tác..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseActionModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Bỏ Qua
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer ${
                    actionModal.type === 'cancel'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  Xác Nhận Thực Hiện
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
