import { Metadata } from 'next';
import LogisticsLoginForm from '@/components/demo/auth/LogisticsLoginForm';
import { DemoLogisticsAuthProvider } from '@/context/DemoLogisticsAuthContext';

export const metadata: Metadata = {
  title: 'Đăng Nhập GHN Logistics - AP SPORTS',
  description: 'Trang đăng nhập dành riêng cho hệ thống mô phỏng Bưu cục và Shipper GHN',
};

export default function DemoLogisticsLoginPage() {
  return (
    <DemoLogisticsAuthProvider>
      <LogisticsLoginForm />
    </DemoLogisticsAuthProvider>
  );
}
