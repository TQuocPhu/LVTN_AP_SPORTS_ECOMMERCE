'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Flame,
  CheckCircle2,
  ArrowRight,
  Award,
} from 'lucide-react';
import {
  useHomeBrandStory,
  BrandStatItem,
  DIGIT_CELL_HEIGHT_EM,
} from '@/hooks/useHomeBrandStory';

/**
 * Hàm phụ trợ thuần giao diện ánh xạ khóa icon sang biểu tượng Lucide tương ứng cho từng ô thống kê.
 */
function renderStatIcon(iconKey: BrandStatItem['iconKey']) {
  const iconClass = 'w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400';
  switch (iconKey) {
    case 'users':
      return <Users className={iconClass} />;
    case 'shield-award':
      return <ShieldCheck className={iconClass} />;
    case 'refresh-clock':
      return <RefreshCw className={iconClass} />;
    case 'headset':
      return <Headphones className={iconClass} />;
  }
}

/**
 * Component hiển thị khối "Tinh Thần Thể Thao & Con Số Tự Hào" (HomeBrandStory) trên Trang chủ Khách hàng.
 * - Đã loại bỏ đường kẻ ngang phía dưới khối (không dùng border-b) theo đúng yêu cầu thiết kế.
 * - Hiệu ứng số: Từng chữ số cuộn dọc 1 vòng tuần tự (0 -> 9 -> số đích) mượt mà trong 3 giây (Odometer Reel).
 * - Sử dụng đơn vị dịch chuyển em cố định theo từng ô số (`DIGIT_CELL_HEIGHT_EM`) để dừng chuẩn xác 100% ở số đích.
 */
export default function HomeBrandStory() {
  const { sectionRef, stats, pillars, statTokenGroups, isSpinning } = useHomeBrandStory();

  return (
    <section
      ref={sectionRef}
      className="py-10 sm:py-14 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ====================================================================
              CỘT TRÁI (7 CỘT): CÂU CHUYỆN THƯƠNG HIỆU & 3 TRỤ CỘT CHẤT LƯỢNG
             ==================================================================== */}
          <div className="lg:col-span-7 space-y-5">
            {/* Nhãn huy hiệu thương hiệu */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse shrink-0" />
              <span>CÂU CHUYỆN THƯƠNG HIỆU & CAM KẾT CHẤT LƯỢNG</span>
            </div>

            {/* Tiêu đề chính */}
            <h2
              className="text-xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              BỨT PHÁ GIỚI HẠN <br />
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 dark:from-orange-400 dark:via-amber-400 dark:to-orange-500 bg-clip-text text-transparent">
                NÂNG TẦM THỂ THAO VIỆT
              </span>
            </h2>

            {/* Đoạn giới thiệu tổng quan */}
            <p
              className="text-sm sm:text-base leading-relaxed font-normal"
              style={{ color: 'var(--text-secondary)' }}
            >
              Khởi nguồn từ niềm đam mê mãnh liệt trên sân cỏ, sàn đấu cầu lông và thảm võ thuật,{' '}
              <strong style={{ color: 'var(--text-primary)' }}>AP Sports</strong> được xây dựng với sứ mệnh mang đến cho người yêu thể thao Việt Nam những trang thiết bị chuẩn thi đấu quốc tế, minh bạch nguồn gốc và dịch vụ hậu mãi tận tâm nhất.
            </p>

            {/* Danh sách 3 trụ cột cam kết */}
            <div className="space-y-3.5 pt-1">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="p-4 rounded-2xl border transition-all duration-300 hover:border-orange-500/50 flex items-start gap-3.5"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3
                      className="text-sm sm:text-base font-extrabold uppercase tracking-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {pillar.title}
                    </h3>
                    <p
                      className="text-xs sm:text-sm leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cụm nút điều hướng và chứng nhận */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-xs sm:text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Khám Phá Kho Thiết Bị</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--bg-surface-2)',
                  borderColor: 'var(--bg-border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Award className="w-4 h-4 text-orange-500" />
                <span>Nhà Phân Phối Chính Hãng Uy Tín</span>
              </div>
            </div>
          </div>

          {/* ====================================================================
              CỘT PHẢI (5 CỘT): LƯỚI 4 CON SỐ TỰ HÀO (CUỘN DỌC 1 VÒNG MƯỢT MÀ 3S)
             ==================================================================== */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
              {stats.map((stat, idx) => {
                const tokens = statTokenGroups[idx] ?? [];

                return (
                  <div
                    key={stat.id}
                    className="group relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all duration-300 hover:border-orange-500/60 hover:-translate-y-1 shadow-sm hover:shadow-xl overflow-hidden flex flex-col justify-between min-h-[170px] sm:min-h-[205px]"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--card-border)',
                    }}
                  >
                    {/* Vòng sáng trang trí góc phải thẻ */}
                    <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-125" />

                    {/* Hàng trên: Icon và trạng thái bộ đếm */}
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
                        {renderStatIcon(stat.iconKey)}
                      </div>

                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span
                          className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${
                            isSpinning ? 'animate-ping' : ''
                          }`}
                        />
                        <span>VERIFIED</span>
                      </span>
                    </div>

                    {/* Con số cuộn 1 vòng mượt mà từng chữ số (Odometer Digit Reel 3s) */}
                    <div
                      className="my-1 sm:my-2 flex items-center flex-wrap text-2xl sm:text-4xl font-black font-mono tracking-tight select-none"
                      aria-label={stat.targetText}
                    >
                      {tokens.map((token) => {
                        if (token.type === 'static') {
                          return (
                            <span
                              key={token.key}
                              style={{
                                height: `${DIGIT_CELL_HEIGHT_EM}em`,
                                lineHeight: `${DIGIT_CELL_HEIGHT_EM}em`,
                              }}
                              className="inline-flex items-center bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-300 bg-clip-text text-transparent whitespace-pre"
                            >
                              {token.value}
                            </span>
                          );
                        }

                        return (
                          <span
                            key={token.key}
                            style={{
                              height: `${DIGIT_CELL_HEIGHT_EM}em`,
                              lineHeight: `${DIGIT_CELL_HEIGHT_EM}em`,
                            }}
                            className="relative inline-block overflow-hidden align-bottom"
                          >
                            <span
                              className="block transition-transform will-change-transform"
                              style={{
                                transform: `translateY(${token.translateYEm}em)`,
                                transitionDuration: `${token.durationMs}ms`,
                                transitionDelay: `${token.delayMs}ms`,
                                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                              }}
                            >
                              {token.reelDigits.map((digit, dIdx) => (
                                <span
                                  key={dIdx}
                                  style={{
                                    height: `${DIGIT_CELL_HEIGHT_EM}em`,
                                    lineHeight: `${DIGIT_CELL_HEIGHT_EM}em`,
                                  }}
                                  className="flex items-center justify-center tabular-nums bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 dark:from-orange-400 dark:via-amber-400 dark:to-yellow-300 bg-clip-text text-transparent"
                                >
                                  {digit}
                                </span>
                              ))}
                            </span>
                          </span>
                        );
                      })}
                    </div>

                    {/* Nhãn giải thích ý nghĩa con số */}
                    <div className="space-y-1 pt-2 border-t" style={{ borderColor: 'var(--bg-border)' }}>
                      <h3
                        className="text-xs sm:text-sm font-extrabold uppercase tracking-tight leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {stat.label}
                      </h3>
                      <p
                        className="text-[11px] sm:text-xs leading-relaxed line-clamp-2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {stat.subLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
