'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface ContactMapProps {
  mapEmbedUrl?: string;
  addressTitle?: string;
}

export function ContactMap({
  mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500!2d106.33916591565229!3d9.926235914847513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0175bc905bb03%3A0x242aecd8469c06b!2zNTYxQiBQaGFuIMSQw6xuaCBQaMO5bmcsIEtob8yBbSA5LCBUcsOgIFZpbmgsIFbEqW5oIExvbmcsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1790034281772!5m2!1svi!2s',
  addressTitle = 'Đường Phan Đình Phùng, K10, Phường Trà Vinh, Vĩnh Long',
}: ContactMapProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Bản Đồ Vị Trí Cửa Hàng AP Sports
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Ghé thăm trực tiếp showroom AP Sports để trải nghiệm các dòng sản phẩm dụng cụ thể thao cao cấp
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-bold shrink-0">
          <Navigation className="w-3.5 h-3.5 text-orange-500" />
          <span>{addressTitle}</span>
        </div>
      </div>

      {/* Embedded Map Frame */}
      <div className="relative w-full h-[480px] sm:h-[580px] lg:h-[650px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-800">
        <iframe
          title="AP Sports Store Location Map"
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
