'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ServiceFeatures from '../ui/ServiceFeatures';

/**
 * Component Chân Trang Master Shell Footer.
 */
export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="ap-footer w-full border-t text-sm transition-colors duration-300">
      {/* 1. Service Features Bar */}
      <ServiceFeatures />

      {/* 2. Footer Columns */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Thương Hiệu */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/ap-sports_logo_no-back.png"
              alt="AP Sports Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]"
            />
            <span className="text-xl font-black uppercase tracking-wider footer-heading" style={{ color: 'var(--text-primary)' }}>
              AP SPORTS
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--footer-text)' }}>
            Hệ thống cung cấp trang thiết bị, dụng cụ bóng đá và thể thao cao cấp chuẩn Enterprise dành cho mọi vận động viên và SME.
          </p>
        </div>

        {/* Cột 2: Danh Mục */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2 footer-heading" style={{ color: 'var(--text-primary)' }}>
            DANH MỤC THỂ THAO
          </h4>
          <ul className="space-y-2.5 text-xs">
            {[
              { href: '/products?category=football', label: 'Dụng cụ Bóng Đá' },
              { href: '/products?category=badminton-volleyball', label: 'Cầu Lông & Bóng Chuyền' },
              { href: '/products?category=martial-basketball', label: 'Võ Thuật & Bóng Rổ' },
              { href: '/products?category=fitness-accessories', label: 'Phụ Kiện Tập luyện Fitness' },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="footer-text hover:text-orange-400 transition-colors" style={{ color: 'var(--footer-text)' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: Hỗ Trợ */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2" style={{ color: 'var(--text-primary)' }}>
            HỖ TRỢ KHÁCH HÀNG
          </h4>
          <ul className="space-y-2.5 text-xs">
            {[
              { href: '/faq', label: 'Câu hỏi thường gặp (FAQ)' },
              { href: '/shipping-policy', label: 'Chính sách giao hàng' },
              { href: '/return-policy', label: 'Chính sách đổi trả 30 ngày' },
              { href: '/contact', label: 'Gửi liên hệ hỗ trợ' },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-orange-400 transition-colors" style={{ color: 'var(--footer-text)' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 4: Tổng Đài */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2" style={{ color: 'var(--text-primary)' }}>
            TỔNG ĐÀI HỖ TRỢ
          </h4>
          <div className="space-y-3 text-xs" style={{ color: 'var(--footer-text)' }}>
            <p>Hotline tư vấn: <span className="font-bold text-orange-400 text-sm">1900 - 8888</span></p>
            <p>Email: <span style={{ color: 'var(--text-secondary)' }}>support@apsports.com</span></p>
            <p>Địa chỉ: <span style={{ color: 'var(--text-secondary)' }}>Khu Công Nghệ Cao, Q.9, TP. Hồ Chí Minh</span></p>
          </div>
        </div>
      </div>

      {/* 3. Copyright */}
      <div className="footer-divider border-t py-4 px-4 text-center text-xs" style={{ borderColor: 'var(--footer-border)', color: 'var(--text-faint)' }}>
        <p>© 2026 AP Sports Enterprise Platform. All rights reserved. Đề tài Luận văn Tốt nghiệp.</p>
      </div>
    </footer>
  );
}
