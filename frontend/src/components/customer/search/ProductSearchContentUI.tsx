'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Sparkles, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import ServiceFeatures from '@/components/ui/ServiceFeatures';
import { CustomerProductCard } from '@/components/customer/product/CustomerProductCard';
import { CustomerPagination } from '@/components/customer/product/CustomerPagination';
import { useProductSearch } from '@/hooks/useProductSearch';

/**
 * Pure Presentational Component cho Trang Tìm kiếm Sản phẩm (`/search`)
 * - Gọi Custom Hook `useProductSearch()` để lấy state & validation
 * - Hiển thị dòng thông báo số kết quả khớp từ khóa
 * - Hiển thị Lưới sản phẩm 5 cột/dòng (`xl:grid-cols-5`) tái sử dụng `CustomerProductCard`
 * - Tái sử dụng `CustomerPagination` và `ServiceFeatures`
 */
export default function ProductSearchContentUI() {
  const {
    keyword,
    products,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    validationError,
    handlePageChange,
  } = useProductSearch(10); // 10 sản phẩm = 2 dòng x 5 cột

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header Banner dùng chung toàn hệ thống */}
      <PageHeaderBanner
        title="TÌM KIẾM SẢN PHẨM"
        subtitle="Hệ thống xếp hạng độ phù hợp thông minh mang đến sản phẩm chuẩn mực cho bạn"
        breadcrumbs={[{ label: 'Tìm kiếm' }]}
      />

      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10 space-y-12">
        {/* Header Kết Quả Tìm Kiếm */}
        <section id="search-results-header" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest border border-orange-200 dark:border-orange-800">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Kết Quả Xếp Hạng Độ Phù Hợp</span>
            </div>

            {keyword && !validationError ? (
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Tìm thấy <span className="text-orange-600 dark:text-orange-400">{totalElements}</span> sản phẩm phù hợp cho từ khóa &quot;<span className="text-orange-500">{keyword}</span>&quot;
              </h1>
            ) : (
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Tra Cứu & Tìm Kiếm Trang Thiết Bị Thể Thao
              </h1>
            )}
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition-all shrink-0"
          >
            <span>Tất Cả Sản Phẩm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Cảnh Báo Validation Error Nếu Có */}
        {validationError && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cảnh Báo Tìm Kiếm</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">{validationError}</p>
          </div>
        )}

        {/* Lưới Sản Phẩm 5 Cột / Dòng */}
        {!validationError && (
          <section id="search-product-grid" className="space-y-10">
            {isLoading ? (
              /* Skeleton Loader Grid 5 Cột */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
                    <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl mt-2" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              /* Lưới Sản Phẩm 5 Cột / Dòng Thực Tế */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <CustomerProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* State Khi Không Tìm Thấy Sản Phẩm Phù Hợp */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-5 shadow-lg">
                <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Không Tìm Thấy Sản Phẩm Phù Hợp
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Rất tiếc, không tìm thấy sản phẩm nào trùng khớp với từ khóa &quot;<strong className="text-orange-500">{keyword}</strong>&quot;. Bạn hãy thử tìm kiếm với các từ khóa chung hơn như <em>&quot;giày bóng đá&quot;, &quot;vợt cầu lông&quot;, &quot;áo thi đấu&quot;</em>.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 text-xs uppercase tracking-wider"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Khám Phá Tất Cả Sản Phẩm</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Phân Trang Sản Phẩm */}
            {!isLoading && totalPages > 1 && (
              <div className="pt-6">
                <CustomerPagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
