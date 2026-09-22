import React from 'react';
import { Search, Sparkles, Gift } from 'lucide-react';

interface VoucherHeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalVouchers: number;
}

/**
 * Component VoucherHeroBanner: Banner mở đầu ấn tượng phong cấp Shopee Kho Voucher.
 * Ô tìm kiếm thiết kế gọn gàng, bố cục dàn đều phân bố thông tin thoáng đẹp trên cả desktop và mobile.
 */
export const VoucherHeroBanner: React.FC<VoucherHeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  totalVouchers,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-8 sm:p-10 shadow-xl mb-8 transition-all">
      {/* Background Decorative Pattern */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-0 right-1/4 w-40 h-40 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Khối Nội Dung Bên Trái */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>Kho Voucher Ưu Đãi Độc Quyền AP Sports</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2 text-white">
            Săn Voucher Hot - Nhận Ngàn Ưu Đãi <Gift className="inline-block w-7 h-7 sm:w-8 sm:h-8 text-amber-200 -mt-1 animate-bounce" />
          </h1>

          <p className="text-amber-100 text-xs sm:text-sm font-normal max-w-xl">
            Áp dụng mã giảm giá trực tiếp và mã miễn phí vận chuyển toàn quốc cho các đơn hàng đồ thể thao cao cấp.
          </p>
        </div>

        {/* Khối Ô Tìm Kiếm Bên Phải (Thiết kế ngắn & gọn gàng) */}
        <div className="w-full md:w-auto shrink-0">
          <div className="relative w-full md:w-80 sm:w-96">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm mã giảm giá..."
                className="w-full pl-10 pr-24 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-lg border border-white/20 focus:outline-none focus:ring-4 focus:ring-amber-300/50 text-xs font-medium transition-all placeholder-slate-400"
              />
              <div className="absolute right-2.5 px-2.5 py-1 bg-amber-500 text-white font-bold text-[11px] rounded-xl shadow">
                {totalVouchers} mã
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
