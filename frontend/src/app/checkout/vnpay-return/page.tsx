import { Metadata } from 'next';
import { Suspense } from 'react';
import VNPayReturnContentUI from '@/components/customer/checkout/VNPayReturnContentUI';

export const metadata: Metadata = {
  title: 'Kết Quả Thanh Toán VNPay | AP Sports Enterprise',
  description: 'Trang kết quả thanh toán trực tuyến cổng VNPay Sandbox của AP Sports Enterprise.',
};

export default function VNPayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <VNPayReturnContentUI />
    </Suspense>
  );
}
