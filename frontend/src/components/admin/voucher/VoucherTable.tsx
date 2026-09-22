import React from 'react';
import { Edit3, Trash2, Power, Tag, Truck, Calendar, Percent as PercentIcon } from 'lucide-react';
import { Voucher, PageResponse } from '@/types/voucher';

interface VoucherTableProps {
  pageData: PageResponse<Voucher>;
  isLoading: boolean;
  onEdit: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
  onToggleStatus: (voucher: Voucher) => void;
  onPageChange: (page: number) => void;
}

/**
 * Component VoucherTable: Bảng hiển thị danh sách Mã giảm giá phía Admin.
 */
export const VoucherTable: React.FC<VoucherTableProps> = ({
  pageData,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
}) => {
  // Format tiền tệ VNĐ
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format ngày tháng
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Vĩnh viễn';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render Badge Loại Voucher (FIXED, PERCENT, FREESHIP)
  const renderTypeBadge = (type: string, value: number) => {
    if (type === 'PERCENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
          <PercentIcon className="w-3 h-3" />
          <span>Giảm {value}%</span>
        </span>
      );
    }
    if (type === 'FREESHIP') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          <Truck className="w-3 h-3" />
          <span>Freeship {formatCurrency(value)}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <Tag className="w-3 h-3" />
        <span>Giảm {formatCurrency(value)}</span>
      </span>
    );
  };

  // Render Badge Trạng thái
  const renderStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive || status === 'disabled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          <span>Tạm dừng</span>
        </span>
      );
    }
    if (status === 'scheduled') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Sắp diễn ra</span>
        </span>
      );
    }
    if (status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>Hết hạn / Lượt</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Đang diễn ra</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Mã & Tên Voucher</th>
              <th className="px-4 py-3.5">Mức giảm giá</th>
              <th className="px-4 py-3.5">Đơn tối thiểu</th>
              <th className="px-4 py-3.5">Tiến trình đã dùng</th>
              <th className="px-4 py-3.5">Thời gian hiệu lực</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                  <td className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div></td>
                </tr>
              ))
            ) : pageData.content.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  <Tag className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-base font-medium">Không tìm thấy mã giảm giá nào phù hợp.</p>
                  <p className="text-xs mt-1">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm phía trên.</p>
                </td>
              </tr>
            ) : (
              pageData.content.map((voucher) => {
                const active = voucher.isActive ?? voucher.active ?? (voucher.status !== 'disabled');
                return (
                <tr
                  key={voucher.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-mono text-xs rounded border border-amber-300">
                        {voucher.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {voucher.name}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {renderTypeBadge(voucher.type, voucher.value)}
                    {voucher.maxDiscountAmount && voucher.type === 'PERCENT' && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        Tối đa {formatCurrency(voucher.maxDiscountAmount)}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-medium text-slate-800">
                    {formatCurrency(voucher.minOrderValue)}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="w-36">
                      <div className="flex justify-between text-xs mb-1 font-medium">
                        <span className="text-slate-600">
                          {voucher.usedCount} / {voucher.usageLimit ? voucher.usageLimit : '∞'}
                        </span>
                        <span className="text-amber-600">
                          {voucher.usagePercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, voucher.usagePercentage || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(voucher.startsAt)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Đến: {formatDate(voucher.expiresAt)}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {renderStatusBadge(voucher.status, active)}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Thanh trượt Switch Bật/Tắt kích hoạt */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(voucher)}
                        title={active ? 'Tạm dừng mã giảm giá' : 'Kích hoạt mã giảm giá'}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            active ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => onEdit(voucher)}
                        title="Chỉnh sửa voucher"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(voucher)}
                        title="Xóa voucher"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && pageData.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs sm:text-sm">
          <div className="text-slate-500">
            Hiển thị <span className="font-semibold text-slate-700">{pageData.number * pageData.size + 1}</span> -{' '}
            <span className="font-semibold text-slate-700">
              {Math.min((pageData.number + 1) * pageData.size, pageData.totalElements)}
            </span>{' '}
            trong tổng số <span className="font-semibold text-slate-700">{pageData.totalElements}</span> voucher
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={pageData.first}
              onClick={() => onPageChange(pageData.number - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Trước
            </button>
            <span className="px-3 py-1.5 font-medium text-slate-700">
              {pageData.number + 1} / {pageData.totalPages}
            </span>
            <button
              disabled={pageData.last}
              onClick={() => onPageChange(pageData.number + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
