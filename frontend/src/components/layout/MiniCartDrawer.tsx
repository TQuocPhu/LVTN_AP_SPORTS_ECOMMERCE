'use client';

import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/formatters';

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Component Slide-Over Mini Cart Drawer.
 * Trượt mượt từ bên phải ra, làm mờ nền (Backdrop Blur Overlay).
 * Hiển thị sản phẩm thực tế, đầy đủ thông tin biến thể (Size, Color),
 * bộ chọn sản phẩm thanh toán, nút tăng/giảm số lượng và tạm tính thời gian thực.
 */
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 1. Backdrop Blur Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* 2. Slide-Over Panel Trượt Bên Phải */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between animate-slide-left">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-black uppercase tracking-wider">GIỎ HÀNG CỦA BẠN</h2>
              <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full border border-orange-500/30">
                {totalItems}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader: Select All checkbox */}
          {items.length > 0 && (
            <div className="px-6 py-2.5 bg-slate-950/30 border-b border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300">
              <button
                onClick={toggleSelectAll}
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-orange-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>Chọn tất cả ({items.length})</span>
              </button>
              <span className="text-slate-400 font-medium">
                Đã chọn: <strong className="text-orange-400">{selectedItemIds.size}</strong>
              </span>
            </div>
          )}

          {/* Drawer Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-slate-800/60">
            {isLoading && items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium">Đang tải giỏ hàng...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">Giỏ hàng đang trống</h3>
                  <p className="text-xs text-slate-400 mt-1">Chưa có sản phẩm nào được thêm vào giỏ hàng của bạn.</p>
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
                      className="mt-6 text-slate-400 hover:text-orange-400 transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>

                    {/* Image */}
                    <Link
                      href={`/products/${item.productSlug}`}
                      onClick={onClose}
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 group-hover:border-orange-500/40 transition-colors"
                    >
                      <Image
                        src={item.mainImage || '/images/ap-sports_logo_no-back.png'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          onClick={onClose}
                          className="text-xs font-bold text-slate-100 line-clamp-1 hover:text-orange-400 transition-colors"
                        >
                          {item.productName}
                        </Link>

                        {/* Variant details (variantName or Size & Color) */}
                        {(item.variantName || item.size || item.color) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.variantName ? (
                              <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                {item.variantName}
                              </span>
                            ) : (
                              <>
                                {item.size && (
                                  <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                    Màu: {item.color}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Price & Quantity Stepper */}
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-xs font-extrabold text-orange-400">
                          {formatCurrency(item.subtotal)}
                        </span>

                        <div className="flex items-center space-x-2">
                          {/* Stepper */}
                          <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                              title="Giảm số lượng"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-6 text-center text-slate-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stockQuantity}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Tăng số lượng"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Trash button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
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
          <div className="p-5 border-t border-slate-800 bg-slate-950/90 space-y-3.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">
                Tạm tính ({selectedTotalItems} món đã chọn):
              </span>
              <span className="text-lg font-black text-orange-400">
                {formatCurrency(selectedTotalPrice)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Phí vận chuyển và ưu đãi giảm giá sẽ được tính ở bước thanh toán.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors border border-slate-700"
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
                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                }`}
              >
                <span>THANH TOÁN ({selectedItemIds.size})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
