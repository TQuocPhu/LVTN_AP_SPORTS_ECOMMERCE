'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 'football',
    title: 'BÓNG ĐÁ CHUYÊN NGHIỆP',
    subtitle: 'Giày đinh FG/AG, áo đấu CLB & bóng thi đấu FIFA Standard',
    image: '/images/banners/sub_football_banner.png',
    link: '/products?category=football',
    count: '240+ Sản phẩm',
    badge: 'HOT TREND',
  },
  {
    id: 'racquet',
    title: 'CẦU LÔNG & TENNIS',
    subtitle: 'VợtYonex, Mizuno, giày thảm chuyên dụng & túi đựng',
    image: '/images/banners/sub_badminton_volleyball_banner.png',
    link: '/products?category=racquet',
    count: '180+ Sản phẩm',
    badge: 'BÁN CHẠY',
  },
  {
    id: 'martial-basketball',
    title: 'BÓNG RỔ & VÕ THUẬT',
    subtitle: 'Giày bóng rổ cổ cao, găng boxing & đồ bọc bảo vệ',
    image: '/images/banners/sub_karate_basketball_banner.png',
    link: '/products?category=martial-basketball',
    count: '120+ Sản phẩm',
    badge: 'CHÍNH HÃNG',
  },
  {
    id: 'fitness',
    title: 'GYM & PHỤ KIỆN TẬP LUYỆN',
    subtitle: 'Thảm yoga, tạ tay, dây kháng lực & phụ kiện thể thao',
    image: '/images/banners/sub_fitness_accessories_banner.png',
    link: '/products?category=fitness',
    count: '310+ Sản phẩm',
    badge: 'ƯU ĐÃI KHỦNG',
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-slate-800">
          <div>
            <div className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1">
              DANH MỤC THỂ THAO CHUYÊN SÂU
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              KHÁM PHÁ THEO BỘ MÔN
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-4 md:mt-0 text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center space-x-1 group"
          >
            <span>XEM TẤT CẢ DANH MỤC</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.link}
              className="group relative h-80 rounded-2xl overflow-hidden border border-slate-800 hover:border-orange-500/50 transition-all duration-300 shadow-xl bg-slate-900 flex flex-col justify-end p-6"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              {/* Top Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                  {cat.badge}
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 space-y-2">
                <div className="text-xs font-semibold text-slate-400">{cat.count}</div>
                <h3 className="text-xl font-extrabold text-white uppercase group-hover:text-orange-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2">{cat.subtitle}</p>

                <div className="pt-2 flex items-center space-x-1 text-xs font-bold text-orange-400 group-hover:underline">
                  <span>KHÁM PHÁ NGAY</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
