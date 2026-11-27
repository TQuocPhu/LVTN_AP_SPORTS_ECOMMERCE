'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import ClientTopBar from '@/components/layout/ClientTopBar';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { SYSTEM_SERVICES_LIST } from '@/constants/services-data';
import { ServiceCardItem } from './ServiceCardItem';

/**
 * Container UI trang Dịch Vụ Hệ Thống AP Sports (/services), dùng chung layout Khách hàng & Dark/Light Mode.
 */
export function ServicesContentUI() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ClientTopBar />

      <PageHeaderBanner
        title="DỊCH VỤ HỆ THỐNG AP SPORTS"
        subtitle="Hệ sinh thái dịch vụ toàn diện từ tư vấn AI, kiểm đếm barcode đến giao vận GHN và chăm sóc khách hàng 1-1."
        breadcrumbs={[{ label: 'Dịch vụ' }]}
      />

      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 space-y-14">
        {/* Tiêu đề mục dịch vụ */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest border border-orange-200 dark:border-orange-800">
            <Layers className="w-4 h-4 text-orange-500" />
            <span>Quy Trình Vận Hành Tiêu Chuẩn</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            DỊCH VỤ CHUYÊN NGHIỆP CỦA CHÚNG TÔI
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Mỗi đơn hàng bóng đá và dụng cụ thể thao tại AP Sports đều được phục vụ theo quy trình
            khép kín, minh bạch và tận tâm nhất.
          </p>
        </section>

        {/* Lưới 6 thẻ dịch vụ (3 cột x 2 hàng trên desktop) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SYSTEM_SERVICES_LIST.map((service) => (
            <ServiceCardItem key={service.id} service={service} />
          ))}
        </section>

        {/* CTA Banner cuối trang */}
        <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Sẵn sàng trải nghiệm mua sắm thể thao chuẩn mực?
            </h3>
            <p className="text-xs sm:text-sm text-orange-100">
              Khám phá hàng trăm mẫu giày bóng đá FG/TF/IC, vợt cầu lông và phụ kiện chính hãng ngay hôm nay.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-orange-600 font-extrabold text-xs uppercase tracking-wider shadow-lg hover:bg-orange-50 transition-all"
            >
              <span>Mua Sắm Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-950/25 border border-white/30 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-slate-950/40 transition-all"
            >
              <span>Liên Hệ Tư Vấn</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
