import { Metadata } from 'next';
import SuppliersPageContentUI from '@/components/admin/suppliers/SuppliersPageContentUI';

export const metadata: Metadata = {
  title: 'Quản Lý Nhà Cung Cấp | AP Sports Admin',
  description: 'Danh sách và quản lý nhà cung cấp dụng cụ thể thao',
};

export default function SuppliersPage() {
  return <SuppliersPageContentUI />;
}
