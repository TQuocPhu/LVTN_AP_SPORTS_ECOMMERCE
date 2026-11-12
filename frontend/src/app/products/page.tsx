import React, { Suspense } from 'react';
import { CustomerProductsContentUI } from '@/components/customer/product/CustomerProductsContentUI';

/**
 * Trang Danh sách Sản phẩm của Khách hàng (`/products`).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tầng Page chỉ thực hiện bọc `<Suspense>` và gọi Component giao diện `CustomerProductsContentUI`.
 * - Hoàn toàn không chứa code logic hay React state/effect trực tiếp.
 */
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
              Đang tải danh sách sản phẩm...
            </span>
          </div>
        </div>
      }
    >
      <CustomerProductsContentUI />
    </Suspense>
  );
}
