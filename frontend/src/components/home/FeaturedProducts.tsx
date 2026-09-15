'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Eye, Heart, ShieldCheck } from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Giày Đá Bóng Nike Zoom Mercurial Vapor 15 Pro FG',
    category: 'Bóng Đá',
    price: 3290000,
    originalPrice: 3890000,
    image: '/images/banners/sub_football_banner.png',
    rating: 5,
    reviews: 48,
    badge: 'CHÍNH HÃNG 100%',
  },
  {
    id: 2,
    name: 'Vợt Cầu Lông Yonex Astrox 88D Pro Nguyên Bản',
    category: 'Cầu Lông',
    price: 4450000,
    originalPrice: 4990000,
    image: '/images/banners/sub_badminton_volleyball_banner.png',
    rating: 5,
    reviews: 62,
    badge: 'BÁN CHẠY #1',
  },
  {
    id: 3,
    name: 'Giày Bóng Rổ Nike Air Jordan Luka 2 Legend',
    category: 'Bóng Rổ',
    price: 3890000,
    originalPrice: 4290000,
    image: '/images/banners/sub_karate_basketball_banner.png',
    rating: 4.9,
    reviews: 31,
    badge: 'MỚI VỀ 2026',
  },
  {
    id: 4,
    name: 'Bộ Phụ Kiện Gym & Thảm Tập Cao Cấp AP Sports',
    category: 'Fitness',
    price: 1290000,
    originalPrice: 1590000,
    image: '/images/banners/sub_fitness_accessories_banner.png',
    rating: 5,
    reviews: 89,
    badge: 'ƯU ĐÃI KHỦNG',
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
            <div
              key={prod.id}
              className="group relative bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              {/* Product Image Container */}
              <div className="relative w-full h-56 bg-slate-950 overflow-hidden">
                <Image
                  src={prod.image}
                  alt={prod.name}
                  fill
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-600 text-white font-black text-[10px] uppercase tracking-wider shadow">
                    {prod.badge}
                  </span>
                </div>

                {/* Quick Actions overlay */}
                <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-orange-400 hover:bg-slate-800 transition-colors border border-slate-700 shadow">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl bg-slate-900/90 text-slate-300 hover:text-orange-400 hover:bg-slate-800 transition-colors border border-slate-700 shadow">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-400 font-bold uppercase">{prod.category}</span>
                    <div className="flex items-center space-x-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold">{prod.rating}</span>
                      <span className="text-slate-500">({prod.reviews})</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {prod.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-white">
                      {prod.price.toLocaleString('vi-VN')}₫
                    </div>
                    <div className="text-xs text-slate-500 line-through">
                      {prod.originalPrice.toLocaleString('vi-VN')}₫
                    </div>
                  </div>

                  <button className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 text-xs">
                    <ShoppingCart className="w-4 h-4" />
                    <span>MUA</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
