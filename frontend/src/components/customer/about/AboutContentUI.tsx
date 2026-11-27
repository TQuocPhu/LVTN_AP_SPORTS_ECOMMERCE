'use client';

import React from 'react';
import ClientTopBar from '@/components/layout/ClientTopBar';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { AboutHeroStorySection } from './AboutHeroStorySection';
import { AboutStatsSection } from './AboutStatsSection';
import { AboutTimelineSection } from './AboutTimelineSection';
import { AboutTransparencySection } from './AboutTransparencySection';
import { AboutPaymentTrustSection } from './AboutPaymentTrustSection';

/**
 * Container UI trang Giới thiệu AP Sports (/about), đồng bộ layout Khách hàng & Dark/Light Mode.
 */
export function AboutContentUI() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ClientTopBar />

      <PageHeaderBanner
        title="GIỚI THIỆU AP SPORTS"
        subtitle="Hành trình 16 năm (2010 – 2026) xây dựng hệ thống bán lẻ trang thiết bị thể thao chính hãng và uy tín hàng đầu Việt Nam."
        breadcrumbs={[{ label: 'Giới thiệu' }]}
      />

      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 space-y-20">
        <AboutHeroStorySection />
        <AboutStatsSection />
        {/* Lược đồ hình thành hệ thống đặt ngay phía trên phần Minh Bạch Nguồn Hàng */}
        <AboutTimelineSection />
        <AboutTransparencySection />
        <AboutPaymentTrustSection />
      </main>
    </div>
  );
}
