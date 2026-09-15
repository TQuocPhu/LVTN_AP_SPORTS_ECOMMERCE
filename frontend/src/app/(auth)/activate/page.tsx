import { Metadata } from 'next';
import { Suspense } from 'react';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import ActivateAccount from '@/components/features/auth/ActivateAccount';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kích Hoạt Tài Khoản | AP Sports Enterprise',
  description: 'Trang kích hoạt tài khoản thành viên hệ thống thương mại điện tử AP Sports.',
};

/**
 * Clean Page Router Kích Hoạt Tài Khoản (/activate).
 * Bắt buộc tuân thủ Clean Page Rule: Chỉ khai báo Metadata SEO, nhúng Header Banner và Form Component.
 */
export default function ActivatePage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header Banner Trang Phụ với Dynamic Breadcrumb */}
      <PageHeaderBanner
        title="KÍCH HOẠT TÀI KHOẢN"
        subtitle="Hệ thống đang tiến hành xác thực tài khoản của bạn"
        breadcrumbs={[{ label: 'Kích hoạt tài khoản' }]}
      />

      {/* Main Container với Suspense Boundary cho useSearchParams */}
      <section className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        <Suspense
          fallback={
            <div className="flex items-center justify-center space-x-2 text-white">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span>Đang tải...</span>
            </div>
          }
        >
          <ActivateAccount />
        </Suspense>
      </section>
    </main>
  );
}
