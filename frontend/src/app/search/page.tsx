import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductSearchContentUI from '@/components/customer/search/ProductSearchContentUI';

export const metadata: Metadata = {
  title: 'Tìm Kiếm Sản Phẩm | AP Sports Store',
  description: 'Trang tìm kiếm dụng cụ bóng đá, vợt cầu lông, giày thể thao và thiết bị gym chính hãng AP Sports với thuật toán xếp hạng độ phù hợp thông minh.',
};

/**
 * Pure Router Page Wrapper cho Route `/search`
 * Tuân thủ nghiêm ngặt Clean Page Architecture:
 * - Khai báo Metadata SEO
 * - Bọc `<Suspense>` cho App Router SearchParams
 * - Render Component Presentational UI
 */
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-sm">Đang tải trang tìm kiếm...</span>
        </div>
      </div>
    }>
      <ProductSearchContentUI />
    </Suspense>
  );
}
