import { Metadata } from 'next';
import { CustomerOrdersContentUI } from '@/components/customer/order/CustomerOrdersContentUI';

export const metadata: Metadata = {
  title: 'Quản Lý Đơn Hàng Cá Nhân | AP Sports',
  description:
    'Xem danh sách đơn hàng đã đặt, theo dõi định vị lộ trình giao hàng bản đồ real-time, hủy đơn và quản lý trả hàng hoàn tiền tại AP Sports.',
};

export default function CustomerOrdersPage() {
  return <CustomerOrdersContentUI />;
}
