import { useState, useEffect, useCallback } from 'react';
import { productController } from '../controllers/product-controller';
import { Category, Product } from '../types';

export const useCatalog = (initialCategorySlug?: string, initialKeyword?: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [keyword, setKeyword] = useState<string>(initialKeyword || '');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Nạp danh mục
  useEffect(() => {
    productController
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error('Lỗi khi tải danh mục:', err));
  }, []);

  // Nạp sản phẩm theo bộ lọc
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productController.getProducts({
        categorySlug: selectedCategory === 'all' ? undefined : selectedCategory,
        keyword: keyword.trim() || undefined,
        size: 30,
      });
      const items = res.data?.content || res.data || [];
      setProducts(items);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm catalog:', err);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, keyword]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectCategory = useCallback((slug: string) => {
    setSelectedCategory(slug);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setKeyword(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword('');
  }, []);

  return {
    categories,
    products,
    selectedCategory,
    keyword,
    loading,
    refreshing,
    onRefresh,
    handleSelectCategory,
    handleSearchChange,
    handleClearSearch,
  };
};
