import type { Metadata } from 'next';
import CustomerCartContentUI from '@/components/customer/cart/CustomerCartContentUI';

export const metadata: Metadata = {
  title: 'Giỏ Hàng Của Bạn | AP Sports Store',
  description: 'Quản lý các mặt hàng trong giỏ, chọn sản phẩm và thanh toán thiết bị thể thao chính hãng tại AP Sports.',
  openGraph: {
    title: 'Giỏ Hàng Của Bạn | AP Sports Store',
    description: 'Quản lý các mặt hàng trong giỏ, chọn sản phẩm và thanh toán thiết bị thể thao chính hãng tại AP Sports.',
  },
};

export default function CartPage() {
  return <CustomerCartContentUI />;
}
