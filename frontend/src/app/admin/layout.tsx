import { Metadata } from 'next';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import AdminShell from '@/components/admin/layout/AdminShell';

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Trị - AP SPORTS',
  description: 'Trang Quản trị Hệ thống AP SPORTS Enterprise',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
