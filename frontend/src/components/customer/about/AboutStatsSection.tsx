'use client';

import React from 'react';

/**
 * Section 2: Thanh thống kê con số nổi bật của AP Sports.
 */
export function AboutStatsSection() {
  return (
    <section
      id="stats-counter"
      className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-white/20">
        <div className="space-y-1">
          <div className="text-3xl sm:text-5xl font-black tracking-tight">50.000+</div>
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">
            Khách Hàng Tin Dùng
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl sm:text-5xl font-black tracking-tight">100%</div>
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">
            Hàng Chính Hãng
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl sm:text-5xl font-black tracking-tight">7 Ngày</div>
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">
            Đổi Trả Miễn Phí
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl sm:text-5xl font-black tracking-tight">99.8%</div>
          <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">
            Đánh Giá Hài Lòng
          </div>
        </div>
      </div>
    </section>
  );
}
