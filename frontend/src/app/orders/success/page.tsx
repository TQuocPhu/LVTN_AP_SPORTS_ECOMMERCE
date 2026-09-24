import { Metadata } from 'next';
import { Suspense } from 'react';
import OrderSuccessContentUI from '@/components/customer/checkout/OrderSuccessContentUI';

export const metadata: Metadata = {
  title: 'Đặt Hàng Thành Công | AP Sports Enterprise',
  description: 'Trang thông báo đặt hàng thành công và thông tin đơn hàng AP Sports Enterprise.',
};

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <OrderSuccessContentUI />
    </Suspense>
  );
}
