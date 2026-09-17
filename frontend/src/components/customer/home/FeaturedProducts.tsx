'use client';

import Link from 'next/link';
import { CustomerProductCard } from '@/components/customer/product/CustomerProductCard';
import { Product } from '@/types/product';

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Giày Đá Bóng Nike Zoom Mercurial Vapor 15 Pro FG',
    slug: 'giay-da-bong-nike-zoom-mercurial-vapor-15-pro-fg',
    primaryCategoryName: 'Bóng Đá',
    price: 3290000,
    originalPrice: 3890000,
    mainImage: '/images/banners/sub_football_banner.png',
    status: 'in_stock',
    variantCount: 4,
    rating: 5,
    reviewsCount: 48,
  },
  {
    id: 2,
    name: 'Vợt Cầu Lông Yonex Astrox 88D Pro Nguyên Bản',
    slug: 'vot-cau-long-yonex-astrox-88d-pro',
    primaryCategoryName: 'Cầu Lông',
    price: 4450000,
    originalPrice: 4990000,
    mainImage: '/images/banners/sub_badminton_volleyball_banner.png',
    status: 'in_stock',
    variantCount: 2,
    rating: 5,
    reviewsCount: 62,
  },
  {
    id: 3,
    name: 'Giày Bóng Rổ Nike Air Jordan Luka 2 Legend',
    slug: 'giay-bong-ro-nike-air-jordan-luka-2-legend',
    primaryCategoryName: 'Bóng Rổ',
    price: 3890000,
    originalPrice: 4290000,
    mainImage: '/images/banners/sub_karate_basketball_banner.png',
    status: 'in_stock',
    variantCount: 5,
    rating: 4.9,
    reviewsCount: 31,
  },
  {
    id: 4,
    name: 'Bộ Phụ Kiện Gym & Thảm Tập Cao Cấp AP Sports',
    slug: 'bo-phu-kien-gym-tham-tap-cao-cap-ap-sports',
    primaryCategoryName: 'Fitness',
    price: 1290000,
    originalPrice: 1590000,
    mainImage: '/images/banners/sub_fitness_accessories_banner.png',
    status: 'in_stock',
    variantCount: 3,
    rating: 5,
    reviewsCount: 89,
  },
];

export default function FeaturedProducts() {
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
            className="mt-4 sm:mt-0 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-wider"
          >
            XEM TOÀN BỘ CỬA HÀNG →
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((prod) => (
            <CustomerProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  );
}
