'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame, Trophy, Shield } from 'lucide-react';

export default function HomeFeaturedSportsBanners() {
  return (
    <section className="py-8 sm:py-12 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ========================================================
              CARD 1: BÓNG ĐÁ (Cột trái lớn - Chiếm 5 cột trên Desktop)
             ======================================================== */}
          <Link
            href="/products?search=bóng+đá"
            className="group relative lg:col-span-5 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[480px] lg:min-h-[540px] flex flex-col justify-between p-6 sm:p-8 bg-slate-950"
          >
            {/* Background Image: Giày & Bóng ở nửa dưới, nửa trên tối để viết chữ */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/banners/home_promo_football.jpg"
                alt="Bộ sưu tập Bóng Đá AP Sports"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-bottom transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />
              {/* Dark gradient overlay for ultra-crisp readable typography */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent" />
            </div>

            {/* Content Top: Slogan & Tiêu đề */}
            <div className="relative z-10 space-y-3 max-w-sm">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>BỘ SƯU TẬP SÂN CỎ 2026</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                BÙNG NỔ <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                  TỐC ĐỘ & KỸ THUẬT
                </span>
              </h3>

              <p className="text-slate-200 text-sm sm:text-base font-medium leading-relaxed drop-shadow">
                Giày đinh bám sân đa năng, bóng thi đấu FIFA Quality Pro & phụ kiện trợ lực tối đa.
              </p>

              <div className="pt-2">
                <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 group-hover:from-orange-600 group-hover:to-amber-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 group-hover:translate-x-1">
                  <span>Khám Phá Ngay</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Bottom Tag / Badge */}
            <div className="relative z-10 pt-6">
              <span className="inline-block px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-white/90 text-xs font-semibold backdrop-blur-md">
                Ưu đãi đến 30% sản phẩm sân cỏ
              </span>
            </div>
          </Link>

          {/* ========================================================
              CỘT PHẢI: 2 Card Ngang Xếp Chồng (Chiếm 7 cột trên Desktop)
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
            {/* --------------------------------------------------------
                CARD 2: CẦU LÔNG (Vợt bên Trái, Slogan bên Phải)
               -------------------------------------------------------- */}
            <Link
              href="/products?search=cầu+lông"
              className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[235px] sm:min-h-[255px] flex items-center justify-end p-6 sm:p-8 bg-slate-950"
            >
              {/* Background Image: Vợt bên trái, bên phải trống */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/banners/home_promo_badminton.jpg"
                  alt="Vợt & Phụ kiện Cầu Lông Cao Cấp"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-left sm:object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Gradient che mờ nhẹ bên phải để chữ sáng rõ ràng */}
                <div className="absolute inset-0 bg-gradient-to-l from-slate-950/95 via-slate-950/60 to-transparent sm:from-slate-950/90 sm:via-slate-950/40" />
              </div>

              {/* Content Right: Slogan & Nút */}
              <div className="relative z-10 text-right space-y-2 max-w-[280px] sm:max-w-xs flex flex-col items-end">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                  <Trophy className="w-3 h-3 text-cyan-400" />
                  <span>CẦU LÔNG ĐỈNH CAO</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                  VUNG VỢT <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    BỨT PHÁ UY LỰC
                  </span>
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  Vợt Carbon trợ lực chuẩn thi đấu, quấn cán & cầu lông siêu bền.
                </p>

                <div className="pt-1">
                  <span className="inline-flex items-center space-x-1.5 text-cyan-400 group-hover:text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all">
                    <span>Xem Thêm</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* --------------------------------------------------------
                CARD 3: KARATE (Slogan bên Trái, Võ phục & Đai bên Phải)
               -------------------------------------------------------- */}
            <Link
              href="/products?search=karate"
              className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[235px] sm:min-h-[255px] flex items-center justify-start p-6 sm:p-8 bg-slate-950"
            >
              {/* Background Image: Trống bên trái sàn mút xanh, Võ phục bên phải */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/banners/home_promo_karate.jpg"
                  alt="Võ phục Karate & Dụng cụ thi đấu"
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover object-right sm:object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* Gradient che mờ nhẹ bên trái để chữ sáng sắc nét */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent sm:from-slate-950/90 sm:via-slate-950/40" />
              </div>

              {/* Content Left: Slogan & Nút */}
              <div className="relative z-10 text-left space-y-2 max-w-[280px] sm:max-w-xs flex flex-col items-start">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span>VÕ THUẬT & KARATE</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                  BẢN LĨNH THÉP <br />
                  <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
                    CHUẨN ĐAI & GIÁP
                  </span>
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  Võ phục Karate chuẩn form dày dặn, đai đen & găng tập thi đấu WKF.
                </p>

                <div className="pt-1">
                  <span className="inline-flex items-center space-x-1.5 text-red-400 group-hover:text-red-300 font-bold text-xs uppercase tracking-wider transition-all">
                    <span>Xem Thêm</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
