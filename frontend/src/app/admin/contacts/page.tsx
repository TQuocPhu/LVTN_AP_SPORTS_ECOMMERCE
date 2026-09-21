import { Metadata } from 'next';
import { AdminContactsContentUI } from '@/components/admin/contacts/AdminContactsContentUI';

export const metadata: Metadata = {
  title: 'Quản Lý Liên Hệ & Thắc Mắc Khách Hàng | AP Sports Admin',
  description: 'Trung tâm tiếp nhận và phản hồi thắc mắc khách hàng qua Email cho hệ thống AP Sports Store.',
};

export default function AdminContactsPage() {
  return <AdminContactsContentUI />;
}
