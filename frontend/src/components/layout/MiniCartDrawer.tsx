'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatters';

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MiniCartDeleteModal {
  isOpen: boolean;
  itemId?: number;
  itemName?: string;
}

export default function MiniCartDrawer({ isOpen, onClose }: MiniCartDrawerProps) {
  const {
    items,
    totalItems,
    selectedItemIds,
    selectedTotalPrice,
    selectedTotalItems,
    isAllSelected,
    toggleSelectItem,
    toggleSelectAll,
    updateQuantity,
    removeItem,
    isLoading,
  } = useCart();

  const [deleteModal, setDeleteModal] = useState<MiniCartDeleteModal>({ isOpen: false });

  if (!isOpen) return null;

  const handleOpenDelete = (itemId: number, itemName: string) => {
    setDeleteModal({ isOpen: true, itemId, itemName });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.itemId) {
      await removeItem(deleteModal.itemId);
    }
    setDeleteModal({ isOpen: false });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 1. Backdrop Blur Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* 2. Slide-Over Panel Trượt Bên Phải */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col justify-between animate-slide-left transition-colors">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">GIỎ HÀNG CỦA BẠN</h2>
              <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-300 dark:border-orange-500/30">
                {totalItems}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader: Select All checkbox */}
          {items.length > 0 && (
            <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <button
                onClick={toggleSelectAll}
                className="flex items-center space-x-2 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-orange-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
                <span>Chọn tất cả ({items.length})</span>
              </button>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Đã chọn: <strong className="text-orange-600 dark:text-orange-400">{selectedItemIds.size}</strong>
              </span>
            </div>
          )}

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading && items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium">Đang tải giỏ hàng...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Giỏ hàng đang trống</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Chưa có sản phẩm nào được thêm vào giỏ hàng của bạn.</p>
                </div>
                <Link
                  href="/products"
                  onClick={onClose}
                  className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
                >
                  KHÁM PHÁ SẢN PHẨM NGAY
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const isSelected = selectedItemIds.has(item.id);
                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex space-x-3 items-start group">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelectItem(item.id)}
                      className="mt-6 text-slate-400 hover:text-orange-500 transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    {/* Image */}
                    <Link
                      href={`/products/${item.productSlug}`}
                      onClick={onClose}
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 group-hover:border-orange-500/40 transition-colors"
                    >
                      <Image
                        src={item.mainImage || '/images/ap-sports_logo_no-back.png'}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={onClose}
                          className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                          {item.productName}
                        </Link>

                        {/* Variant details */}
                        {(() => {
                          const displayVariant = (() => {
                            if (item.variantName) {
                              if (item.variantName.startsWith('{')) {
                                try {
                                  return Object.values(JSON.parse(item.variantName)).join(' | ');
                                } catch {
                                  // Ignore
                                }
                              }
                              return item.variantName;
                            }
                            if (item.attributes) {
                              try {
                                return Object.values(JSON.parse(item.attributes)).join(' | ');
                              } catch {
                                // Ignore
                              }
                            }
                            const parts: string[] = [];
                            if (item.size) parts.push(`Size: ${item.size}`);
                            if (item.color) parts.push(`Màu: ${item.color}`);
                            return parts.join(' | ');
                          })();

                          if (!displayVariant) return null;
                          return (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[10px] font-semibold bg-orange-50 dark:bg-slate-800 text-orange-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-orange-200 dark:border-slate-700">
                                {displayVariant}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Price & Quantity Stepper */}
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400">
                          {formatCurrency(item.subtotal)}
                        </span>

                        <div className="flex items-center space-x-2">
                          {/* Stepper */}
                          <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title={item.quantity <= 1 ? "Số lượng tối thiểu là 1" : "Giảm số lượng"}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-6 text-center text-slate-800 dark:text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stockQuantity}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Tăng số lượng"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Trash button */}
                          <button
                            onClick={() => handleOpenDelete(item.id, item.productName)}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                            title="Xóa mặt hàng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 space-y-3.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Tạm tính ({selectedTotalItems} món đã chọn):
              </span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-400">
                {formatCurrency(selectedTotalPrice)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-500">
              Phí vận chuyển và ưu đãi giảm giá sẽ được tính ở bước thanh toán.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors border border-slate-300 dark:border-slate-700"
              >
                XEM GIỎ HÀNG
              </Link>
              <Link
                href={selectedItemIds.size > 0 ? "/checkout" : "#"}
                onClick={(e) => {
                  if (selectedItemIds.size === 0) {
                    e.preventDefault();
                  } else {
                    onClose();
                  }
                }}
                className={`w-full text-center font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-1 ${
                  selectedItemIds.size > 0
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/25 cursor-pointer"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                }`}
              >
                <span>THANH TOÁN ({selectedItemIds.size})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Xác nhận xóa</h3>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false })}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-orange-600 dark:text-orange-400">{deleteModal.itemName}</strong> khỏi giỏ hàng không?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false })}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-red-500/20"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
