"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { productController } from "@/controllers/product-controller";

export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchFeatured() {
      try {
        setLoading(true);
        const res = await productController.getPublicProducts({
          page: 0,
          size: limit,
          sortBy: "createdAt",
          sortDir: "DESC",
        });
        if (isMounted && res.data?.content) {
          setProducts(res.data.content);
        }
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm nổi bật:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchFeatured();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { products, loading };
}
