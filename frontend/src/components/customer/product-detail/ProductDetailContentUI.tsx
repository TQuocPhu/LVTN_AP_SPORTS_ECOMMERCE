'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import { CustomerProductCard } from '@/components/customer/product/CustomerProductCard';
import { useProductDetail } from '@/hooks/useProductDetail';

// Import 5 Sub-components mô-đun hóa
import { ProductImageGallery } from './ProductImageGallery';
import { ProductMainInfo } from './ProductMainInfo';
import { ProductStickyBuyBox } from './ProductStickyBuyBox';
import { ProductDescriptionTab } from './ProductDescriptionTab';
import { ProductSpecificationsTab } from './ProductSpecificationsTab';

interface ProductDetailContentUIProps {
  slug: string;
}

/**
 * Main Shell Component cho Trang Chi Tiết Sản Phẩm (`/products/[slug]`)
 * Tách biệt 100% thành 5 Sub-components độc lập:
 * 1. ProductImageGallery: Gallery ảnh dọc cuộn chuẩn chống co bóp ảnh + Nút điều hướng Prev/Next thủ công đè lên ảnh
 * 2. ProductMainInfo: Tiêu đề, Đơn vị tính bên giá tiền, Swatch màu sắc dạng hình ảnh & Kích thước
 * 3. ProductStickyBuyBox: Box đặt hàng cố định bên phải với tổng tiền động theo số lượng & fix Nền tối cho Yêu thích
 * 4. ProductDescriptionTab: Mô tả chi tiết sản phẩm chữ lớn rõ ràng, fix Nền tối
 * 5. ProductSpecificationsTab: Bảng thông số kỹ thuật động (specifications) & cam kết chất lượng AP Sports
 */
export default function ProductDetailContentUI({ slug }: ProductDetailContentUIProps) {
  const {
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
  } = useProductDetail(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <PageHeaderBanner title="CHI TIẾT SẢN PHẨM" subtitle="Đang nạp thông tin..." breadcrumbs={[{ label: 'Sản phẩm', href: '/products' }, { label: 'Đang tải' }]} />
        <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl animate-pulse">
            <div className="lg:col-span-5 aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            <div className="lg:col-span-4 space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
            <div className="lg:col-span-3 h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <PageHeaderBanner title="KHÔNG TÌM THẤY SẢN PHẨM" breadcrumbs={[{ label: 'Sản phẩm', href: '/products' }, { label: 'Lỗi' }]} />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Sản Phẩm Không Tồn Tại
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error || 'Sản phẩm bạn đang tìm kiếm có thể đã ngưng kinh doanh hoặc đường dẫn không chính xác.'}
          </p>
          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 text-xs uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay Lại Danh Sách Sản Phẩm</span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const primaryCategory = product.primaryCategoryName || product.categories?.[0]?.name || 'Trang Thiết Bị Thể Thao';
  const productUnit = product.unit || 'sản phẩm';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header Banner */}
      <PageHeaderBanner
        title="CHI TIẾT SẢN PHẨM"
        subtitle={`Chính hãng AP Sports | Mã SKU: ${selectedVariant?.sku || product.slug}`}
        breadcrumbs={[
          { label: 'Sản phẩm', href: '/products' },
          { label: primaryCategory, href: '/products' },
          { label: 'Chi tiết sản phẩm' },
        ]}
      />

      <main className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-12">
        {/* ========================================================================= */}
        {/* 1. KHU VỰC HERO CHÍNH: KHUNG SHOWCASE SẢN PHẨM RỘNG (9 COLS) + SIDEBAR ĐẶT HÀNG (3 COLS) */}
        {/* ========================================================================= */}
        <section id="product-overview-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* KHUNG SHOWCASE SẢN PHẨM HỢP NHẤT RỘNG (GALLERY 7 COLS + THÔNG TIN 5 COLS) */}
          <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* GALLERY ẢNH SẢN PHẨM CỠ LỚN (7 COLS TRONG SHOWCASE) */}
            <div className="md:col-span-7">
              <ProductImageGallery
                productName={product.name}
                primaryCategory={primaryCategory}
                currentImage={currentImage}
                allImages={allImages}
                selectedColor={selectedColor}
                onImageSelect={handleImageSelect}
              />
            </div>

            {/* THÔNG TIN CHI TIẾT & BIẾN THỂ (5 COLS TRONG SHOWCASE) */}
            <div className="md:col-span-5">
              <ProductMainInfo
                product={product}
                primaryCategory={primaryCategory}
                selectedVariant={selectedVariant}
                effectivePrice={effectivePrice}
                attributeGroups={attributeGroups}
                selectedAttributes={selectedAttributes}
                availableColors={availableColors}
                colorImageMap={colorImageMap}
                selectedColor={selectedColor}
                availableSizes={availableSizes}
                selectedSize={selectedSize}
                onAttributeSelect={handleAttributeSelect}
                onColorSelect={handleColorSelect}
                onSizeSelect={handleSizeSelect}
              />
            </div>
          </div>

          {/* BOX ĐẶT HÀNG STICKY NHỎ GỌN (3 COLS SIDEBAR) */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <ProductStickyBuyBox
              productId={product.id}
              productName={product.name}
              productSlug={product.slug}
              mainImage={product.mainImage}
              effectivePrice={effectivePrice}
              primaryCategory={primaryCategory}
              totalPrice={totalPrice}
              effectiveStock={effectiveStock}
              isOutOfStock={isOutOfStock}
              quantity={quantity}
              unit={productUnit}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. MÔ TẢ SẢN PHẨM & BẢNG THÔNG SỐ KỸ THUẬT ĐỘNG (SPECIFICATIONS)          */}
        {/* ========================================================================= */}
        <section id="product-details-tabs" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <ProductDescriptionTab description={product.description} />
          </div>

          <div className="lg:col-span-5">
            <ProductSpecificationsTab
              specifications={product.specifications}
              unit={productUnit}
              categoryName={primaryCategory}
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. LƯỚI SẢN PHẨM TƯƠNG TỰ (RELATED PRODUCTS GRID - 5 CARDS / ROW)         */}
        {/* ========================================================================= */}
        {relatedProducts.length > 0 && (
          <section id="related-products-section" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Sản Phẩm Tương Tự Có Thể Bạn Thích
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gợi ý từ danh mục {primaryCategory} dành cho bạn
                </p>
              </div>

              <Link
                href="/products"
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                Xem tất cả
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedProducts.map((relProd) => (
                <CustomerProductCard key={relProd.id} product={relProd} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
