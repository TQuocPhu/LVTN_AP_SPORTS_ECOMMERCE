'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import {
  ShieldCheck,
  Award,
  Lock,
  Truck,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Target,
  Users,
  Flame,
  ArrowRight,
  BadgePercent,
  RefreshCw,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. Page Header Banner chuẩn – Đồng bộ 100% layout với các trang khác */}
      <PageHeaderBanner
        title="GIỚI THIỆU AP SPORTS"
        subtitle="Hành trình xây dựng hệ thống bán lẻ trang thiết bị thể thao chính hãng và uy tín hàng đầu Việt Nam."
        breadcrumbs={[{ label: 'Giới thiệu' }]}
      />

      {/* Main Content Area */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 space-y-20">
        {/* SECTION 1: Brand Story & Mission */}
        <section id="brand-story" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest border border-orange-200 dark:border-orange-800/60">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Sứ Mệnh & Tầm Nhìn</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
              KHỞI NGUỒN TỪ <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">ĐAM MÊ THỂ THAO</span> THUẦN KHUYẾT
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Được thành lập từ tình yêu cháy bùng dành cho các bộ môn vận động đỉnh cao, <strong className="text-slate-900 dark:text-white font-bold">AP Sports</strong> ra đời với mục tiêu mang đến cho người tập luyện Việt Nam nguồn trang thiết bị dụng cụ <span className="text-orange-600 dark:text-orange-400 font-semibold">chuẩn mực quốc tế</span>. Chúng tôi tin rằng mỗi bước chạy, mỗi cú đập vợt hay từng pha bóng đẹp mắt đều xứng đáng nhận được sự hỗ trợ tuyệt đối từ những sản phẩm bền bỉ và ưu việt nhất.
            </p>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Trải qua quá trình hình thành và phát triển bền bỉ, AP Sports đã từng bước chuyển mình từ một cửa hàng chuyên biệt trở thành <strong className="text-slate-900 dark:text-white font-bold">Hệ sinh thái thể thao đa năng (Flexible Store)</strong> – nơi mỗi khách hàng đều tìm thấy người đồng hành tin cậy trên hành trình bứt phá giới hạn bản thân.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tầm Nhìn 2030</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Trở thành chuỗi cửa hàng thể thao công nghệ top 1 Việt Nam.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Đồng Hành Cộng Đồng</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tài trợ & tổ chức hàng trăm giải đấu phòng trào trên toàn quốc.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
                  alt="Không gian cửa hàng AP Sports"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Glassmorphic Experience Badge anchored in top-left inside photo */}
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-3 p-3 px-4 rounded-2xl bg-slate-950/80 border border-white/15 shadow-2xl backdrop-blur-md z-10 text-white">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                    10+
                  </div>
                  <div>
                    <p className="font-extrabold text-xs text-white">Năm Phát Triển</p>
                    <p className="text-[11px] text-slate-300">Khẳng định vị thế uy tín</p>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="px-2.5 py-1 rounded-md bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider">
                    AP SPORTS SHOWROOM
                  </span>
                  <h3 className="text-lg font-bold">Không Gian Trải Nghiệm Chuẩn Quốc Tế</h3>
                  <p className="text-xs text-slate-300">Trưng bày hàng ngàn mẫu sản phẩm bóng đá, cầu lông, bóng rổ & gym cao cấp.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Key Dynamic Stats Counter Bar */}
        <section id="stats-counter" className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-white/20">
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black tracking-tight">50.000+</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">Khách Hàng Tin Dùng</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black tracking-tight">100%</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">Hàng Chính Hãng</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black tracking-tight">7 Ngày</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">Đổi Trả Miễn Phí</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black tracking-tight">99.8%</div>
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-orange-100">Đánh Giá Hài Lòng</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Supply Chain Transparency & 100% Authentic Guarantee */}
        <section id="transparency-guarantee" className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest border border-orange-200 dark:border-orange-800">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Cam Kết Chất Lượng Tuyệt Đối</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              MINH BẠCH NGUỒN HÀNG - CAM KẾT CHÍNH HÃNG 100%
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tại AP Sports, tính chân thật và sự minh bạch trong mọi nguồn nhập hàng là tôn chỉ hoạt động không bao giờ đánh đổi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Nguồn gốc phân phối */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 hover:border-orange-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Đối Tác Ủy Quyền Chính Thức</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tất cả các dòng giày đá bóng, vợt cầu lông, phụ kiện gym... đều được nhập trực tiếp từ nhà phân phối chính hãng của <strong className="text-slate-900 dark:text-slate-200">Nike, Yonex, Mizuno, Jordan, Adidas</strong> có chứng nhận CO/CQ và tem niêm phong tiêu chuẩn.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-orange-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Đền bù 200% nếu phát hiện hàng giả</span>
              </div>
            </div>

            {/* Card 2: Giá cả niêm yết công khai */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 hover:border-orange-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BadgePercent className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Giá Cả Niêm Yết Công Khai</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Mọi giá bán niêm yết trên website đều đã bao gồm thuế GTGT (VAT), không phát sinh bất kỳ khoản phí phụ thu bất ngờ nào. Khách hàng hoàn toàn chủ động ngân sách và được cấp hóa đơn tài chính VAT hợp lệ.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Minh bạch 100% chi phí hóa đơn</span>
              </div>
            </div>

            {/* Card 3: Đặt hàng & Đổi trả */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 hover:border-orange-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Đổi Trả Dễ Dàng Trong 7 Ngày</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Khi nhận hàng nếu chọn nhầm size hoặc không hài lòng về màu sắc, AP Sports hỗ trợ đổi size/mẫu mới nhanh chóng trong vòng 7 ngày làm việc với thủ tục tối giản, tận tâm phục vụ quý khách.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
                <span>Hỗ trợ đổi trả tận nhà</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Payment Integrity & Honest Order Flow */}
        <section id="payment-trust" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span>Thanh Toán An Toàn & Trung Thực</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                AN TÂM ĐẶT HÀNG - THANH TOÁN TRUNG THỰC
              </h2>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Chúng tôi hiểu rằng niềm tin của khách hàng khi mua sắm trực tuyến là vô giá. Tại AP Sports, quy trình thanh toán và giao nhận được xây dựng minh bạch 100%:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Kiểm Tra Hàng Trước Khi Thanh Toán (COD Đồng Kiểm)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Quý khách hoàn toàn được quyền mở hộp kiểm tra đúng mẫu mã, đúng size giày/áo rồi mới thanh toán tiền cho nhân viên giao hàng.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Bảo Mật Thông Tin Chuyển Khoản & Ví Điện Tử</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Các giao dịch chuyển khoản ngân hàng qua mã QR động tự động cập nhật đơn hàng tức thì, mã hóa 256-bit bảo mật tuyệt đối.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hoàn Tiền Nhanh Chóng Khi Có Sự Cố</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Trong trường hợp đơn hàng hủy hoặc lỗi kỹ thuật từ nhà sản xuất, tiền được hoàn về tài khoản của khách hàng trong 24 giờ làm việc.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 uppercase tracking-wider text-xs"
                >
                  <span>MUA SẮM NGAY BÂY GIỜ</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
                  alt="Giày đá bóng chính hãng AP Sports"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="font-black text-xl">AP SPORTS GUARANTEE</span>
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-widest">100% CHÍNH HÃNG - GIAO HÀNG TOÀN QUỐC</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
