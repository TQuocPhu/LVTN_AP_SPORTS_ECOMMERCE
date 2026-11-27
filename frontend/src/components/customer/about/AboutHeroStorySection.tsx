'use client';

import React from 'react';
import Image from 'next/image';
import { Flame, Target, Users } from 'lucide-react';

/**
 * Section 1: Câu chuyện thương hiệu & Sứ mệnh AP Sports.
 */
export function AboutHeroStorySection() {
  return (
    <section id="brand-story" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest border border-orange-200 dark:border-orange-800/60">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span>Sứ Mệnh &amp; Tầm Nhìn</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
          KHỞI NGUỒN TỪ{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
            ĐAM MÊ THỂ THAO
          </span>{' '}
          THUẦN KHUYẾT
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Được thành lập từ tháng 08/2010 với tình yêu cháy bỏng dành cho các bộ môn vận động đỉnh
          cao, <strong className="text-slate-900 dark:text-white font-bold">AP Sports</strong> ra
          đời với mục tiêu mang đến cho người tập luyện Việt Nam nguồn trang thiết bị dụng cụ{' '}
          <span className="text-orange-600 dark:text-orange-400 font-semibold">
            chuẩn mực quốc tế
          </span>
          . Chúng tôi tin rằng mỗi bước chạy, mỗi cú đập vợt hay từng pha bóng đẹp mắt đều xứng
          đáng nhận được sự hỗ trợ tuyệt đối từ những sản phẩm bền bỉ và ưu việt nhất.
        </p>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Trải qua 16 năm hình thành và phát triển bền bỉ (2010 – 2026), AP Sports đã từng bước
          chuyển mình từ một cửa hàng chuyên biệt trở thành{' '}
          <strong className="text-slate-900 dark:text-white font-bold">
            Hệ sinh thái thể thao đa năng (Flexible Store)
          </strong>{' '}
          – nơi mỗi khách hàng đều tìm thấy người đồng hành tin cậy trên hành trình bứt phá giới hạn
          bản thân.
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Tầm Nhìn 2030</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Trở thành chuỗi cửa hàng thể thao công nghệ top 1 Việt Nam.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Đồng Hành Cộng Đồng
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tài trợ &amp; tổ chức hàng trăm giải đấu phong trào trên toàn quốc.
              </p>
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

            <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-3 p-3 px-4 rounded-2xl bg-slate-950/80 border border-white/15 shadow-2xl backdrop-blur-md z-10 text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
                16+
              </div>
              <div>
                <p className="font-extrabold text-xs text-white">Năm Phát Triển (2010–2026)</p>
                <p className="text-[11px] text-slate-300">Khẳng định vị thế uy tín</p>
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="px-2.5 py-1 rounded-md bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider">
                AP SPORTS SHOWROOM
              </span>
              <h3 className="text-lg font-bold">Không Gian Trải Nghiệm Chuẩn Quốc Tế</h3>
              <p className="text-xs text-slate-300">
                Trưng bày hàng ngàn mẫu sản phẩm bóng đá, cầu lông, bóng rổ &amp; gym cao cấp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
