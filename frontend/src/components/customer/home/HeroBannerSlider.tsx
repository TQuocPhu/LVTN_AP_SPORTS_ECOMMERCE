'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShieldCheck, Flame, ArrowRight } from 'lucide-react';

const SLIDE_IMAGES = [
  '/images/banners/hero_banner_1.png',
  '/images/banners/hero_banner_2.png',
  '/images/banners/hero_banner_3.png',
  '/images/banners/hero_banner_4.png',
  '/images/banners/hero_banner_6.png',
];

export default function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDE_IMAGES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
  };

  return (
    <section id="hero-banner-slider" className="hero-banner-slider-container relative w-full h-[320px] sm:h-[440px] md:h-[540px] lg:h-[600px] flex items-center justify-center overflow-hidden bg-slate-950 border-b border-slate-800">
      {/* Background Slides - Full Edge-to-Edge Coverage */}
      {SLIDE_IMAGES.map((imgSrc, idx) => (
        <div
          key={imgSrc}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={imgSrc}
            alt="AP Sports Banner"
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover object-center w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        </div>
      ))}

      {/* Single Fixed Overlay Content */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        <div className="max-w-xl space-y-3 sm:space-y-4">
          {/* Tag */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/70 border border-orange-500/30 text-orange-400/90 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
            <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
            <span>⚡ AP SPORTS ENTERPRISE 2026</span>
          </div>

          {/* Single Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white/90 uppercase tracking-tight leading-tight drop-shadow-md">
            DỤNG CỤ THỂ THAO CHUYÊN NGHIỆP
          </h1>

          {/* Single Sentence Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed font-medium max-w-lg drop-shadow">
            Khám phá bộ sưu tập dụng cụ thể thao chính hãng, bảo hành uy tín và hỗ trợ giao hàng tốc độ toàn quốc.
          </p>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-wrap gap-3 items-center">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 bg-orange-500/85 hover:bg-orange-500 text-white/95 font-bold px-5 py-2.5 rounded-lg transition-all duration-300 shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95 text-xs uppercase tracking-wider backdrop-blur-md border border-orange-400/30"
            >
              <span>MUA NGAY BÂY GIỜ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400/90 bg-slate-950/70 px-3.5 py-2 rounded-lg border border-emerald-500/20 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/90" />
              <span>100% CHÍNH HÃNG UY TÍN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 z-30 p-3 rounded-full bg-slate-900/60 text-white hover:bg-orange-500 border border-slate-700 hover:border-orange-500 backdrop-blur-md transition-all duration-200 hidden sm:flex items-center justify-center"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 z-30 p-3 rounded-full bg-slate-900/60 text-white hover:bg-orange-500 border border-slate-700 hover:border-orange-500 backdrop-blur-md transition-all duration-200 hidden sm:flex items-center justify-center"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-6 z-30 flex items-center space-x-2">
        {SLIDE_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'w-8 bg-orange-500' : 'w-2.5 bg-slate-600 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
