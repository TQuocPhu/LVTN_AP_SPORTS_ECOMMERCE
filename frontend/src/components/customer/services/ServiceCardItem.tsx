'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Barcode,
  CreditCard,
  Headphones,
  RefreshCw,
  Sparkles,
  Truck,
} from 'lucide-react';
import { SystemServiceItem } from '@/constants/services-data';

function renderServiceIcon(iconName: SystemServiceItem['iconName']) {
  const cls = 'w-7 h-7';
  switch (iconName) {
    case 'sparkles':
      return <Sparkles className={cls} />;
    case 'barcode':
      return <Barcode className={cls} />;
    case 'truck':
      return <Truck className={cls} />;
    case 'creditCard':
      return <CreditCard className={cls} />;
    case 'refreshCw':
      return <RefreshCw className={cls} />;
    case 'headphones':
      return <Headphones className={cls} />;
  }
}

interface ServiceCardItemProps {
  service: SystemServiceItem;
}

/**
 * Thẻ hiển thị từng dịch vụ hệ thống AP Sports (hỗ trợ Dark/Light Mode).
 */
export function ServiceCardItem({ service }: ServiceCardItemProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:border-orange-500/50 hover:shadow-xl transition-all flex flex-col justify-between group">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${service.iconBgClass}`}
          >
            {renderServiceIcon(service.iconName)}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 ${service.accentClass}`}
          >
            {service.badge}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
          {service.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {service.description}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
        <Link
          href={service.href}
          className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider hover:gap-2.5 transition-all ${service.accentClass}`}
        >
          <span>{service.ctaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
