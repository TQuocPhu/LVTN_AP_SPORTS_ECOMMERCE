import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ProductDetailContentUI from '@/components/customer/product-detail/ProductDetailContentUI';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const readableTitle = slug.replace(/-/g, ' ').toUpperCase();

  return {
    title: `${readableTitle} | AP Sports E-Commerce`,
    description: `Mua ngay ${readableTitle} chính hãng tại AP Sports E-Commerce với giá tốt nhất, bảo hành 12 tháng, đổi trả 7 ngày và giao hàng toàn quốc.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-12 text-slate-500 font-bold text-sm">
          Đang nạp thông tin chi tiết sản phẩm...
        </div>
      }
    >
      <ProductDetailContentUI slug={slug} />
    </Suspense>
  );
}
