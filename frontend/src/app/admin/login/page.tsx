import { Metadata } from 'next';
import AdminLoginForm from '@/components/admin/auth/AdminLoginForm';

export const metadata: Metadata = {
  title: 'Đăng Nhập Quản Trị - AP SPORTS',
  description: 'Trang đăng nhập dành riêng cho Ban quản trị và Nhân viên AP SPORTS',
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
