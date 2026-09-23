import { Metadata } from 'next';
import CheckoutContentUI from '@/components/customer/checkout/CheckoutContentUI';

export const metadata: Metadata = {
  title: 'Đặt Hàng & Thanh Toán | AP Sports Enterprise',
  description:
    'Trang đặt hàng và thanh toán chính thức của AP Sports Enterprise. Hỗ trợ giao hàng GHN GPS 63 tỉnh thành, thanh toán COD và VNPay bảo mật.',
};

export default function CheckoutPage() {
  return <CheckoutContentUI />;
}
