import { useState, useEffect, useCallback } from 'react';
import { productController } from '../controllers/product-controller';
import { Category, Product } from '../types';

// Tìm ID danh mục theo slug trong cây phân cấp (Cấp 1 -> Cấp 2 -> Cấp 3)
const findCategoryIdBySlug = (list: Category[], slug: string): number | undefined => {
  for (const cat of list) {
    if (cat.slug === slug) return cat.id;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryIdBySlug(cat.children, slug);
      if (found !== undefined) return found;
    }
  }
  return undefined;
};

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

  // Nạp sản phẩm theo bộ lọc (truyền categoryId để Backend tự động gộp cả danh mục con Cấp 2/3)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const resolvedCatId =
        selectedCategory === 'all' ? undefined : findCategoryIdBySlug(categories, selectedCategory);
      const res = await productController.getProducts({
        categoryId: resolvedCatId,
        categorySlug:
          selectedCategory === 'all' || resolvedCatId !== undefined ? undefined : selectedCategory,
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
  }, [selectedCategory, keyword, categories]);

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
