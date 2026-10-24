'use client';

import React from 'react';
import Link from 'next/link';
import {
  Crosshair,
  Ruler,
  ShieldCheck,
  PackageCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useHomeShoppingSteps, ShoppingStepItem } from '@/hooks/useHomeShoppingSteps';

/**
 * Hàm phụ trợ thuần giao diện để hiển thị đúng biểu tượng SVG theo từng bước mua sắm.
 */
function renderStepIcon(iconKey: ShoppingStepItem['iconKey'], isActive: boolean) {
  const iconClass = `w-6 h-6 transition-colors duration-300 ${
    isActive
      ? 'text-white'
      : 'text-orange-600 dark:text-orange-400 group-hover:text-white'
  }`;

  switch (iconKey) {
    case 'target':
      return <Crosshair className={iconClass} />;
    case 'ruler':
      return <Ruler className={iconClass} />;
    case 'shield-box':
      return <ShieldCheck className={iconClass} />;
    case 'truck-check':
      return <PackageCheck className={iconClass} />;
  }
}

/**
 * Component hiển thị khối "Quy Trình Mua Sắm Chuẩn Vận Động Viên" trên Trang chủ Khách hàng.
 * Tuân thủ kiến trúc Layer Architecture: Chỉ nhận dữ liệu và hàm điều khiển từ Hook `useHomeShoppingSteps`,
 * không chứa bất kỳ logic trạng thái (useState/useEffect) nào trong Component.
 * Hỗ trợ đầy đủ chế độ Sáng/Tối (Dark/Light Mode) đồng bộ với hệ thống biến CSS toàn cục.
 */
export default function HomeShoppingSteps() {
  const { steps, activeStepIndex, handleSelectStep } = useHomeShoppingSteps();

  return (
    <section
      className="py-10 sm:py-14 border-b transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--bg-border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Phần tiêu đề khối (Section Header) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>TRẢI NGHIỆM MUA SẮM CHUẨN VẬN ĐỘNG VIÊN</span>
            </div>

            <h2
              className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              4 BƯỚC TRANG BỊ DỤNG CỤ{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                CHÍNH HÃNG TẠI AP SPORTS
              </span>
            </h2>
          </div>

          <p
            className="text-xs sm:text-sm font-medium max-w-md leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Quy trình khép kín từ khâu tư vấn thông số kỹ thuật chuẩn xác đến khâu kiểm định xuất kho và đồng kiểm tận tay khi nhận hàng.
          </p>
        </div>

        {/* Lưới 4 Bước Mua Sắm (Responsive 1 cột Mobile -> 2 cột Tablet -> 4 cột Desktop) */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, idx) => {
            const isActive = activeStepIndex === idx;

            return (
              <div
                key={step.stepNumber}
                onMouseEnter={() => handleSelectStep(idx)}
                onClick={() => handleSelectStep(idx)}
                className={`group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer border ${
                  isActive
                    ? 'border-orange-500 dark:border-orange-500/80 shadow-xl shadow-orange-500/10 -translate-y-1'
                    : 'border-slate-200 dark:border-slate-800 hover:border-orange-500/60 dark:hover:border-orange-500/60 shadow-sm hover:shadow-lg hover:-translate-y-1'
                }`}
                style={{ backgroundColor: 'var(--card-bg)' }}
              >
                {/* Đường viền sáng phía trên thẻ khi đang kích hoạt */}
                <div
                  className={`absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r from-orange-500 to-amber-500 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />

                <div>
                  {/* Hàng trên cùng: Icon đại diện & Số thứ tự cách điệu */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                        isActive
                          ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30'
                          : 'bg-orange-500/10 dark:bg-orange-500/15 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-amber-600'
                      }`}
                    >
                      {renderStepIcon(step.iconKey, isActive)}
                    </div>

                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono tracking-tighter transition-colors duration-300 select-none ${
                        isActive
                          ? 'text-orange-500 dark:text-orange-400'
                          : 'text-slate-200 dark:text-slate-800 group-hover:text-orange-500/60'
                      }`}
                    >
                      {step.stepNumber}
                    </span>
                  </div>

                  {/* Nhãn phụ (Badge) */}
                  <div className="mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                      {step.badge}
                    </span>
                  </div>

                  {/* Tiêu đề bước */}
                  <h3
                    className="text-lg font-extrabold uppercase tracking-tight mb-2.5 leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {step.title}
                  </h3>

                  {/* Nội dung giải thích chi tiết */}
                  <p
                    className="text-xs sm:text-sm leading-relaxed mb-5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Chân thẻ: Cam kết nổi bật */}
                <div
                  className="pt-4 border-t flex items-center gap-2"
                  style={{ borderColor: 'var(--bg-border)' }}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {step.highlightText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh điều hướng nhanh dưới chân khối */}
        <div
          className="mt-8 p-4 sm:px-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--bg-surface-2)',
            borderColor: 'var(--bg-border)',
          }}
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="hidden sm:inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Bạn chưa chắc chắn về <strong style={{ color: 'var(--text-primary)' }}>form giày bóng đá</strong> hay{' '}
              <strong style={{ color: 'var(--text-primary)' }}>thông số vợt cầu lông</strong> phù hợp với lối chơi?
            </p>
          </div>

          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>Bắt Đầu Chọn Trang Bị</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
