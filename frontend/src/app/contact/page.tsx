import { Metadata } from 'next';
import { CustomerContactContentUI } from '@/components/customer/contact/CustomerContactContentUI';

export const metadata: Metadata = {
  title: 'Liên Hệ & Hỗ Trợ Khách Hàng | AP Sports Store',
  description: 'Liên hệ với Ban Quản Trị AP Sports Store qua Email, Hotline 0913193009 hoặc gửi thắc mắc trực tiếp qua biểu mẫu liên hệ trực tuyến.',
};

export default function ContactPage() {
  return <CustomerContactContentUI />;
}
