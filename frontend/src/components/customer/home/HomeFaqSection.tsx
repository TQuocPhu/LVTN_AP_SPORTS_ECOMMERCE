'use client';

import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useHomeFaq } from '@/hooks/useHomeFaq';

/**
 * Component hiển thị khối "Câu Hỏi Thường Gặp" (HomeFaqSection) trên Trang chủ Khách hàng.
 * Thiết kế tinh gọn chiều cao, sử dụng Select Option Dropdown để lọc chủ đề,
 * đảm bảo Responsive mượt mà trên Mobile, Tablet, Desktop và hỗ trợ đầy đủ Dark/Light Mode.
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture: Không chứa useState/useEffect trong Component.
 */
export default function HomeFaqSection() {
  const {
    categories,
    selectedCategory,
    filteredFaqs,
    openFaqId,
    handleSelectCategory,
    handleToggleFaq,
  } = useHomeFaq();

  return (
    <section
      className="py-10 sm:py-12 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Phần tiêu đề khối & Bộ lọc dạng Select Option Dropdown */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
              <span>GIẢI ĐÁP THẮC MẮC NHANH</span>
            </div>

            <h2
              className="text-xl sm:text-3xl font-black uppercase tracking-tight leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              CÂU HỎI THƯỜNG GẶP KHI{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                MUA SẮM TẠI AP SPORTS
              </span>
            </h2>
          </div>

          {/* Bộ lọc chủ đề dạng Select Option Dropdown chuẩn Responsive */}
          <div className="w-full md:w-auto shrink-0">
            <label htmlFor="home-faq-category-select" className="sr-only">
              Lọc câu hỏi theo chủ đề
            </label>
            <div className="relative w-full sm:w-72">
              <Filter className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="home-faq-category-select"
                value={selectedCategory}
                onChange={(e) => handleSelectCategory(e.target.value)}
                suppressHydrationWarning
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm font-bold border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)',
                }}
              >
                {categories.map((cat) => (
                  <option
                    key={cat.key}
                    value={cat.key}
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
          </div>
        </div>

        {/* Lưới bố cục gọn gàng: Cột trái Accordion 4 câu hỏi (8 cột) - Cột phải Hộp Cam Kết (4 cột) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Cột Trái: Danh sách câu hỏi Accordion tinh gọn chiều cao */}
          <div className="lg:col-span-8 space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-orange-500 dark:border-orange-500/80 shadow-md shadow-orange-500/5'
                      : 'hover:border-orange-500/40'
                  }`}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: isOpen ? undefined : 'var(--card-border)',
                  }}
                >
                  {/* Nút tiêu đề câu hỏi (Accordion Header) */}
                  <button
                    type="button"
                    onClick={() => handleToggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    suppressHydrationWarning
                    className="w-full px-4 py-3.5 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                          0{idx + 1}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                          {faq.badgeText}
                        </span>
                      </div>

                      <h3
                        className="text-xs sm:text-sm md:text-base font-extrabold leading-snug pr-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 border ${
                        isOpen
                          ? 'bg-orange-500 text-white border-orange-500 rotate-180'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                      style={
                        isOpen
                          ? undefined
                          : {
                              backgroundColor: 'var(--bg-surface-2)',
                              borderColor: 'var(--bg-border)',
                            }
                      }
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {/* Nội dung câu trả lời ngắn gọn, súc tích (Accordion Body) */}
                  {isOpen && (
                    <div
                      className="px-4 pb-4 sm:px-5 sm:pb-4 pt-2 border-t space-y-2.5 animate-fade-in"
                      style={{ borderColor: 'var(--bg-border)' }}
                    >
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {faq.answer}
                      </p>

                      <div
                        className="px-3 py-2 rounded-xl border flex items-center gap-2"
                        style={{
                          backgroundColor: 'var(--bg-surface-2)',
                          borderColor: 'var(--bg-border)',
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span
                          className="text-[11px] sm:text-xs font-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {faq.keyTakeaway}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cột Phải: Hộp thông tin Bảo vệ Quyền lợi người mua (Thiết kế gọn gàng, đồng bộ chiều cao) */}
          <div className="lg:col-span-4">
            <div
              className="rounded-2xl p-5 sm:p-6 border space-y-4 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    BẢO VỆ NGƯỜI MUA
                  </span>
                  <h3
                    className="text-sm sm:text-base font-black uppercase tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    AN TÂM MUA SẮM 100%
                  </h3>
                </div>
              </div>

              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Mọi đơn hàng đều được bảo đảm bởi quy trình kiểm định kho vận AP WMS và chính sách hậu mãi minh bạch.
              </p>

              <ul className="space-y-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>Đền bù 200% nếu phát hiện hàng giả</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>Miễn phí đổi size tận nhà 30 ngày</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>Mở hộp đồng kiểm trước khi thanh toán</span>
                </li>
              </ul>

              <div className="pt-1">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Gửi Câu Hỏi Cho Chuyên Viên</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
