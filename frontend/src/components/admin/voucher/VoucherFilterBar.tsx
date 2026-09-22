import React from 'react';
import { Search, Plus, Filter, ArrowUpDown } from 'lucide-react';
import { VoucherFilterParams } from '@/types/voucher';

interface VoucherFilterBarProps {
  filters: VoucherFilterParams;
  onKeywordChange: (keyword: string) => void;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onCategoryScopeChange: (scope: string) => void;
  onSortChange: (sortBy: 'createdAt' | 'expiresAt' | 'usedCount' | 'value' | 'code' | 'name') => void;
  onOpenCreateModal: () => void;
}

/**
 * Component VoucherFilterBar: Thanh tìm kiếm, lọc loại/trạng thái và nút thêm mới cho Admin Voucher.
 */
export const VoucherFilterBar: React.FC<VoucherFilterBarProps> = ({
  filters,
  onKeywordChange,
  onTypeChange,
  onStatusChange,
  onCategoryScopeChange,
  onSortChange,
  onOpenCreateModal,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 transition-colors duration-200">
      {/* Hàng 1: Search & Button Thêm mới */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Ô Tìm kiếm theo mã hoặc tên */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tìm theo Mã giảm giá (VD: APSSUMMER) hoặc Tên voucher..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Nút Tạo Voucher Mới */}
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm mã mới</span>
        </button>
      </div>

      {/* Hàng 2: Các bộ lọc danh mục, loại, trạng thái, sắp xếp */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Lọc:</span>
        </div>

        {/* Filter Loại Voucher */}
        <select
          value={filters.type || 'ALL'}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
        >
          <option value="ALL">Tất cả loại voucher</option>
          <option value="FIXED">Giảm số tiền cố định</option>
          <option value="PERCENT">Giảm theo phần trăm (%)</option>
          <option value="FREESHIP">Miễn phí vận chuyển</option>
        </select>

        {/* Filter Trạng Thái */}
        <select
          value={filters.status || 'ALL'}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="active">Đang diễn ra (Active)</option>
          <option value="scheduled">Sắp diễn ra (Scheduled)</option>
          <option value="expired">Hết hạn / Đã hết lượt (Expired)</option>
          <option value="disabled">Tạm dừng (Disabled)</option>
        </select>

        {/* Filter Phân loại áp dụng */}
        <select
          value={filters.categoryScope || 'ALL'}
          onChange={(e) => onCategoryScopeChange(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
        >
          <option value="ALL">Tất cả phạm vi áp dụng</option>
          <option value="ALL">Áp dụng Sản phẩm (Toàn sàn)</option>
          <option value="FREESHIP">Áp dụng Phí Vận Chuyển</option>
        </select>

        {/* Dropdown Sắp xếp */}
        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-medium"
          >
            <option value="createdAt">Mới nhất (Mặc định)</option>
            <option value="expiresAt">Hạn sử dụng</option>
            <option value="usedCount">Số lượt đã dùng</option>
            <option value="value">Giá trị giảm</option>
            <option value="code">Mã voucher (A-Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
