import { Metadata } from 'next';
import { AdminReportsUI } from '@/components/admin/report/AdminReportsUI';

export const metadata: Metadata = {
  title: 'Báo Cáo & Thống Kê Enterprise - AP SPORTS Admin',
  description: 'Trung tâm phân tích chuyên sâu doanh thu, hiệu suất bán hàng nhân viên và tồn kho vận hành AP SPORTS',
};

export default function AdminReportsPage() {
  return <AdminReportsUI />;
}
