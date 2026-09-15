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
    <div className="relative w-full min-h-[55vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
      {/* Background Banner Image */}
      <div className="absolute inset-0 z-0 opacity-45 mix-blend-luminosity">
        <Image
          src="/images/banners/page_header_banner.png"
          alt="Sports Header Banner"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Glowing Neon Background Gradient Overlays */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Banner Content & Dynamic Breadcrumb Component */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
        {/* Component Breadcrumb Độc Lập */}
        <Breadcrumb items={breadcrumbs} />

        {/* Dynamic Title */}
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-400 drop-shadow-lg">
          {title}
        </h1>

        {subtitle && (
          <p className="text-base md:text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
