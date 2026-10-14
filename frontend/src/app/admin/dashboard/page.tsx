import { Metadata } from 'next';
import { AdminDashboardUI } from '@/components/admin/dashboard/AdminDashboardUI';

export const metadata: Metadata = {
  title: 'Tổng Quan (Dashboard) - AP SPORTS Admin',
  description: 'Trang tổng quan chỉ huy & phân tích BI hệ thống AP SPORTS',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardPage() {
  return <AdminDashboardUI />;
}
