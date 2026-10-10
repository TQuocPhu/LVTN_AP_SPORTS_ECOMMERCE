import { Metadata } from 'next';
import { LogisticsDashboardContentUI } from '@/components/demo/LogisticsDashboardContentUI';
import { DemoLogisticsAuthProvider } from '@/context/DemoLogisticsAuthContext';

export const metadata: Metadata = {
  title: 'Cổng Logistics GHN - AP SPORTS',
  description: 'Trang chọn phân hệ ứng dụng Logistics GHN',
};

export default function LogisticsDashboardPage() {
  return (
    <DemoLogisticsAuthProvider>
      <LogisticsDashboardContentUI />
    </DemoLogisticsAuthProvider>
  );
}
