'use client';

import React, { useState } from 'react';
import { useCustomerProducts } from '@/hooks/useCustomerProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductFilterSidebar } from '@/components/customer/product/ProductFilterSidebar';
import { ProductGridToolbar } from '@/components/customer/product/ProductGridToolbar';
import { CustomerProductCard } from '@/components/customer/product/CustomerProductCard';
import { CustomerPagination } from '@/components/customer/product/CustomerPagination';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { ShoppingBag, RefreshCw, X } from 'lucide-react';

export default function ProductsPage() {
  const { categoryTree } = useCategories();
  const store = useCustomerProducts();
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ── Header Banner chuẩn – dùng chung component PageHeaderBanner với trang Profile ── */}
      <PageHeaderBanner
        title="SẢN PHẨM"
        subtitle="Khám phá hàng nghìn trang thiết bị và dụng cụ thể thao chính hãng cao cấp."
        breadcrumbs={[{ label: 'Sản phẩm' }]}
      />

      {/* Main Page Body Container (Nới rộng tối đa 1536px & lề thoáng) */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Desktop Sidebar Filter (w-64 xl:w-72) */}
          <div className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-24">
            <ProductFilterSidebar
              categoryTree={categoryTree}
              selectedCategoryId={store.selectedCategoryId}
              selectedCategoryName={store.selectedCategoryName}
              minPrice={store.minPrice}
              maxPrice={store.maxPrice}
              selectedSizes={store.selectedSizes}
              selectedRating={store.selectedRating}
              hasActiveFilters={store.hasActiveFilters}
              onSelectCategory={store.setSelectedCategory}
              onSetPriceRange={store.setPriceRange}
              onToggleSize={store.setSelectedSizes}
              onSetRating={store.setSelectedRating}
              onResetFilters={store.resetFilters}
            />
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 w-full space-y-6 min-w-0">
            {/* Top Grid Toolbar */}
            <ProductGridToolbar
              totalElements={store.totalElements}
              keyword={store.keyword}
              sortBy={store.sortBy}
              sortDir={store.sortDir}
              onKeywordChange={store.setKeyword}
              onSortChange={store.handleSortChange}
              onToggleMobileFilter={() => setMobileFilterOpen(true)}
            />

            {/* Product Cards Grid Section (Tối đa 4 cột cho thẻ rộng rãi, thoáng đẹp) */}
            {store.loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-900 animate-pulse border border-slate-300/50 dark:border-slate-800"
                  />
                ))}
              </div>
            ) : store.products.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Thử thay đổi từ khóa tìm kiếm hoặc bấm nút đặt lại bộ lọc để xem thêm các sản phẩm khác.
                  </p>
                </div>
                {store.hasActiveFilters && (
                  <button
                    onClick={store.resetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Đặt lại bộ lọc</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {store.products.map((product) => (
                  <CustomerProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Bottom Pagination */}
            <CustomerPagination
              page={store.page}
              totalPages={store.totalPages}
              onPageChange={store.setPage}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Filter Modal Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-slate-950 h-full overflow-y-auto p-5 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Bộ Lọc Tìm Kiếm
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ProductFilterSidebar
              categoryTree={categoryTree}
              selectedCategoryId={store.selectedCategoryId}
              selectedCategoryName={store.selectedCategoryName}
              minPrice={store.minPrice}
              maxPrice={store.maxPrice}
              selectedSizes={store.selectedSizes}
              selectedRating={store.selectedRating}
              hasActiveFilters={store.hasActiveFilters}
              onSelectCategory={store.setSelectedCategory}
              onSetPriceRange={store.setPriceRange}
              onToggleSize={store.setSelectedSizes}
              onSetRating={store.setSelectedRating}
              onResetFilters={store.resetFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
}
