'use client';

import React from 'react';
import { ProductDetail } from '@/types/product';
import { X, Layers, Tag, Box, Image as ImageIcon } from 'lucide-react';

interface ProductVariantDrawerProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductVariantDrawer({ product, isOpen, onClose }: ProductVariantDrawerProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-3xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Biến Thể Sản Phẩm
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {product.name} ({product.variants?.length || 0} biến thể)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Product Info Summary */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            {product.mainImage ? (
              <img
                src={product.mainImage}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="inline-block text-xs font-bold px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                {product.primaryCategoryName || 'Danh mục'}
              </span>
              <h4 className="text-base font-bold text-slate-900 break-words">
                {product.name}
              </h4>
              <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                <span>
                  Giá gốc:{' '}
                  <strong className="text-slate-900 font-bold">
                    {product.price?.toLocaleString('vi-VN')} đ
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Tổng kho:{' '}
                  <strong className="text-emerald-600 font-bold">
                    {product.totalStock} {product.unit}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Specifications Preview */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-orange-500" /> Thông số kỹ thuật
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/70"
                  >
                    <span className="text-slate-400 block font-medium mb-0.5">{key}</span>
                    <span className="font-bold text-slate-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-orange-500" /> Danh sách biến thể ({product.variants?.length || 0})
            </h4>

            {product.variants?.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
                Sản phẩm này chưa có biến thể nào.
              </div>
            ) : (
              <div className="space-y-3">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id || variant.sku}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
                  >
                    {/* Header line: SKU and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg border border-slate-200 inline-block break-all">
                          {variant.sku}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                        {variant.color && (
                          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200/60">
                            Màu: {variant.color}
                          </span>
                        )}
                        <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200/60">
                          Size: {variant.size}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/60">
                          Tồn kho: {variant.stockQuantity}
                        </span>
                      </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-3">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block mb-0.5">Giá bán niêm yết:</span>
                        <strong className="text-slate-900 text-sm font-bold">
                          {variant.price?.toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block mb-0.5">Giá nhập vốn:</span>
                        <strong className="text-slate-600 text-sm font-bold">
                          {variant.costPrice?.toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                    </div>

                    {/* Variant Images Gallery */}
                    {variant.images && variant.images.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                          Hình ảnh biến thể ({variant.images.length} ảnh):
                        </span>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {variant.images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`${variant.sku}-${i}`}
                              className="w-14 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0 shadow-sm"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
