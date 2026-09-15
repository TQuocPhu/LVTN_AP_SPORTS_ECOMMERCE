import { Metadata } from 'next';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import LoginForm from '@/components/features/auth/LoginForm';
import AuthLayoutWrapper from '@/components/features/auth/AuthLayoutWrapper';

export const metadata: Metadata = {
  title: 'Đăng Nhập Tài Khoản | AP Sports Enterprise',
  description: 'Đăng nhập vào hệ thống AP Sports để quản lý đơn hàng và trải nghiệm mua sắm thể thao.',
};

/**
 * Clean Page Router Đăng Nhập Tài Khoản (/login).
 * Bắt buộc tuân thủ Clean Page Rule: Chỉ khai báo Metadata SEO, nhúng Header Banner và Layout Wrapper.
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header Banner Trang Phụ với Dynamic Breadcrumb */}
      <PageHeaderBanner
        title="ĐĂNG NHẬP HỆ THỐNG"
        subtitle="Vui lòng nhập thông tin tài khoản AP Sports của bạn để tiếp tục"
        breadcrumbs={[{ label: 'Đăng nhập' }]}
      />

      {/* Main Split Layout: Bên trái Banner Mua Sắm Nhanh Chóng Minh Bạch, bên phải Form Đăng Nhập */}
      <section className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <AuthLayoutWrapper
          bannerImage="/images/banners/fast_transparent_shopping_banner.png"
          bannerAlt="Mua sắm thuận tiện nhanh chóng và minh bạch AP Sports"
        >
          <LoginForm />
        </AuthLayoutWrapper>
      </section>
    </main>
  );
}
