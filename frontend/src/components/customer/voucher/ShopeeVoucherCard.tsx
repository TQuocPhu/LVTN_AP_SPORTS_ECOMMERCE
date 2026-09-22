import React from 'react';
import { Ticket, Truck, Tag, Percent, Clock, Check } from 'lucide-react';
import { Voucher } from '@/types/voucher';

interface ShopeeVoucherCardProps {
  voucher: Voucher;
  copiedCode: string | null;
  onCopyCode: (code: string) => void;
}

/**
 * Component ShopeeVoucherCard: Thẻ Voucher kiểu vé giảm giá Shopee.
 * Tích hợp vết cắt vé bán nguyệt hai đầu, tiến trình % sử dụng, badge giảm giá, nút Lưu/Copy mã.
 * Tích hợp 100% Light và Dark mode.
 */
export const ShopeeVoucherCard: React.FC<ShopeeVoucherCardProps> = ({
  voucher,
  copiedCode,
  onCopyCode,
}) => {
  const isCopied = copiedCode === voucher.code;

  // Format tiền tệ VNĐ
  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format ngày hết hạn
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Hạn dùng: Vĩnh viễn';
    const date = new Date(dateString);
    return `Hạn dùng: ${date.toLocaleDateString('vi-VN')}`;
  };

  // Render Icon chính dựa trên VoucherType
  const renderIcon = () => {
    if (voucher.type === 'FREESHIP') {
      return <Truck className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />;
    }
    if (voucher.type === 'PERCENT') {
      return <Percent className="w-7 h-7 text-amber-500 dark:text-amber-400" />;
    }
    return <Tag className="w-7 h-7 text-blue-500 dark:text-blue-400" />;
  };

  // Header Tiêu đề giảm giá
  const renderDiscountTitle = () => {
    if (voucher.type === 'PERCENT') {
      return `Giảm ${voucher.value}%`;
    }
    if (voucher.type === 'FREESHIP') {
      return `Giảm ${formatCurrency(voucher.value)} Ship`;
    }
    return `Giảm ${formatCurrency(voucher.value)}`;
  };

  return (
    <div className="relative flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Vết cắt nửa hình tròn phong cách Ticket Coupon (Trái & Phải của viền ngăn cách) */}
      <div className="absolute left-[30%] -top-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full z-10"></div>
      <div className="absolute left-[30%] -bottom-3 w-6 h-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full z-10"></div>

      {/* Phần Cột Trái (Ticket Stub Icon) */}
      <div className="w-[30%] bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 p-4 flex flex-col items-center justify-center border-r border-dashed border-slate-200 dark:border-slate-800 shrink-0 text-center">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
          {renderIcon()}
        </div>
        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          {voucher.code}
        </span>
      </div>

      {/* Phần Cột Phải (Nội dung chi tiết Voucher & Nút bấm) */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Badge loại áp dụng */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/60">
              {voucher.categoryScope === 'FREESHIP'
                ? 'Mã Phí Vận Chuyển'
                : voucher.categoryScope === 'ALL'
                ? 'Mã Áp Dụng Toàn Sàn'
                : `Voucher ${voucher.categoryScope}`}
            </span>

            {/* Trạng thái hiển thị */}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {voucher.displayStatus}
            </span>
          </div>

          {/* Tiêu đề & Điều kiện tối thiểu */}
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
            {renderDiscountTitle()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {voucher.minOrderValue && voucher.minOrderValue > 0
              ? `Đơn tối thiểu ${formatCurrency(voucher.minOrderValue)}`
              : 'Cho tất cả đơn hàng'}
            {voucher.maxDiscountAmount && voucher.type === 'PERCENT' && ` • Tối đa ${formatCurrency(voucher.maxDiscountAmount)}`}
          </p>
        </div>

        {/* Hạn dùng & Tiến trình sử dụng & Nút Copy */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex-1">
            {/* Tiến trình % đã dùng */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, voucher.usagePercentage || 0)}%` }}
              ></div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />
              <span>{formatDate(voucher.expiresAt)}</span>
            </div>
          </div>

          {/* Nút Sao Chép Mã */}
          <button
            onClick={() => onCopyCode(voucher.code)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-1.5 ${
              isCopied
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow active:scale-95'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã Lưu</span>
              </>
            ) : (
              <span>Lưu Mã</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
