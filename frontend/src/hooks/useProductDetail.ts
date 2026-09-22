"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { productController } from "@/controllers/product-controller";
import { Product, ProductDetail, ProductVariant } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export interface UseProductDetailReturn {
  product: ProductDetail | null;
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  currentImage: string;
  selectedColor: string | null;
  selectedSize: string | null;
  selectedVariant: ProductVariant | null;
  attributeGroups: Record<string, string[]>;
  selectedAttributes: Record<string, string>;
  availableColors: string[];
  colorImageMap: Record<string, string>;
  availableSizes: string[];
  quantity: number;
  allImages: string[];
  effectivePrice: number;
  totalPrice: number;
  effectiveStock: number;
  isOutOfStock: boolean;
  handleAttributeSelect: (groupName: string, value: string) => void;
  handleColorSelect: (color: string) => void;
  handleSizeSelect: (size: string) => void;
  handleImageSelect: (imgUrl: string) => void;
  handleQuantityChange: (delta: number) => void;
  handleAddToCart: () => Promise<void>;
  handleBuyNow: () => Promise<void>;
  refetch: () => void;
}

export function parseVariantAttributes(
  v: ProductVariant,
): Record<string, string> {
  if (v.attributes) {
    try {
      const parsed = JSON.parse(v.attributes);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return parsed as Record<string, string>;
      }
    } catch {
      // If attributes is plain string text instead of JSON
      if (v.attributes.trim()) {
        return { "Thuộc tính": v.attributes };
      }
    }
  }
  const result: Record<string, string> = {};
  if (v.color) result["Màu sắc"] = v.color;
  if (v.size) {
    if (v.size.includes("|")) {
      const parts = v.size
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts[0]) result["Kích thước / Size"] = parts[0];
      if (parts[1]) result["Thuộc tính bổ sung"] = parts[1];
      for (let i = 2; i < parts.length; i++) {
        result[`Thuộc tính ${i + 1}`] = parts[i];
      }
    } else {
      result["Kích thước / Size"] = v.size;
    }
  }
  return result;
}

/**
 * Custom Hook quản lý State & Logic cho Trang Chi Tiết Sản Phẩm (7-layer Architecture)
 */
