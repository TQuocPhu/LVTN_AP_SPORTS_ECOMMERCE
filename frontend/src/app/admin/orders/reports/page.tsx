import { Metadata } from 'next';
import { AdminReportsUI } from '@/components/admin/report/AdminReportsUI';

export const metadata: Metadata = {
  title: 'Báo Cáo Doanh Số & Đối Soát Tài Chính - AP SPORTS Admin',
  description: 'Phân tích doanh thu, đối soát dòng tiền theo ngày và kênh thanh toán COD/VNPay AP SPORTS',
};

export default function AdminOrderReportsPage() {
  return <AdminReportsUI />;
}
