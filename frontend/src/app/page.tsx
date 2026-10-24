import type { Metadata } from 'next';
import ClientTopBar from '@/components/layout/ClientTopBar';
import HeroBannerSlider from '@/components/customer/home/HeroBannerSlider';
import HomeShoppingSteps from '@/components/customer/home/HomeShoppingSteps';
import HomeFeaturedSportsBanners from '@/components/customer/home/HomeFeaturedSportsBanners';
import FeaturedProducts from '@/components/customer/home/FeaturedProducts';
import HomeBrandStory from '@/components/customer/home/HomeBrandStory';
import HomeContactBannerSection from '@/components/customer/home/HomeContactBannerSection';
import HomeFaqSection from '@/components/customer/home/HomeFaqSection';
import MembershipBenefitsSection from '@/components/customer/home/MembershipBenefitsSection';

export const metadata: Metadata = {
  title: 'AP Sports - Trang Thiết Bị & Dụng Cụ Thể Thao Chính Hãng 100%',
  description:
    'Cửa hàng trang thiết bị thể thao cao cấp hàng đầu Việt Nam. Cung cấp giày bóng đá, vợt cầu lông, bóng rổ, dụng cụ võ thuật và gym chính hãng 100%. Giao hàng nhanh 2h.',
  keywords: ['AP Sports', 'Đồ thể thao', 'Giày bóng đá', 'Vợt cầu lông', 'Bóng rổ', 'Dụng cụ Gym'],
};

/**
 * Trang chủ Khách hàng (Customer Homepage) của hệ thống AP Sports.
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tầng Page chỉ thực hiện bố cục và gọi các Component giao diện.
 * - Hoàn toàn không chứa code logic hay React state/effect trực tiếp.
 */
export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}
    >
      {/* 0. Thanh thông tin định vị, email & mạng xã hội đầu trang (Desktop Client) */}
      <ClientTopBar />

      {/* 1. Hero Master Banner Slider */}
      <HeroBannerSlider />

      {/* 2. Featured Sports Banners (Bóng đá, Cầu lông, Karate) */}
      <HomeFeaturedSportsBanners />

      {/* 3. Featured Products Showcase (Sản phẩm nổi bật từ API) */}
      <FeaturedProducts />

      {/* 4. Quy Trình Mua Sắm Chuẩn Vận Động Viên (4 Bước Tiêu Chuẩn) */}
      <HomeShoppingSteps />

      {/* 5. Tinh Thần Thể Thao & Con Số Tự Hào (Brand Story & Rolling Stats) */}
      <HomeBrandStory />

      {/* 6. 24/7 Hotline & Contact Assistance Banner */}
      <HomeContactBannerSection />

      {/* 7. Câu Hỏi Thường Gặp (FAQ Accordion Tĩnh Hệ Thống) */}
      <HomeFaqSection />

      {/* 8. Membership Privileges & VIP Benefits (Hiển thị cho khách chưa đăng nhập) */}
      <MembershipBenefitsSection />
    </main>
  );
}
