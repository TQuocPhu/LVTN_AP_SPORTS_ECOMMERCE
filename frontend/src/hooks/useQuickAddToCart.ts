"use client";

import { useState, useEffect } from "react";
import { productController } from "@/controllers/product-controller";
import { Product, ProductDetail, ProductVariant } from "@/types/product";
import { useCart } from "@/context/CartContext";

export function useQuickAddToCart(
  product: Product,
  isOpen: boolean,
  onClose: () => void
) {
  const { addToCart } = useCart();
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(
    null
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch product detail when modal opens
  useEffect(() => {
    if (isOpen && !productDetail && product.variantCount > 0) {
      const fetchDetail = async () => {
        setIsLoadingDetail(true);
        try {
          const res = await productController.getProductBySlug(
            product.slug || String(product.id)
          );
          if (res.data) {
            setProductDetail(res.data);
            if (res.data.variants && res.data.variants.length > 0) {
              setSelectedVariant(res.data.variants[0]);
            }
          }
        } catch (error) {
          // Automatic API client toastr will handle the error message
          onClose();
        } finally {
          setIsLoadingDetail(false);
        }
      };
      fetchDetail();
    }
  }, [isOpen, product, productDetail, onClose]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setQuantity(1);
      setErrorMsg(null);
    }
  }, [isOpen]);

  const handleConfirmAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (product.variantCount > 0) {
      if (!selectedVariant) {
        setErrorMsg("Vui lòng chọn phân loại sản phẩm");
        return;
      }
      if (selectedVariant.status === "DISCONTINUED") {
        setErrorMsg("Phân loại hàng này đã ngừng kinh doanh, không thể thêm vào giỏ hàng");
        return;
      }
      setErrorMsg(null);
      await addToCart(product.id, selectedVariant.id, quantity);
    } else {
      await addToCart(product.id, null, quantity);
    }
    onClose();
  };

  return {
    productDetail,
    isLoadingDetail,
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    handleConfirmAddToCart,
    errorMsg,
    setErrorMsg
  };
}
