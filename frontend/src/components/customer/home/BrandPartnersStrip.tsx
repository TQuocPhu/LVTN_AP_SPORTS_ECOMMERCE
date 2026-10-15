'use client';

import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Award, Zap } from 'lucide-react';

const HIGHLIGHT_METRICS = [
  {
    icon: ShieldCheck,
    title: '100% HÀNG CHÍNH HÃNG',
    desc: 'Cam kết chất lượng chuẩn thi đấu',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Truck,
    title: 'GIAO TỐC ĐỘ TOÀN QUỐC',
    desc: 'Hỏa tốc 2H & liên tỉnh nhanh chóng',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    icon: RotateCcw,
    title: '30 NGÀY ĐỔI SIZE MIỄN PHÍ',
    desc: 'Yên tâm mua sắm không lo lệch cỡ',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: Award,
    title: 'BẢO HÀNH CHÍNH HÃNG',
    desc: 'Hỗ trợ kỹ thuật trọn đời sản phẩm',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
];

const FAMOUS_BRANDS = [
  { name: 'NIKE', tag: 'Bóng Đá & Running' },
  { name: 'ADIDAS', tag: 'Trang Phục Thi Đấu' },
  { name: 'YONEX', tag: 'Cầu Lông Chuyên Nghiệp' },
  { name: 'MIZUNO', tag: 'Giày Đinh & Quần Vợt' },
  { name: 'PUMA', tag: 'Tốc Độ & Năng Động' },
  { name: 'LINING', tag: 'Thể Thao Đỉnh Cao' },
];

export default function BrandPartnersStrip() {
  return (
    <section
      className="py-8 border-b transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: 'var(--section-alt-bg)', borderColor: 'var(--bg-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Value Proposition Highlights Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {HIGHLIGHT_METRICS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex items-center space-x-3 backdrop-blur-xs"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className={`p-2.5 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-110 ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] truncate mt-0.5 font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Top Brands Banner Strip */}
        <div
          className="p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 transition-colors"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="flex items-center space-x-2 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              ĐỐI TÁC THƯƠNG HIỆU HÀNG ĐẦU:
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-4 w-full">
            {FAMOUS_BRANDS.map((brand) => (
              <div
                key={brand.name}
                className="group px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all duration-200 cursor-default flex items-center space-x-1.5"
              >
                <span className="font-mono text-xs font-black tracking-wider text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                  {brand.name}
                </span>
                <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  • {brand.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
