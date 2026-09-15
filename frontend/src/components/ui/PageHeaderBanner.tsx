'use client';

import Image from 'next/image';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

interface PageHeaderBannerProps {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Component Tái sử dụng Header Banner cho các Trang phụ (Đăng nhập, Đăng ký, Profile, Chi tiết sản phẩm...)
 * Đã nâng chiều cao che >50% màn hình chính gốc (min-h-[55vh]) và nhúng Component Breadcrumb độc lập.
 */
export default function PageHeaderBanner({ title, subtitle, breadcrumbs }: PageHeaderBannerProps) {
  return (
    <div id="page-header-banner" className="page-header-banner-container relative w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px] flex items-center justify-start overflow-hidden bg-slate-950 text-white py-6 sm:py-10 md:py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background Banner Image - Edge-to-Edge Cover */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Image
          src="/images/banners/page_header_banner.png"
          alt="Sports Header Banner"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center w-full h-full"
        />
        {/* Seamless Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      </div>

      {/* Glowing Neon Background Gradient Overlays */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Banner Content & Dynamic Breadcrumb Component (Left-aligned) */}
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col items-start text-left space-y-4">
        {/* Component Breadcrumb Độc Lập */}
        <Breadcrumb items={breadcrumbs} />

        {/* Dynamic Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-400 drop-shadow-lg">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl font-medium leading-relaxed drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
