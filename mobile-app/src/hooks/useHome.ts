import { useState, useEffect, useCallback } from 'react';
import { productController } from '../controllers/product-controller';
import { Category, Product } from '../types';

export const useHome = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        productController.getCategories(),
        productController.getFeaturedProducts(8),
      ]);
      setCategories(catRes.data || []);
      setFeaturedProducts(prodRes.data || []);
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu trang chủ:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  return {
    categories,
    featuredProducts,
    loading,
    refreshing,
    onRefresh,
  };
};
