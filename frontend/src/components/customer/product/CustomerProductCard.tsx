'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { ShoppingBag, Eye, Star, Check, Heart } from 'lucide-react';
import { QuickAddToCartModal } from './QuickAddToCartModal';
import { ProductRatingStars } from '@/components/ui/ProductRatingStars';
import { useCustomerProductCard } from '@/hooks/useCustomerProductCard';

interface CustomerProductCardProps {
  product: Product;
}

/**
 * Component hiển thị Thẻ Sản Phẩm (Product Card) trên giao diện Khách hàng.
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Không chứa useState/useEffect hay logic tính toán trực tiếp.
 * - Gọi `useCustomerProductCard` hook để lấy dữ liệu hiển thị (bao gồm điểm đánh giá & số lượt đánh giá thực tế từ DB).
 * - Tương thích hoàn toàn với chế độ Sáng/Tối (Light/Dark Mode) của trang khách hàng.
 */
export function CustomerProductCard({ product }: CustomerProductCardProps) {
  const {
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
  } = useCustomerProductCard(product);

  return (
    <div className="ap-product-card group relative border hover:border-orange-500/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between h-full">
      {/* 1. Khung hình ảnh sản phẩm */}
      <div className="ap-product-card-img-bg relative aspect-square w-full overflow-hidden">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ color: 'var(--text-muted)' }}
          >
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs font-medium">Chưa có ảnh</span>
          </div>
        )}

        {/* Nhãn danh mục chính (Góc trên bên trái) */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-orange-400 font-bold text-[10px] uppercase tracking-wider backdrop-blur-md border border-slate-800 shadow-sm">
            {mainCategoryName}
          </span>
        </div>

        {/* Huy hiệu điểm đánh giá trung bình thực tế (Chỉ hiển thị nổi bật khi đã có đánh giá) */}
        {hasReviews && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/90 text-white text-[11px] font-bold shadow-sm backdrop-blur-md">
            <Star className="w-3 h-3 fill-current" />
            <span>{formattedRatingBadge}</span>
          </div>
        )}

        {/* Lớp phủ thao tác nhanh khi di chuột (Hover Overlay) */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4 z-20">
          <button
            onClick={handleWishlistToggle}
            className={`inline-flex items-center justify-center w-11 h-11 rounded-xl shadow-lg hover:scale-110 transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-white/90 text-slate-800 hover:text-rose-500'
            }`}
            title={isFavorite ? 'Đã thích' : 'Thêm vào yêu thích'}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-current text-white' : ''}`}
            />
          </button>

          <Link
            href={`/products/${product.slug || product.id}`}
            className="inline-flex items-center justify-center w-11 h-11 bg-white/90 text-slate-800 hover:text-orange-500 rounded-xl shadow-lg hover:scale-110 transition-all"
            title="Xem chi tiết"
          >
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* 2. Thông tin sản phẩm & Đánh giá thực tế */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="flex items-center gap-1 text-[11px]">
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Sẵn hàng</span>
            </span>
            <ProductRatingStars
              rating={ratingValue}
              totalReviews={reviewsCount}
              size="xs"
              showRatingValue={true}
              showCount={true}
            />
          </div>

          <Link
            href={`/products/${product.slug || product.id}`}
            className="font-bold text-sm group-hover:text-orange-500 line-clamp-2 transition-colors min-h-[2.5rem] block"
            style={{ color: 'var(--text-primary)' }}
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* 3. Giá bán & Nút thêm vào giỏ hàng */}
        <div
          className="pt-3 border-t flex items-center justify-between"
          style={{
            borderColor: 'var(--card-footer-border, var(--bg-border-subtle))',
          }}
        >
          <div>
            <div className="text-base font-extrabold text-orange-600 dark:text-orange-400">
              {formattedPrice}
            </div>
            {formattedOriginalPrice && (
              <div
                className="text-xs line-through -mt-0.5"
                style={{ color: 'var(--text-faint)' }}
              >
                {formattedOriginalPrice}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCartClick}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-3 py-2 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 text-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Thêm vào giỏ</span>
          </button>
        </div>
      </div>

      {/* Modal chọn nhanh biến thể sản phẩm */}
      <QuickAddToCartModal
        product={product}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
