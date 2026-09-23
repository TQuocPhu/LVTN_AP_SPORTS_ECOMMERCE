import React from 'react';
import AdminProfileContentUI from '@/components/admin/profile/AdminProfileContentUI';

export const metadata = {
  title: 'Quản Lý Hồ Sơ Cá Nhân | AP Sports Admin',
  description: 'Cập nhật thông tin tài khoản, ảnh đại diện và thay đổi mật khẩu quản trị viên AP Sports.',
};

export default function AdminProfilePage() {
  return <AdminProfileContentUI />;
}