export function useProductDetail(slug: string): UseProductDetailReturn {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentImage, setCurrentImage] = useState<string>("");
  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string>
  >({});
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

        setCurrentImage(prod.mainImage || (imageList[0] ?? ""));

        // Tự động chọn thuộc tính đầu tiên nếu có biến thể
        if (prod.variants && prod.variants.length > 0) {
          const firstVariant = prod.variants[0];
          const initialAttr = parseVariantAttributes(firstVariant);
          setSelectedAttributes(initialAttr);
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
            const filtered = relatedRes.data.content.filter(
              (p) => p.id !== prod.id,
            );
            setRelatedProducts(filtered.slice(0, 5));
          }
        } catch {
          // Bỏ qua lỗi sản phẩm liên quan
        }
      } else {
        setError("Không tìm thấy thông tin sản phẩm.");
      }
    } catch {
      setError(
        "Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  // Trích xuất các nhóm thuộc tính động
  const attributeGroups = useMemo(() => {
    if (!product?.variants) return {};
    const groups: Record<string, string[]> = {};

    product.variants.forEach((v) => {
      const attrMap = parseVariantAttributes(v);
      Object.entries(attrMap).forEach(([groupName, val]) => {
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        if (!groups[groupName].includes(val)) {
          groups[groupName].push(val);
        }
      });
    });

    return groups;
  }, [product]);

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

    const fallbackImg = product.mainImage || "";

    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.color && !map[v.color]) {
          const vImg =
            v.images && v.images.length > 0 ? v.images[0] : fallbackImg;
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

  // Biến thể hiện tại khớp với thuộc tính đang chọn
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;

    return (
      product.variants.find((v) => {
        const attrMap = parseVariantAttributes(v);
        return Object.entries(selectedAttributes).every(
          ([groupName, val]) => attrMap[groupName] === val,
        );
      }) || product.variants[0]
    );
  }, [product, selectedAttributes]);

  // Tổng hợp danh sách ảnh khả dụng theo biến thể đang chọn
  const allImages = useMemo(() => {
    const list: string[] = [];

    // Nếu biến thể được chọn có bộ ảnh riêng, ưu tiên chỉ hiển thị bộ ảnh của biến thể đó
    if (
      selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
    ) {
      selectedVariant.images.forEach((vImg) => {
        if (vImg && !list.includes(vImg)) list.push(vImg);
      });
      return list;
    }

    // Fallback: nếu biến thể không có ảnh riêng, hiển thị mainImage + allImages của sản phẩm
    if (product?.mainImage) list.push(product.mainImage);
    if (product?.allImages) {
      product.allImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : [product?.mainImage || ""];
  }, [product, selectedVariant]);

  // Tự động cập nhật currentImage sang ảnh đầu tiên của biến thể khi đổi chọn
  useEffect(() => {
    if (allImages.length > 0 && !allImages.includes(currentImage)) {
      setCurrentImage(allImages[0]);
    }
  }, [allImages, currentImage]);

  // Giá hiển thị thực tế
  const effectivePrice = selectedVariant?.price ?? product?.price ?? 0;
  const totalPrice = effectivePrice * quantity;
  const effectiveStock =
    selectedVariant?.stockQuantity ?? product?.totalStock ?? 0;
  const isOutOfStock =
    effectiveStock <= 0 || product?.status === "out_of_stock";

  // Handler chọn thuộc tính bất kỳ theo Tên Nhóm & Giá trị
  const handleAttributeSelect = (groupName: string, value: string) => {
    setSelectedAttributes((prev) => {
      const next = { ...prev, [groupName]: value };
      if (groupName.toLowerCase().includes("màu")) {
        setSelectedColor(value);
      }
      if (
        groupName.toLowerCase().includes("size") ||
        groupName.toLowerCase().includes("kích thước")
      ) {
        setSelectedSize(value);
      }

      if (product?.variants) {
        const matchedVar = product.variants.find((v) => {
          const attrMap = parseVariantAttributes(v);
          return Object.entries(next).every(([k, val]) => attrMap[k] === val);
        });

        if (matchedVar && matchedVar.images && matchedVar.images.length > 0) {
          setCurrentImage(matchedVar.images[0]);
        }
      }
      return next;
    });
  };

  // Chọn Màu sắc & Tự động đổi ảnh sang biến thể đó
  const handleColorSelect = (color: string) => {
    handleAttributeSelect("Màu sắc", color);
  };

  // Chọn Kích thước
  const handleSizeSelect = (size: string) => {
    handleAttributeSelect("Kích thước / Size", size);
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
  const handleAddToCart = async () => {
    if (isOutOfStock || !product) {
      // toast.error('Sản phẩm tạm thời hết hàng!');
      return;
    }
    await addToCart(product.id, selectedVariant?.id, quantity);
  };

  // Mua ngay
  const handleBuyNow = async () => {
    if (isOutOfStock || !product) {
      // toast.error('Sản phẩm tạm thời hết hàng!');
      return;
    }
    const success = await addToCart(product.id, selectedVariant?.id, quantity);
    if (success) {
      window.location.href = "/cart";
    }
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
    attributeGroups,
    selectedAttributes,
    availableColors,
    colorImageMap,
    availableSizes,
    quantity,
    allImages,
    effectivePrice,
    totalPrice,
    effectiveStock,
    isOutOfStock,
    handleAttributeSelect,
    handleColorSelect,
    handleSizeSelect,
    handleImageSelect,
    handleQuantityChange,
    handleAddToCart,
    handleBuyNow,
    refetch: fetchProductDetail,
  };
}
