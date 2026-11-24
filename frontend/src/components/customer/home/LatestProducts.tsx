'use client';

import { useLatestProducts } from '@/hooks/useLatestProducts';
import { ProductShowcaseSection } from '@/components/customer/home/ProductShowcaseSection';

/**
 * Khối hiển thị 8 sản phẩm mới nhất trên Trang chủ (TRANG THIẾT BỊ MỚI NHẤT).
 * Tuân thủ kiến trúc Layer Architecture: chỉ gọi hook `useLatestProducts` và render component Pure UI `ProductShowcaseSection`.
 */
export default function LatestProducts() {
  const { products, loading } = useLatestProducts(8);

  return (
    <ProductShowcaseSection
      subtitle="HÀNG MỚI VỀ CẬP NHẬT LIÊN TỤC"
      title="TRANG THIẾT BỊ MỚI NHẤT"
      viewAllHref="/products?sortBy=createdAt&sortDir=DESC"
      emptyText="Chưa có sản phẩm mới nào được cập nhật."
      products={products}
      loading={loading}
      accentColor="emerald"
    />
  );
}
