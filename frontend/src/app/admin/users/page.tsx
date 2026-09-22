import { Metadata } from 'next';
import { AdminUsersContentUI } from '@/components/admin/users/AdminUsersContentUI';

export const metadata: Metadata = {
  title: 'Quản Lý Tài Khoản Người Dùng | AP Sports Admin',
  description: 'Trang quản trị danh sách tài khoản khách hàng, nhân viên và phân quyền hệ thống AP Sports.',
};

export default function AdminUsersPage() {
  return <AdminUsersContentUI />;
}
