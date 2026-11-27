'use client';

import React from 'react';
import {
  Award,
  Barcode,
  History,
  Layers,
  Sparkles,
  Store,
  Truck,
} from 'lucide-react';
import { AboutTimelineMilestone } from '@/constants/about-timeline-data';
import { useAboutTimeline } from '@/hooks/useAboutTimeline';

function renderMilestoneIcon(iconName: AboutTimelineMilestone['iconName']) {
  const cls = 'w-5 h-5 text-orange-500 shrink-0';
  switch (iconName) {
    case 'store':
      return <Store className={cls} />;
    case 'award':
      return <Award className={cls} />;
    case 'layers':
      return <Layers className={cls} />;
    case 'barcode':
      return <Barcode className={cls} />;
    case 'truck':
      return <Truck className={cls} />;
    case 'sparkles':
      return <Sparkles className={cls} />;
  }
}

/**
 * Section Lược Đồ Hình Thành Hệ Thống (08/2010 → 11/2026, 16 năm).
 * Hiển thị thẻ sự kiện tương ứng khi hover chuột (hoặc chạm trên mobile) vào từng cột mốc.
 */
export function AboutTimelineSection() {
  const {
    milestones,
    activeIndex,
    activeMilestone,
    handleHoverMilestone,
    handleSelectMilestone,
  } = useAboutTimeline();

  return (
    <section
      id="formation-timeline"
      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-8"
    >
      {/* Tiêu đề Section */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest border border-orange-200 dark:border-orange-800">
          <History className="w-4 h-4 text-orange-500" />
          <span>Hành Trình 16 Năm Phát Triển (08/2010 – 11/2026)</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          LƯỢC ĐỒ HÌNH THÀNH HỆ THỐNG AP SPORTS
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Rê chuột (hoặc chạm) vào từng cột mốc thời gian bên dưới để khám phá các dấu ấn phát
          triển của AP Sports từ tháng 08/2010 đến năm 2026.
        </p>
      </div>

      {/* Card chi tiết hiển thị trên Mobile (< md) */}
      <div className="md:hidden rounded-2xl border border-orange-200 dark:border-orange-800/60 bg-orange-50/70 dark:bg-slate-800/80 p-5 shadow-md space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
            {renderMilestoneIcon(activeMilestone.iconName)}
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
              {activeMilestone.monthYear}
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {activeMilestone.title}
            </h3>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeMilestone.description}
        </p>
      </div>

      {/* Lược đồ Timeline ngang */}
      <div className="relative md:pt-44 pb-2 overflow-x-auto md:overflow-visible">
        <div className="relative min-w-[640px] md:min-w-0">
          {/* Đường line ngang nối các cột mốc */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 opacity-85" />

          <div className="relative grid grid-cols-6 gap-3 sm:gap-5 items-center">
            {milestones.map((item, idx) => {
              const isActive = idx === activeIndex;
              const isFirst = idx === 0;
              const isLast = idx === milestones.length - 1;

              const desktopAlignClass = isFirst
                ? 'left-0 translate-x-0'
                : isLast
                  ? 'right-0 translate-x-0'
                  : 'left-1/2 -translate-x-1/2';

              const arrowAlignClass = isFirst
                ? 'left-10'
                : isLast
                  ? 'right-10'
                  : 'left-1/2 -translate-x-1/2';

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => handleHoverMilestone(idx)}
                  onClick={() => handleSelectMilestone(idx)}
                  className="relative flex flex-col items-center cursor-pointer group"
                >
                  {/* Tooltip Card hiển thị phía trên cột mốc đang hover (Desktop >= md) */}
                  {isActive && (
                    <div
                      className={`hidden md:block absolute bottom-full mb-5 w-72 lg:w-80 z-20 ${desktopAlignClass}`}
                    >
                      <div className="relative rounded-2xl bg-white dark:bg-slate-800 border-2 border-orange-500/80 p-4 shadow-2xl text-left">
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            {renderMilestoneIcon(item.iconName)}
                          </div>
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                              {item.monthYear}
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                              {item.title}
                            </h4>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Mũi tên chỉ xuống đúng ô cột mốc */}
                        <div
                          className={`absolute -bottom-2.5 w-4 h-4 rotate-45 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-orange-500/80 ${arrowAlignClass}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Ô vuông cột mốc Tháng/Năm */}
                  <div
                    className={`relative z-10 w-22 h-22 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 border-2 shadow-lg ${
                      isActive
                        ? 'bg-white dark:bg-slate-950 border-orange-500 text-orange-600 dark:text-orange-400 scale-110 shadow-orange-500/25'
                        : 'bg-slate-900 dark:bg-slate-800 border-slate-700 dark:border-slate-700 text-white hover:border-orange-400 hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                      Mốc {idx + 1}
                    </span>
                    <span className="text-sm sm:text-base font-black tracking-tight mt-0.5">
                      {item.shortLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
