'use client';

import Link from 'next/link';
import { CustomerProductCard } from '@/components/customer/product/CustomerProductCard';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { PackageX } from 'lucide-react';

export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts(8);

  return (
    <section className="py-16 bg-slate-900/50 border-t border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-slate-800">
          <div>
            <div className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1">
              SẢN PHẨM BÁN CHẠY NHẤT
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              TRANG THIẾT BỊ NỔI BẬT
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-4 sm:mt-0 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-wider flex items-center gap-1"
          >
            XEM TOÀN BỘ CỬA HÀNG →
          </Link>
        </div>

        {/* Loading State Skeleton (8 Items) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 animate-pulse h-[380px] flex flex-col justify-between"
              >
                <div className="w-full h-48 bg-slate-700/50 rounded-xl mb-4" />
                <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-2" />
                <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-4" />
                <div className="flex justify-between items-center mt-auto">
                  <div className="h-6 bg-slate-700/50 rounded w-1/2" />
                  <div className="h-8 bg-slate-700/50 rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          /* Product Cards Grid (8 Items - 2 Rows of 4) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <CustomerProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-800">
            <PackageX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">Chưa có sản phẩm nổi bật nào được cập nhật.</p>
          </div>
        )}
      </div>
    </section>
  );
}



