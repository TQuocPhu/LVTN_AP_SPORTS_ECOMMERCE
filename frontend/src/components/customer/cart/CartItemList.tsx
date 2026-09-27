'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  CheckSquare,
  Square,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  Truck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatters';
import { CartItem } from '@/types/cart';

interface DeleteModalState {
  isOpen: boolean;
  type: 'single' | 'all';
  itemId?: number;
  itemName?: string;
}

function formatVariantLabel(item: CartItem): string | null {
  if (item.variantName) {
    if (item.variantName.startsWith('{')) {
      try {
        return Object.values(JSON.parse(item.variantName)).join(' | ');
      } catch {
        // ignore
      }
    }
    return item.variantName;
  }
  if (item.attributes) {
    try {
      return Object.values(JSON.parse(item.attributes)).join(' | ');
    } catch {
      // ignore
    }
  }
  const parts: string[] = [];
  if (item.size) parts.push(`Size: ${item.size}`);
  if (item.color) parts.push(`Màu: ${item.color}`);
  return parts.length > 0 ? parts.join(' | ') : null;
}

export default function CartItemList() {
  const {
    items,
    selectedItemIds,
    isAllSelected,
    toggleSelectItem,
    toggleSelectAll,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  // State quản lý Modal xác nhận xóa
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'single',
  });

  const handleOpenDeleteSingle = (itemId: number, itemName: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'single',
      itemId,
      itemName,
    });
  };

  const handleOpenDeleteAll = () => {
    setDeleteModal({
      isOpen: true,
      type: 'all',
      itemName: 'Tất cả sản phẩm trong giỏ hàng',
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.type === 'all') {
      await clearCart();
    } else if (deleteModal.type === 'single' && deleteModal.itemId) {
      await removeItem(deleteModal.itemId);
    }
    setDeleteModal({ isOpen: false, type: 'single' });
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-sm dark:shadow-xl transition-colors">
        <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-500 shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Giỏ hàng của bạn đang trống</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            Hãy khám phá thêm các thiết bị và dụng cụ thể thao cao cấp chính hãng từ AP Sports.
          </p>
        </div>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>TIẾP TỤC MUA SẮM</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header bar: Select All & Bulk Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-md transition-colors">
        <button
          onClick={toggleSelectAll}
          className="flex items-center space-x-3 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="w-5 h-5 text-orange-500" />
          ) : (
            <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          )}
          <span>Chọn tất cả ({items.length} sản phẩm)</span>
        </button>

        <button
          onClick={handleOpenDeleteAll}
          className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 flex items-center space-x-1.5 transition-colors bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60"
        >
          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      {/* Item List Cards */}
      <div className="space-y-3">
        {items.map((item) => {
          const isSelected = selectedItemIds.has(item.id);
          const isMaxStockReached = item.quantity >= item.stockQuantity;

          return (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col justify-between gap-4 shadow-sm dark:shadow-md ${
                isSelected
                  ? 'border-orange-500 dark:border-orange-500/40 bg-orange-50/20 dark:bg-slate-900/90 shadow-orange-500/5'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 min-w-0">
                  {/* Item Checkbox */}
                  <button
                    onClick={() => toggleSelectItem(item.id)}
                    className="text-slate-400 hover:text-orange-500 transition-colors shrink-0 mt-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>

                  {/* Product Thumbnail */}
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 group"
                  >
                    <Image
                      src={item.mainImage || '/images/ap-sports_logo_no-back.png'}
                      alt={item.productName}
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Product Details & Variants */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-1"
                    >
                      {item.productName}
                    </Link>

                    {/* Variant Details Chips & SKU */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.sku && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                          SKU: {item.sku}
                        </span>
                      )}

                      {formatVariantLabel(item) && (
                        <span className="text-xs font-semibold bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-500/20">
                          {formatVariantLabel(item)}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Badge */}
                    <div className="pt-0.5">
                      {item.stockQuantity <= 0 ? (
                        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2 py-0.5 rounded">
                          Tạm hết hàng
                        </span>
                      ) : item.stockQuantity <= 5 ? (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2 py-0.5 rounded">
                          Chỉ còn {item.stockQuantity} sản phẩm trong kho
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Sẵn sàng giao hàng
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls top: Trash button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDeleteSingle(item.id, item.productName)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom row: Store Commitments & Price / Stepper */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Store Commitments (Thông tin cam kết cửa hàng) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Chính hãng AP Sports
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/20">
                    <RefreshCw className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Đổi trả trong 7 ngày
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-500/20">
                    <Truck className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Giao hàng toàn quốc
                  </span>
                </div>

                {/* Pricing & Stepper Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Đơn giá: {formatCurrency(item.price)}</span>
                    <span className="text-base font-black text-orange-600 dark:text-orange-400">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={item.quantity <= 1 ? "Số lượng tối thiểu là 1" : "Giảm số lượng"}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold w-8 text-center text-slate-900 dark:text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={isMaxStockReached}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={isMaxStockReached ? "Đã đạt số lượng tồn kho tối đa" : "Tăng số lượng"}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Xác nhận xóa</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Thao tác này không thể hoàn tác</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {deleteModal.type === 'all' ? (
                <span>Bạn có chắc chắn muốn xóa <strong>tất cả sản phẩm</strong> trong giỏ hàng không?</span>
              ) : (
                <span>
                  Bạn có chắc chắn muốn xóa sản phẩm <strong className="text-orange-600 dark:text-orange-400">{deleteModal.itemName}</strong> khỏi giỏ hàng không?
                </span>
              )}
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, type: 'single' })}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white font-extrabold text-xs rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
