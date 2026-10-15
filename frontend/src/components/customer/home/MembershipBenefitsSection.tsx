'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Award, Zap, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function MembershipBenefitsSection() {
  const { user, loading } = useAuth();

  // Chỉ hiển thị cho khách vãng lai (chưa đăng nhập)
  if (loading || user) {
    return null;
  }

  return (
    <section className="py-16 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl bg-white dark:bg-slate-950 transition-colors duration-300">
          {/* Background Image Banner with dynamic Dark/Light overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/banners/membership_benefits_banner.png"
              alt="Hội Viên AP Sports Privileges"
              fill
              className="object-cover object-center opacity-15 dark:opacity-35 transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/70 dark:from-slate-950 dark:via-slate-950/90 dark:to-slate-950/40 transition-colors duration-300" />
          </div>

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>CHƯƠNG TRÌNH HỘI VIÊN THÂN THIẾT AP SPORTS</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
                TÍCH ĐIỂM ĐỔI QUÀ <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-500 bg-clip-text text-transparent">
                  ĐẶC QUYỀN V.I.P 2026
                </span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                Đăng ký tài khoản Khách hàng AP Sports ngay hôm nay để nhận voucher giảm giá 200.000₫ cho đơn hàng đầu tiên, tích điểm trên từng sản phẩm và miễn phí vận chuyển cho mọi đơn từ 1.000.000₫.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur transition-colors duration-300">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase">100% CHÍNH HÃNG</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Đền bù 200% nếu phát hiện hàng giả</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/60 backdrop-blur transition-colors duration-300">
                  <RefreshCw className="w-6 h-6 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase">30 NGÀY ĐỔI TRẢ</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Đổi size & mẫu mã hoàn toàn miễn phí</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/30 text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>ĐĂNG KÝ HỘI VIÊN NGAY</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-700 font-bold px-6 py-3.5 rounded-xl transition-all text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>ĐĂNG NHẬP</span>
                </Link>
              </div>
            </div>

            {/* Right: Platinum Card Graphic — responsive Dark/Light theme */}
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/90 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl dark:shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">AP SPORTS PLATINUM CARD</span>
                  <Zap className="w-5 h-5 text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" />
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">HỌ TÊN HỘI VIÊN</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">NGUYỄN VĂN THỂ THAO</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-mono font-bold">ID: AP-VIP-2026-8888</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">ĐIỂM TÍCH LŨY: </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">12.500 PTS</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">HẠNG: </span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">DIAMOND VIP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
