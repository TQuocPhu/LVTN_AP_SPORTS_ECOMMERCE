'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Product } from '@/types/product';
import { useWishlist } from '@/hooks/useWishlist';

/**
 * Custom Hook quản lý trạng thái và nghiệp vụ giao diện của Thẻ Sản Phẩm Khách Hàng (CustomerProductCard).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tách toàn bộ useState, định dạng tiền tệ, tính toán sao đánh giá thực tế và sự kiện tương tác ra khỏi Component UI.
 */
export function useCustomerProductCard(product: Product) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  // Quản lý trạng thái đóng/mở Modal thêm nhanh vào giỏ hàng
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Định dạng giá bán hiện tại sang VNĐ
  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(product.price);
  }, [product.price]);

  // Định dạng giá gốc (nếu có) sang VNĐ
  const formattedOriginalPrice = useMemo(() => {
    if (!product.originalPrice) return null;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(product.originalPrice);
  }, [product.originalPrice]);

  // Tên danh mục chính hiển thị trên nhãn góc trái ảnh sản phẩm
  const mainCategoryName = useMemo(() => {
    return (
      product.primaryCategoryName ||
      product.categories?.[0]?.name ||
      'AP Sports'
    );
  }, [product.primaryCategoryName, product.categories]);

  // Số lượng đánh giá đã duyệt thực tế từ Backend (mặc định là 0 nếu chưa có đánh giá)
  const reviewsCount = useMemo(() => {
    return typeof product.reviewsCount === 'number' && product.reviewsCount >= 0
      ? product.reviewsCount
      : 0;
  }, [product.reviewsCount]);

  // Điểm trung bình đánh giá thực tế từ Backend (mặc định 0.0 nếu chưa có đánh giá)
  const ratingValue = useMemo(() => {
    if (reviewsCount === 0) return 0;
    return typeof product.rating === 'number' && product.rating >= 0
      ? Math.round(product.rating * 10) / 10
      : 0;
  }, [product.rating, reviewsCount]);

  const hasReviews = reviewsCount > 0;
  const formattedRatingBadge = useMemo(() => ratingValue.toFixed(1), [ratingValue]);

  // Mở Modal chọn biến thể để thêm vào giỏ hàng
  const handleAddToCartClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  }, []);

  // Đóng Modal thêm nhanh vào giỏ hàng
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Thêm/xóa sản phẩm khỏi danh sách Yêu thích (Wishlist)
  const handleWishlistToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await toggleWishlist(product.id, {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        mainImage: product.mainImage,
        price: product.price,
        unit: product.unit,
        primaryCategoryName: mainCategoryName,
      });
    },
    [toggleWishlist, product, mainCategoryName]
  );

  return {
    isFavorite,
    isModalOpen,
    formattedPrice,
    formattedOriginalPrice,
    mainCategoryName,
    ratingValue,
    reviewsCount,
    hasReviews,
    formattedRatingBadge,
    handleAddToCartClick,
    handleCloseModal,
    handleWishlistToggle,
  };
}

