'use client';

import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { ProductShowcaseSection } from '@/components/customer/home/ProductShowcaseSection';

/**
 * Khối hiển thị 8 sản phẩm nổi bật trên Trang chủ (TRANG THIẾT BỊ NỔI BẬT).
 * Lấy theo tiêu chí đơn hàng thành công + đánh giá tốt (tự động bù sản phẩm mới nhất nếu chưa đủ 8).
 */
export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts(8);

  return (
    <ProductShowcaseSection
      subtitle="SẢN PHẨM BÁN CHẠY & ĐÁNH GIÁ TỐT"
      title="TRANG THIẾT BỊ NỔI BẬT"
      viewAllHref="/products"
      emptyText="Chưa có sản phẩm nổi bật nào được cập nhật."
      products={products}
      loading={loading}
      accentColor="orange"
    />
  );
}
