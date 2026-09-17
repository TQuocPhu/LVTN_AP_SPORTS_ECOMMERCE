import type { Metadata } from 'next';
import HeroBannerSlider from '@/components/customer/home/HeroBannerSlider';
import CategoryGrid from '@/components/customer/home/CategoryGrid';
import FeaturedProducts from '@/components/customer/home/FeaturedProducts';
import MembershipBenefitsSection from '@/components/customer/home/MembershipBenefitsSection';

export const metadata: Metadata = {
  title: 'AP Sports - Trang Thiết Bị & Dụng Cụ Thể Thao Chính Hãng 100%',
  description:
    'Cửa hàng trang thiết bị thể thao cao cấp hàng đầu Việt Nam. Cung cấp giày bóng đá, vợt cầu lông, bóng rổ, dụng cụ võ thuật và gym chính hãng 100%. Giao hàng nhanh 2h.',
  keywords: ['AP Sports', 'Đồ thể thao', 'Giày bóng đá', 'Vợt cầu lông', 'Bóng rổ', 'Dụng cụ Gym'],
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. Hero Master Banner Slider */}
      <HeroBannerSlider />

      {/* 2. Sport Categories Highlight Grid */}
      <CategoryGrid />

      {/* 3. Featured Products Showcase */}
      <FeaturedProducts />

      {/* 4. Membership Privileges & VIP Benefits */}
      <MembershipBenefitsSection />
    </main>
  );
}
