'use client';

import React from 'react';
import {
  X,
  Ticket,
  Search,
  Sparkles,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Truck,
  Percent,
  Banknote,
  Loader2,
} from 'lucide-react';
import {
  CheckoutVoucherTab,
  CheckoutEligibleVoucher,
  CheckoutIneligibleVoucher,
} from '@/types/voucher';

interface CheckoutVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  applying: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  tabFilter: CheckoutVoucherTab;
  onTabChange: (tab: CheckoutVoucherTab) => void;
  subtotal: number;
  shippingFee: number;
  appliedCode?: string;
  modalError: string | null;
  eligibleVouchers: CheckoutEligibleVoucher[];
  ineligibleVouchers: CheckoutIneligibleVoucher[];
  onRefresh: () => void;
  onSelectVoucher: (code: string) => void;
}

/**
 * Modal chọn nhanh Voucher tại trang Đặt hàng (/checkout).
 * Thuần UI (không chứa useState/useEffect), hỗ trợ đầy đủ Light & Dark mode.
 */
export function CheckoutVoucherModal({
  isOpen,
  onClose,
  loading,
  applying,
  searchQuery,
  onSearchChange,
  tabFilter,
  onTabChange,
  subtotal,
  shippingFee,
  appliedCode,
  modalError,
  eligibleVouchers,
  ineligibleVouchers,
  onRefresh,
  onSelectVoucher,
}: CheckoutVoucherModalProps) {
  if (!isOpen) return null;

  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderTypeIcon = (type: string) => {
    const t = type?.toUpperCase();
    if (t === 'FREESHIP') return <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (t === 'PERCENT') return <Percent className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
    return <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Chọn Voucher AP Sports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đơn hàng: <strong className="text-slate-800 dark:text-slate-200">{subtotal.toLocaleString('vi-VN')} đ</strong>
                {' • '}Phí ship: <strong className="text-slate-800 dark:text-slate-200">{shippingFee.toLocaleString('vi-VN')} đ</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Làm mới danh sách mã"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Quick Tabs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm theo mã hoặc tên chương trình khuyến mãi..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL' as CheckoutVoucherTab, label: 'Tất Cả' },
              { id: 'DISCOUNT' as CheckoutVoucherTab, label: 'Giảm Tiền Hàng' },
              { id: 'FREESHIP' as CheckoutVoucherTab, label: 'Freeship' },
            ].map((tab) => {
              const active = tabFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                    active
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {modalError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span>Đang kiểm tra các mã khuyến mãi phù hợp...</span>
            </div>
          ) : eligibleVouchers.length === 0 && ineligibleVouchers.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-400 dark:text-slate-500">
              <Ticket className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Không tìm thấy mã khuyến mãi phù hợp
              </p>
              <p className="text-xs">Hãy thử xóa từ khóa tìm kiếm hoặc chuyển sang tab khác.</p>
            </div>
          ) : (
            <>
              {/* Nhóm 1: Đủ điều kiện */}
              {eligibleVouchers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Có Thể Áp Dụng ({eligibleVouchers.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Sắp xếp theo mức giảm tốt nhất</span>
                  </div>

                  <div className="space-y-2.5">
                    {eligibleVouchers.map(({ voucher, estimatedDiscount, isBestChoice }) => {
                      const isSelected = appliedCode?.toUpperCase() === voucher.code.toUpperCase();
                      return (
                        <div
                          key={voucher.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-orange-50/80 dark:bg-orange-950/30 border-orange-500 ring-2 ring-orange-500/20'
                              : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black text-slate-900 dark:text-white">
                                {renderTypeIcon(voucher.type)}
                                {voucher.code}
                              </span>
                              {isBestChoice && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase shadow-xs">
                                  <Sparkles className="w-3 h-3" />
                                  Gợi ý tốt nhất
                                </span>
                              )}
                              {estimatedDiscount > 0 && (
                                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                  Giảm ~{estimatedDiscount.toLocaleString('vi-VN')} đ
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {voucher.name}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>
                                Đơn tối thiểu:{' '}
                                {Number(voucher.minOrderValue || 0) > 0
                                  ? `${Number(voucher.minOrderValue).toLocaleString('vi-VN')} đ`
                                  : '0 đ'}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> HSD: {formatExpiry(voucher.expiresAt)}
                              </span>
                              {voucher.remainingUserUses != null && voucher.userUsageLimit != null && (
                                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                                  Còn {voucher.remainingUserUses}/{voucher.userUsageLimit} lượt của bạn
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={applying}
                            onClick={() => onSelectVoucher(voucher.code)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đang Dùng</span>
                              </>
                            ) : (
                              <span>Áp Dụng</span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Nhóm 2: Chưa đủ điều kiện */}
              {ineligibleVouchers.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Chưa Đủ Điều Kiện ({ineligibleVouchers.length})
                  </span>

                  <div className="space-y-2.5">
                    {ineligibleVouchers.map(({ voucher, reason, missingAmount, progressPercent }) => (
                      <div
                        key={voucher.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 opacity-75 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                {renderTypeIcon(voucher.type)}
                                {voucher.code}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                HSD: {formatExpiry(voucher.expiresAt)}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {voucher.name}
                            </p>
                          </div>

                          <span className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold shrink-0">
                            Chưa đủ ĐK
                          </span>
                        </div>

                        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{reason}</span>
                        </p>

                        {missingAmount > 0 && (
                          <div className="space-y-1">
                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 text-right">
                              Đã đạt {progressPercent}% giá trị đơn tối thiểu
                            </p>
                          </div>
                        )}
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
