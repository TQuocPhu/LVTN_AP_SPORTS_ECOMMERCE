import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { productController } from '../controllers/product-controller';
import { reviewController } from '../controllers/review-controller';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const useProductDetail = (slug: string, initialProduct?: Product) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Reviews & Summary
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<any | null>(null);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);

  // Modals
  const [isSizeGuideVisible, setIsSizeGuideVisible] = useState<boolean>(false);
  const [isRestockModalVisible, setIsRestockModalVisible] = useState<boolean>(false);
  const [restockEmail, setRestockEmail] = useState<string>(user?.email || '');
  const [subscribingRestock, setSubscribingRestock] = useState<boolean>(false);

  // Nạp chi tiết sản phẩm
  useEffect(() => {
    let isMounted = true;
    productController
      .getProductBySlug(slug)
      .then((res) => {
        if (isMounted && res.data) {
          setProduct(res.data);
          // Auto select first variant if available
          if (res.data.variants && res.data.variants.length > 0) {
            const firstWithStock =
              res.data.variants.find((v) => v.stockQuantity > 0) || res.data.variants[0];
            if (firstWithStock.color) setSelectedColor(firstWithStock.color);
            if (firstWithStock.size) setSelectedSize(firstWithStock.size);
          }

          // Nạp dữ liệu đánh giá & thống kê đánh giá
          if (res.data.id) {
            setLoadingReviews(true);
            Promise.allSettled([
              reviewController.getProductReviews(res.data.id, 0, 10),
              reviewController.getProductReviewSummary(res.data.id),
            ]).then(([reviewsRes, summaryRes]) => {
              if (isMounted) {
                if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data) {
                  const rData = reviewsRes.value.data?.content || reviewsRes.value.data || [];
                  setReviews(rData);
                }
                if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
                  setReviewsSummary(summaryRes.value.data);
                }
                setLoadingReviews(false);
              }
            });
          }
        }
      })
      .catch((err) => console.error('Lỗi khi tải chi tiết sản phẩm:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Danh sách hình ảnh
  const images = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.thumbnail) list.push(product.thumbnail);
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (!list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

  // Phân loại Màu & Size
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const set = new Set<string>();
    product.variants.forEach((v) => {
      if (v.color) set.add(v.color);
    });
    return Array.from(set);
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    const set = new Set<string>();
    product.variants.forEach((v) => {
      if (v.size) set.add(v.size);
    });
    return Array.from(set);
  }, [product]);

  // Biến thể đang được chọn
  const currentVariant = useMemo<ProductVariant | null>(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return (
      product.variants.find((v) => {
        const matchColor = !selectedColor || v.color === selectedColor;
        const matchSize = !selectedSize || v.size === selectedSize;
        return matchColor && matchSize;
      }) || null
    );
  }, [product, selectedColor, selectedSize]);

  // Tồn kho & giá
  const currentStock = useMemo(() => {
    if (currentVariant) return currentVariant.stockQuantity;
    if (product?.variants && product.variants.length > 0) {
      return product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
    }
    return 10;
  }, [currentVariant, product]);

  const currentPrice = currentVariant?.price || product?.basePrice || 0;
  const currentOriginalPrice = currentVariant?.originalPrice || product?.originalPrice;
  const isOutOfStock = currentStock <= 0;

  // Thêm vào giỏ hàng
  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (isOutOfStock) {
      setIsRestockModalVisible(true);
      return;
    }

    await addToCart({
      id: `${product.id}-${currentVariant?.id || 0}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: currentVariant?.imageUrl || product.thumbnail,
      variantId: currentVariant?.id,
      variantSku: currentVariant?.sku,
      variantColor: currentVariant?.color,
      variantSize: currentVariant?.size,
      price: currentPrice,
      quantity: 1,
      stockQuantity: currentStock,
    });
    Alert.alert('Thành công', `Đã thêm "${product.name}" vào giỏ hàng!`);
  }, [product, currentVariant, isOutOfStock, currentPrice, currentStock, addToCart]);


  // Đăng ký báo hết hàng
  const handleSubscribeRestock = useCallback(async () => {
    if (!restockEmail.trim() || !restockEmail.includes('@')) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập địa chỉ email hợp lệ để nhận thông báo.');
      return;
    }

    try {
      setSubscribingRestock(true);
      const variantId = currentVariant?.id || (product?.variants && product.variants[0]?.id) || 0;
      await productController.subscribeRestock(variantId, restockEmail.trim());

      Alert.alert(
        'Đăng ký thành công! 🔔',
        `AP Sports sẽ tự động gửi email thông báo tới ${restockEmail} ngay khi sản phẩm này được nhập hàng về kho.`
      );
      setIsRestockModalVisible(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể đăng ký lúc này, vui lòng thử lại.');
    } finally {
      setSubscribingRestock(false);
    }
  }, [restockEmail, currentVariant, product]);

  return {
    product,
    loading,
    images,
    activeImageIndex,
    setActiveImageIndex,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    availableColors,
    availableSizes,
    currentVariant,
    currentStock,
    currentPrice,
    currentOriginalPrice,
    isOutOfStock,
    reviews,
    reviewsSummary,
    loadingReviews,
    isSizeGuideVisible,
    setIsSizeGuideVisible,
    isRestockModalVisible,
    setIsRestockModalVisible,
    restockEmail,
    setRestockEmail,
    subscribingRestock,
    handleAddToCart,
    handleSubscribeRestock,
  };
};
