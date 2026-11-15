'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import {
  VoucherTypeFilter,
  VoucherMinOrderFilter,
  VoucherSortOption,
} from '@/hooks/useCustomerVouchers';

interface VoucherFilterBarProps {
  selectedType: VoucherTypeFilter;
  onTypeChange: (type: VoucherTypeFilter) => void;
  selectedMinOrder: VoucherMinOrderFilter;
  onMinOrderChange: (minOrder: VoucherMinOrderFilter) => void;
  onlyUsable: boolean;
  onOnlyUsableChange: (onlyUsable: boolean) => void;
  sortBy: VoucherSortOption;
  onSortChange: (sort: VoucherSortOption) => void;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
}

/**
 * Thanh bộ lọc nâng cao cho Kho Voucher (/vouchers).
 * Hỗ trợ đầy đủ Light và Dark mode.
 */
export const VoucherFilterBar: React.FC<VoucherFilterBarProps> = ({
  selectedType,
  onTypeChange,
  selectedMinOrder,
  onMinOrderChange,
  onlyUsable,
  onOnlyUsableChange,
  sortBy,
  onSortChange,
  filteredCount,
  totalCount,
  onResetFilters,
}) => {
  const hasActiveFilter =
    selectedType !== 'ALL' ||
    selectedMinOrder !== 'ALL' ||
    onlyUsable ||
    sortBy !== 'DEFAULT';

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <span>Bộ Lọc Mã Khuyến Mãi</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold normal-case">
            Hiển thị {filteredCount}/{totalCount} mã
          </span>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Loại ưu đãi */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            Loại ưu đãi
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as VoucherTypeFilter)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="ALL">Tất cả loại giảm</option>
            <option value="FIXED">Giảm tiền trực tiếp (VNĐ)</option>
            <option value="PERCENT">Giảm theo phần trăm (%)</option>
            <option value="FREESHIP">Hỗ trợ phí vận chuyển</option>
          </select>
        </div>

        {/* Điều kiện đơn tối thiểu */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
            Đơn tối thiểu
          </label>
          <select
            value={selectedMinOrder}
            onChange={(e) => onMinOrderChange(e.target.value as VoucherMinOrderFilter)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="ALL">Mọi mức đơn hàng</option>
            <option value="NO_MIN">Đơn từ 0đ (Không điều kiện)</option>
            <option value="UNDER_500K">Đơn tối thiểu dưới 500.000đ</option>
            <option value="FROM_500K">Đơn tối thiểu từ 500.000đ</option>
          </select>
        </div>

        {/* Sắp xếp */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-amber-500" />
            <span>Sắp xếp theo</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as VoucherSortOption)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="DEFAULT">Mặc định</option>
            <option value="EXPIRING_SOON">Sắp hết hạn trước</option>
            <option value="VALUE_DESC">Mức giảm cao nhất</option>
            <option value="MIN_ORDER_ASC">Đơn tối thiểu thấp nhất</option>
          </select>
        </div>

        {/* Chỉ hiện mã còn dùng được */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onOnlyUsableChange(!onlyUsable)}
            className={`w-full px-3 py-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              onlyUsable
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${onlyUsable ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
            <span>Chỉ hiện mã còn dùng được</span>
          </button>
        </div>
      </div>
    </div>
  );
};
