import { Metadata } from 'next';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { CustomerNotificationsPageShell } from '@/components/customer/notification/CustomerNotificationsPageShell';

export const metadata: Metadata = {
  title: 'Thông Báo Của Bạn | AP Sports',
  description:
    'Theo dõi cập nhật đơn hàng, vận chuyển GHN, phản hồi đánh giá và các thông báo mới nhất từ AP Sports.',
};

export default function NotificationsPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* ── Header Banner chuẩn đồng bộ với layout chung ── */}
      <PageHeaderBanner
        title="THÔNG BÁO CỦA BẠN"
        subtitle="Trung tâm cập nhật tiến trình đơn hàng, hành trình giao vận GHN và thông tin tài khoản"
        breadcrumbs={[{ label: 'Thông báo' }]}
      />

      {/* ── Khu vực nội dung chính ── */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CustomerNotificationsPageShell />
        </div>
      </div>
    </div>
  );
}
