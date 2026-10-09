"use client";

import React from "react";
import Image from "next/image";
import { X, Loader2, Minus, Plus } from "lucide-react";
import { Product } from "@/types/product";
import { useQuickAddToCart } from "@/hooks/useQuickAddToCart";
import { parseVariantAttributes } from "@/hooks/useProductDetail";
import { toast } from "sonner";

interface QuickAddToCartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddToCartModal({
  product,
  isOpen,
  onClose,
}: QuickAddToCartModalProps) {
  const {
    productDetail,
    isLoadingDetail,
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    handleConfirmAddToCart,
    errorMsg,
    setErrorMsg
  } = useQuickAddToCart(product, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Thêm vào giỏ hàng
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-rose-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative flex-shrink-0">
              <Image
                src={selectedVariant?.images?.[0] || product.mainImage || ""}
                alt={product.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">
                {product.name}
              </h4>
              <div className="text-orange-600 dark:text-orange-400 font-extrabold text-base">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  selectedVariant ? selectedVariant.price : product.price
                )}
              </div>
              {selectedVariant && (
                <div className="text-xs text-slate-500 mt-1">
                  Kho: {selectedVariant.stockQuantity} | Mã:{" "}
                  {selectedVariant.sku}
                </div>
              )}
              {!selectedVariant && product.variantCount === 0 && (
                <div className="text-xs text-slate-500 mt-1">
                  Kho: {product.totalStock}
                </div>
              )}
            </div>
          </div>

          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-6 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-orange-500" />
              <span className="text-xs">Đang tải thông tin...</span>
            </div>
          ) : (
            <>
              {/* Variant Selection */}
              {productDetail &&
                productDetail.variants &&
                productDetail.variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Chọn phân loại:
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                      {productDetail.variants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVariant(variant);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          className={`px-3 py-2 border rounded-xl text-xs font-medium transition-all ${
                            selectedVariant?.id === variant.id
                              ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-400 shadow-sm"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-orange-300 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {(variant.variantName ? variant.variantName.replace(/ \| /g, " - ") : Object.values(parseVariantAttributes(variant)).join(" - ")) || `Biến thể ${variant.sku}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Quantity Selection */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Số lượng:
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuantity((q) => Math.max(1, q - 1));
                      }}
                      className="p-2 text-slate-500 hover:text-orange-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const maxStock = selectedVariant
                          ? selectedVariant.stockQuantity
                          : product.totalStock;
                        if (quantity < maxStock) setQuantity((q) => q + 1);
                        else
                          toast.warning(
                            `Chỉ còn ${maxStock} sản phẩm trong kho`
                          );
                      }}
                      className="p-2 text-slate-500 hover:text-orange-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Validation Error Message */}
        {errorMsg && (
          <div className="px-4 pb-2 text-xs font-semibold text-rose-500 text-center animate-in slide-in-from-top-1">
            * {errorMsg}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmAddToCart}
            disabled={
              isLoadingDetail || (product.variantCount > 0 && !selectedVariant)
            }
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Xác nhận thêm
          </button>
        </div>
      </div>
    </div>
  );
}
