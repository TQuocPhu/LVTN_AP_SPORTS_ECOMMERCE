'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneCall, MessageSquare, Clock, Headphones, Sparkles, ArrowRight } from 'lucide-react';

const HOTLINE_NUMBER = process.env.NEXT_PUBLIC_HOTLINE_NUMBER || '0987.654.321';
const HOTLINE_TEL = process.env.NEXT_PUBLIC_HOTLINE_TEL || `tel:${HOTLINE_NUMBER.replace(/\D/g, '')}`;

export default function HomeContactBannerSection() {
  return (
    <section className="py-12 sm:py-16 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-orange-500/30 shadow-2xl bg-slate-950">
          {/* 1. Background Image Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banners/fast_transparent_shopping_banner.png"
              alt="AP Sports Tư Vấn & Hỗ Trợ Khách Hàng 24/7"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center opacity-30 transform scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
            />
            {/* Ambient Gradients for Depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-orange-950/60" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
          </div>

          {/* 2. Banner Content Grid */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-5">
              {/* Animated Floating Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                <Headphones className="w-3.5 h-3.5 text-orange-400" />
                <span>TRUNG TÂM TƯ VẤN & HỖ TRỢ KHÁCH HÀNG 24/7</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md">
                BẠN CẦN TƯ VẤN TRANG THIẾT BỊ <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  HOẶC ĐẶT HÀNG ĐỘI NHÓM?
                </span>
              </h2>

              {/* Subtitle / Description */}
              <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed font-normal max-w-2xl drop-shadow">
                Đội ngũ chuyên viên thể thao tại AP Sports luôn sẵn sàng đồng hành cùng bạn — từ lựa chọn form giày thi đấu, căng vợt chuẩn số kg, đến chính sách chiết khấu trang bị số lượng lớn cho câu lạc bộ và doanh nghiệp.
              </p>

              {/* Service Highlights Pills */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-300 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Phản hồi dưới 5 phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Tư vấn kỹ thuật chuyên sâu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-400 font-bold">100%</span>
                  <span>Cam kết chính hãng</span>
                </div>
              </div>
            </div>

            {/* Right Action Column */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5 justify-center items-stretch lg:items-end">
              {/* Hotline Call Box */}
              <div className="w-full lg:max-w-xs p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1 text-center lg:text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Hotline Hỗ Trợ Nhanh Toàn Quốc
                </p>
                <p className="text-2xl font-black text-white font-mono tracking-tight text-orange-400">
                  {HOTLINE_NUMBER}
                </p>
              </div>

              {/* Button 1: Gọi Ngay */}
              <a
                href={HOTLINE_TEL}
                className="group relative inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border border-orange-400/30 cursor-pointer"
              >
                <div className="relative">
                  <PhoneCall className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                </div>
                <span>GỌI NGAY: {HOTLINE_NUMBER}</span>
              </a>

              {/* Button 2: Liên Hệ Ngay */}
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider backdrop-blur-md border border-white/20 hover:border-white/40 shadow-sm hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-orange-400 transition-transform duration-300 group-hover:scale-110" />
                <span>GỬI YÊU CẦU LIÊN HỆ</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
