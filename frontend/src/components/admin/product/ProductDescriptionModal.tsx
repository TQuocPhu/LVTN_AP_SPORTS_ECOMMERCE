'use client';

import React from 'react';
import { ProductDetail } from '@/types/product';
import { X, FileText, Tag, Package, Image as ImageIcon } from 'lucide-react';

interface ProductDescriptionModalProps {
  product: ProductDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDescriptionModal({
  product,
  isOpen,
  onClose,
}: ProductDescriptionModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Chi Tiết Mô Tả Sản Phẩm
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {product.name}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Header Product Card */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {product.mainImage ? (
              <img
                src={product.mainImage}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                <ImageIcon className="w-8 h-8" />
              </div>
            )}
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-xs font-bold px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full inline-block">
                {product.primaryCategoryName || 'Danh mục'}
              </span>
              <h4 className="text-base font-bold text-slate-900 line-clamp-1">
                {product.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono">/{product.slug}</p>
            </div>
          </div>

          {/* Specifications Grid */}
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

          {/* HTML Description Content */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-500" /> Nội dung mô tả chi tiết
            </h4>
            {product.description ? (
              <div
                className="prose max-w-none text-slate-800 text-sm p-4 bg-slate-50 rounded-2xl border border-slate-200 leading-relaxed overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-sm text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-slate-200">
                Chưa có mô tả cho sản phẩm này.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
