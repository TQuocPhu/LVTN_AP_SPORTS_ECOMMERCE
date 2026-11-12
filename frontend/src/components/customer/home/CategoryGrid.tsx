'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useHomeCategories } from '@/hooks/useHomeCategories';

/**
 * Component hiển thị Danh mục bộ môn thể thao trên Trang chủ khách hàng.
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Chỉ gọi hook `useHomeCategories()`, hoàn toàn không chứa useState/useEffect hay logic nghiệp vụ.
 * - Hỗ trợ đầy đủ giao diện Dark/Light mode thông qua hệ thống biến CSS của trang khách hàng.
 */
export default function CategoryGrid() {
  const { categories, loading } = useHomeCategories();

  return (
    <section
      className="py-14 sm:py-16 border-t transition-colors duration-300"
      style={{ backgroundColor: 'var(--section-alt-bg)', borderColor: 'var(--bg-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Phần tiêu đề khối (Section Header) */}
        <div
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b ap-section-border"
          style={{ borderColor: 'var(--bg-border)' }}
        >
          <div>
            <div className="text-orange-500 font-bold text-xs uppercase tracking-widest mb-1">
              DANH MỤC THỂ THAO CHUYÊN SÂU
            </div>
            <h2
              className="text-2xl sm:text-4xl font-black uppercase tracking-tight ap-section-heading"
              style={{ color: 'var(--text-primary)' }}
            >
              KHÁM PHÁ THEO BỘ MÔN
            </h2>
          </div>
          <Link
            href="/products"
            className="mt-4 md:mt-0 text-sm font-bold text-orange-500 hover:text-orange-400 flex items-center space-x-1 group"
          >
            <span>XEM TẤT CẢ DANH MỤC</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Hiệu ứng Skeleton khi đang tải dữ liệu danh mục */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-72 rounded-2xl animate-pulse border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              />
            ))}
          </div>
        ) : (
          /* Lưới thẻ Danh mục bộ môn (Hiển thị 6 bộ môn gốc chuẩn AP Sports) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.link}
                className="ap-category-card group relative h-72 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-orange-500/60 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col justify-end p-6 bg-slate-950"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center group-hover:scale-110 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent" />

                {/* Nhãn Badge nổi bật góc trên trái */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                    {cat.badge}
                  </span>
                </div>

                {/* Số lượng sản phẩm đang kinh doanh góc trên phải */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/15 text-orange-300 font-bold text-[11px] backdrop-blur-md">
                    {cat.countLabel}
                  </span>
                </div>

                {/* Nội dung chi tiết của danh mục */}
                <div className="relative z-10 space-y-1.5">
                  <h3 className="text-xl font-extrabold text-white uppercase group-hover:text-orange-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    {cat.subtitle}
                  </p>
                  <div className="pt-2 flex items-center space-x-1 text-xs font-bold text-orange-400 group-hover:underline">
                    <span>KHÁM PHÁ NGAY</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
