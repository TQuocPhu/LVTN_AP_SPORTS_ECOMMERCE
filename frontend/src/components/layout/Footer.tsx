import Link from 'next/link';
import Image from 'next/image';
import { Zap } from 'lucide-react';
import ServiceFeatures from '../ui/ServiceFeatures';

/**
 * Component Chân Trang Master Shell Footer.
 * Nhúng ServiceFeatures (4 cam kết dịch vụ) độc lập và thông tin doanh nghiệp.
 */
export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      {/* 1. Thanh Cam Kết Dịch Vụ Độc Lập (Service Features Component) */}
      <ServiceFeatures />

      {/* 2. Cột Thông Tin Footer */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Cột 1: Thông tin Thương Hiệu */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-3">
            <Image
              src="/images/ap-sports_logo_no-back.png"
              alt="AP Sports Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]"
            />
            <span className="text-xl font-black text-white uppercase tracking-wider">AP SPORTS</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hệ thống cung cấp trang thiết bị, dụng cụ bóng đá và thể thao cao cấp chuẩn Enterprise dành cho mọi vận động viên và SME.
          </p>
        </div>

        {/* Cột 2: Danh Mục Thể Thao */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
            DANH MỤC THỂ THAO
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/products?category=football" className="hover:text-orange-400 transition-colors">Dụng cụ Bóng Đá</Link></li>
            <li><Link href="/products?category=badminton-volleyball" className="hover:text-orange-400 transition-colors">Cầu Lông & Bóng Chuyền</Link></li>
            <li><Link href="/products?category=martial-basketball" className="hover:text-orange-400 transition-colors">Võ Thuật & Bóng Rổ</Link></li>
            <li><Link href="/products?category=fitness-accessories" className="hover:text-orange-400 transition-colors">Phụ Kiện Tập luyện Fitness</Link></li>
          </ul>
        </div>

        {/* Cột 3: Hỗ Trợ Khách Hàng */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
            HỖ TRỢ KHÁCH HÀNG
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/faq" className="hover:text-orange-400 transition-colors">Câu hỏi thường gặp (FAQ)</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-orange-400 transition-colors">Chính sách giao hàng</Link></li>
            <li><Link href="/return-policy" className="hover:text-orange-400 transition-colors">Chính sách đổi trả 30 ngày</Link></li>
            <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Gửi liên hệ hỗ trợ</Link></li>
          </ul>
        </div>

        {/* Cột 4: Tổng Đài & Kết Nối */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-orange-500 pl-2">
            TỔNG ĐÀI HỖ TRỢ
          </h4>
          <div className="space-y-3 text-xs">
            <p>Hotline tư vấn: <span className="font-bold text-orange-400 text-sm">1900 - 8888</span></p>
            <p>Email: <span className="text-slate-300">support@apsports.com</span></p>
            <p>Địa chỉ: <span className="text-slate-300">Khu Công Nghệ Cao, Q.9, TP. Hồ Chí Minh</span></p>
          </div>
        </div>
      </div>

      {/* 3. Bản Quyền Copyright */}
      <div className="border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 bg-slate-950">
        <p>© 2026 AP Sports Enterprise Platform. All rights reserved. Đề tài Luận văn Tốt nghiệp.</p>
      </div>
    </footer>
  );
}
