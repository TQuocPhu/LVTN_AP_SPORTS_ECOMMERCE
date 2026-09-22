import React from 'react';
import { Search, Filter, UserPlus, RefreshCw } from 'lucide-react';
import { UserFilterParams } from '@/types/user-management';

interface UserFilterBarProps {
  filters: UserFilterParams;
  onKeywordChange: (keyword: string) => void;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onOpenCreateStaffModal: () => void;
  onResetFilters: () => void;
}

export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  filters,
  onKeywordChange,
  onRoleChange,
  onStatusChange,
  onOpenCreateStaffModal,
  onResetFilters,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4 transition-colors">
      {/* Tìm kiếm & Bộ lọc */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Ô Tìm kiếm Từ khóa */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.keyword ?? ''}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="Tìm theo họ tên, email, số điện thoại..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
          />
        </div>

        {/* Lọc Theo Vai Trò */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filters.role ?? 'ALL'}
            onChange={(e) => onRoleChange(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
            <option value="STAFF">Nhân viên bán hàng (Staff)</option>
            <option value="WAREHOUSE_MANAGER">Quản lý kho (Warehouse)</option>
            <option value="CUSTOMER">Khách hàng (Customer)</option>
          </select>
        </div>

        {/* Lọc Theo Trạng Thái */}
        <div>
          <select
            value={filters.status ?? 'ALL'}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="active">🟢 Đang hoạt động (Active)</option>
            <option value="pending">⏳ Chờ kích hoạt (Pending)</option>
            <option value="banned">🔴 Đã bị khóa (Banned)</option>
            <option value="deleted">🗑️ Đã xóa (Deleted)</option>
          </select>
        </div>

        {/* Nút Reset Bộ Lọc */}
        {(filters.keyword || filters.role !== 'ALL' || filters.status !== 'ALL') && (
          <button
            onClick={onResetFilters}
            className="p-2.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Đặt lại bộ lọc"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nút Tạo Mới Nhân Viên */}
      <button
        onClick={onOpenCreateStaffModal}
        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
      >
        <UserPlus className="w-4 h-4" />
        <span>Thêm nhân viên mới</span>
      </button>
    </div>
  );
};
