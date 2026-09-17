'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { productController } from '@/controllers/product-controller';
import { Product, ProductDetail, ProductVariant } from '@/types/product';
import { toast } from 'sonner';

export interface UseProductDetailReturn {
  product: ProductDetail | null;
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  currentImage: string;
  selectedColor: string | null;
  selectedSize: string | null;
  selectedVariant: ProductVariant | null;
  availableColors: string[];
  colorImageMap: Record<string, string>;
  availableSizes: string[];
  quantity: number;
  allImages: string[];
  effectivePrice: number;
  totalPrice: number;
  effectiveStock: number;
  isOutOfStock: boolean;
  handleColorSelect: (color: string) => void;
  handleSizeSelect: (size: string) => void;
  handleImageSelect: (imgUrl: string) => void;
  handleQuantityChange: (delta: number) => void;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
  refetch: () => void;
}

/**
 * Custom Hook quản lý State & Logic cho Trang Chi Tiết Sản Phẩm (7-layer Architecture)
 */
export function useProductDetail(slug: string): UseProductDetailReturn {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImage, setCurrentImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Fetch dữ liệu từ FE Controller
  const fetchProductDetail = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await productController.getProductBySlug(slug);
      if (res.data) {
        const prod = res.data;
        setProduct(prod);

        // Thiết lập danh sách tất cả ảnh (mainImage + images trong biến thể)
        const imageList: string[] = [];
        if (prod.mainImage) imageList.push(prod.mainImage);
        if (prod.allImages && prod.allImages.length > 0) {
          prod.allImages.forEach((img) => {
            if (img && !imageList.includes(img)) imageList.push(img);
          });
        }
        if (prod.variants) {
          prod.variants.forEach((v) => {
            if (v.images && v.images.length > 0) {
              v.images.forEach((vImg) => {
                if (vImg && !imageList.includes(vImg)) imageList.push(vImg);
              });
            }
          });
        }

        setCurrentImage(prod.mainImage || (imageList[0] ?? ''));

        // Tự động chọn Màu sắc và Kích thước đầu tiên nếu có biến thể
        if (prod.variants && prod.variants.length > 0) {
          const firstVariant = prod.variants[0];
          if (firstVariant.color) setSelectedColor(firstVariant.color);
          if (firstVariant.size) setSelectedSize(firstVariant.size);
          if (firstVariant.images && firstVariant.images.length > 0) {
            setCurrentImage(firstVariant.images[0]);
          }
        }

        // Lấy danh sách sản phẩm liên quan trong cùng danh mục
        try {
          const relatedRes = await productController.getPublicProducts({
            categoryId: prod.primaryCategoryId,
            page: 0,
            size: 5,
          });
          if (relatedRes.data?.content) {
            const filtered = relatedRes.data.content.filter((p) => p.id !== prod.id);
            setRelatedProducts(filtered.slice(0, 5));
          }
        } catch {
          // Bỏ qua lỗi sản phẩm liên quan
        }
      } else {
        setError('Không tìm thấy thông tin sản phẩm.');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  // Danh sách các Màu sắc có sẵn từ các biến thể
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const colors = new Set<string>();
    product.variants.forEach((v) => {
      if (v.color) colors.add(v.color);
    });
    return Array.from(colors);
  }, [product]);

  // Map giữa Màu sắc -> Ảnh swatch tương ứng
  const colorImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!product) return map;

    const fallbackImg = product.mainImage || '';

    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.color && !map[v.color]) {
          const vImg = v.images && v.images.length > 0 ? v.images[0] : fallbackImg;
          map[v.color] = vImg;
        }
      });
    }

    return map;
  }, [product]);

  // Danh sách các Kích thước có sẵn từ các biến thể
  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    const sizes = new Set<string>();
    product.variants.forEach((v) => {
      if (v.size) sizes.add(v.size);
    });
    return Array.from(sizes);
  }, [product]);

  // Biến thể hiện tại khớp với Màu & Size đang chọn
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;

    return (
      product.variants.find((v) => {
        const colorMatch = !selectedColor || v.color === selectedColor;
        const sizeMatch = !selectedSize || v.size === selectedSize;
        return colorMatch && sizeMatch;
      }) || product.variants[0]
    );
  }, [product, selectedColor, selectedSize]);

  // Tổng hợp tất cả ảnh khả dụng
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (product?.mainImage) list.push(product.mainImage);
    if (product?.allImages) {
      product.allImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (product?.variants) {
      product.variants.forEach((v) => {
        if (v.images) {
          v.images.forEach((vImg) => {
            if (vImg && !list.includes(vImg)) list.push(vImg);
          });
        }
      });
    }
    return list;
  }, [product]);

  // Giá hiển thị thực tế
  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;
  const totalPrice = effectivePrice * quantity;
  const effectiveStock = selectedVariant?.stockQuantity ?? product?.totalStock ?? 0;
  const isOutOfStock = effectiveStock <= 0 || product?.status === 'out_of_stock';

  // Chọn Màu sắc & Tự động đổi ảnh sang biến thể đó
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    if (!product?.variants) return;

    const matchedVar = product.variants.find((v) => v.color === color && (!selectedSize || v.size === selectedSize))
      || product.variants.find((v) => v.color === color);

    if (matchedVar && matchedVar.images && matchedVar.images.length > 0) {
      setCurrentImage(matchedVar.images[0]);
    }
  };

  // Chọn Kích thước
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  // Click vào Thumbnail chọn ảnh Preview
  const handleImageSelect = (imgUrl: string) => {
    setCurrentImage(imgUrl);
  };

  // Thay đổi số lượng mua
  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (effectiveStock > 0 && next > effectiveStock) {
        toast.warning(`Chỉ còn ${effectiveStock} sản phẩm trong kho.`);
        return effectiveStock;
      }
      return next;
    });
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('Sản phẩm tạm thời hết hàng!');
      return;
    }
    const colorText = selectedColor ? ` - Màu: ${selectedColor}` : '';
    const sizeText = selectedSize ? ` - Size: ${selectedSize}` : '';
    const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice);
    toast.success(`Đã thêm ${quantity} x "${product?.name}"${colorText}${sizeText} (${formattedTotal}) vào giỏ hàng!`);
  };

  // Mua ngay
  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error('Sản phẩm tạm thời hết hàng!');
      return;
    }
    handleAddToCart();
  };

  return {
    product,
    relatedProducts,
    isLoading,
    error,
    currentImage,
    selectedColor,
    selectedSize,
    selectedVariant,
    availableColors,
    colorImageMap,
    availableSizes,
    quantity,
    allImages,
    effectivePrice,
    totalPrice,
    effectiveStock,
    isOutOfStock,
    handleColorSelect,
    handleSizeSelect,
    handleImageSelect,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    refetch: fetchProductDetail,
  };
}
