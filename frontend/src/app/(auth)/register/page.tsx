import { Metadata } from 'next';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import RegisterForm from '@/components/features/auth/RegisterForm';
import AuthLayoutWrapper from '@/components/features/auth/AuthLayoutWrapper';

export const metadata: Metadata = {
  title: 'Đăng Ký Tài Khoản | AP Sports Enterprise',
  description: 'Đăng ký tài khoản AP Sports để mua sắm dụng cụ bóng đá và trang thiết bị thể thao chính hãng.',
};

/**
 * Clean Page Router Đăng Ký Tài Khoản (/register).
 * Bắt buộc tuân thủ Clean Page Rule: Chỉ khai báo Metadata SEO, nhúng Header Banner và Layout Wrapper.
 */
export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header Banner Trang Phụ với Dynamic Breadcrumb */}
      <PageHeaderBanner
        title="ĐĂNG KÝ TÀI KHOẢN"
        subtitle="Trở thành thành viên của AP Sports để trải nghiệm dịch vụ mua sắm thể thao cao cấp"
        breadcrumbs={[{ label: 'Đăng ký tài khoản' }]}
      />

      {/* Main Split Layout: Bên trái Banner Đăng ký VIP Member, bên phải Form Đăng ký */}
      <section className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <AuthLayoutWrapper
          bannerImage="/images/banners/membership_benefits_banner.png"
          bannerAlt="Trở thành thành viên VIP AP Sports"
        >
          <RegisterForm />
        </AuthLayoutWrapper>
      </section>
    </main>
  );
}
