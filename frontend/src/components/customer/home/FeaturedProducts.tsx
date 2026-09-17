'use client';

import Link from 'next/link';
import { CustomerProductCard } from '@/components/customer/product/CustomerProductCard';
import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { PackageX } from 'lucide-react';

export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts(8);

  return (
    <section className="py-16 border-t border-b transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--bg-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b" style={{ borderColor: 'var(--bg-border)' }}>
          <div>
            <div className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1">
              SẢN PHẨM BÁN CHẠY NHẤT
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
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

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 animate-pulse h-[380px] flex flex-col justify-between border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="w-full h-48 rounded-xl mb-4" style={{ backgroundColor: 'var(--card-image-bg)' }} />
                <div className="h-4 rounded w-1/3 mb-2" style={{ backgroundColor: 'var(--bg-border)' }} />
                <div className="h-6 rounded w-3/4 mb-4" style={{ backgroundColor: 'var(--bg-border)' }} />
                <div className="flex justify-between items-center mt-auto">
                  <div className="h-6 rounded w-1/2" style={{ backgroundColor: 'var(--bg-border)' }} />
                  <div className="h-8 rounded-lg w-1/3" style={{ backgroundColor: 'var(--bg-border)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          /* Product Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <CustomerProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <PackageX className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Chưa có sản phẩm nổi bật nào được cập nhật.</p>
          </div>
        )}
      </div>
    </section>
  );
}
