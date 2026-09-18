'use client';

import React from 'react';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { useWishlist } from '@/hooks/useWishlist';
import { WishlistEmptyState } from './WishlistEmptyState';
import { WishlistGrid } from './WishlistGrid';

/**
 * Main Shell Component cho Trang Danh Sách Sản Phẩm Yêu Thích (/wishlist)
 * Mô-đun hóa sạch 100% thành các sub-components độc lập:
 * 1. WishlistEmptyState: Giao diện khi danh sách trống
 * 2. WishlistGrid: Lưới chứa các sản phẩm đã yêu thích
 * 3. WishlistCard: Thẻ từng sản phẩm yêu thích kèm nút Xem sản phẩm & Xóa
 */
export default function WishlistPageContentUI() {
  const { wishlistItems, wishlistCount, isLoading, removeFromWishlist } = useWishlist();

  const handleRemove = async (productId: number) => {
    await removeFromWishlist(productId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* 1. Page Header Banner */}
      <PageHeaderBanner
        title="DANH SÁCH YÊU THÍCH"
        subtitle={`Bạn đang lưu ${wishlistCount} sản phẩm thể thao yêu thích`}
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Sản phẩm yêu thích' },
        ]}
      />

      {/* 2. Main Body Content */}
      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <WishlistEmptyState />
        ) : (
          <WishlistGrid
            items={wishlistItems}
            wishlistCount={wishlistCount}
            onRemove={handleRemove}
          />
        )}
      </main>
    </div>
  );
}
