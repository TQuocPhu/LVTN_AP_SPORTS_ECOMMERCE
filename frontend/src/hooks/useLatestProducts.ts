'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { productController } from '@/controllers/product-controller';

/**
 * Hook lấy danh sách trang thiết bị mới nhất (sắp xếp theo thời gian tạo mới nhất)
 * cho khối "TRANG THIẾT BỊ MỚI NHẤT" trên Trang chủ.
 */
export function useLatestProducts(limit = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLatest() {
      try {
        setLoading(true);
        const res = await productController.getPublicProducts({
          page: 0,
          size: limit,
          sortBy: 'createdAt',
          sortDir: 'DESC',
        });
        if (isMounted && res.data?.content) {
          setProducts(res.data.content);
        }
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm mới nhất:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLatest();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { products, loading };
}
