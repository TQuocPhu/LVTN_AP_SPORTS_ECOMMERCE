'use client';

import Image from 'next/image';

interface AuthLayoutWrapperProps {
  bannerImage: string;
  bannerAlt: string;
  children: React.ReactNode;
}

/**
 * Component Wrapper khung bố cục Auth chung cho cả Trang Đăng ký và Đăng nhập.
 * - Bên trái: Banner đồ họa thể thao sống động (có chữ nghệ thuật lồng sẵn).
 * - Bên phải: Form đăng nhập/đăng ký.
 * - Bọc chung bởi bối cảnh container bo góc tròn mềm mại (~24px / rounded-3xl) với màu nền nổi bật độc đáo.
 */
export default function AuthLayoutWrapper({
  bannerImage,
  bannerAlt,
  children,
}: AuthLayoutWrapperProps) {
  return (
    <div className="w-full max-w-5xl mx-auto my-6 bg-slate-900/95 border border-slate-800 rounded-3xl p-3 sm:p-4 md:p-6 shadow-2xl backdrop-blur-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Góc Bên Trái: Banner Đồ Họa Nghệ Thuật (Nằm ngoài form) */}
        <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[400px] lg:h-[540px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-lg">
          <Image
            src={bannerImage}
            alt={bannerAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-700 hover:scale-105"
          />
          {/* Subtle Overlay Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Góc Bên Phải: Form Đăng Nhập / Đăng Ký */}
        <div className="lg:col-span-6 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
