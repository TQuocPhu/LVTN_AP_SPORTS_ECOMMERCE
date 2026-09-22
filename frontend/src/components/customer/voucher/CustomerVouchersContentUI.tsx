'use client';

import React from 'react';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { useCustomerVouchers } from '@/hooks/useCustomerVouchers';
import { VoucherHeroBanner } from './VoucherHeroBanner';
import { VoucherCategoryTabs } from './VoucherCategoryTabs';
import { ShopeeVoucherCard } from './ShopeeVoucherCard';
import { VoucherGuideSection } from './VoucherGuideSection';
import { Tag } from 'lucide-react';

/**
 * Main Shell Component cho Trang Kho Voucher Khuyến Mãi (/vouchers).
 * Thiết kế phong cách Shopee Voucher Portal ấn tượng, tích hợp 100% Light/Dark mode.
 */
export function CustomerVouchersContentUI() {
  const {
    selectedCategory,
    searchQuery,
    vouchers,
    totalCount,
    isLoading,
    copiedCode,
    handleCategoryTabChange,
    handleSearchQueryChange,
    handleCopyCode,
  } = useCustomerVouchers();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-16">
      {/* 1. Page Header Banner */}
      <PageHeaderBanner
        title="KHO VOUCHER KHUYẾN MÃI"
        subtitle="Săn ngay hàng ngàn mã giảm giá và miễn phí vận chuyển AP Sports"
        breadcrumbs={[{ label: 'Kho Voucher' }]}
      />

      {/* 2. Main Body Content */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-8">
        {/* Banner Hero Shopee */}
        <VoucherHeroBanner
          searchQuery={searchQuery}
          onSearchChange={handleSearchQueryChange}
          totalVouchers={totalCount}
        />

        {/* Thanh Tab Chuyển Phân Loại Voucher */}
        <VoucherCategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryTabChange}
        />

        {/* Danh Sách Thẻ Voucher */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-44 bg-slate-200 dark:bg-slate-800/80 rounded-2xl" />
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 dark:text-slate-500 my-6 shadow-sm">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Hiện chưa có voucher nào thuộc danh mục này
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hãy thử chọn tab phân loại khác hoặc quay lại sau để cập nhật các ưu đãi mới nhất từ AP Sports nhé!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vouchers.map((voucher) => (
              <ShopeeVoucherCard
                key={voucher.id}
                voucher={voucher}
                copiedCode={copiedCode}
                onCopyCode={handleCopyCode}
              />
            ))}
          </div>
        )}

        {/* Hướng Dẫn 3 Bước Áp Dụng Voucher */}
        <VoucherGuideSection />
      </main>
    </div>
  );
}
