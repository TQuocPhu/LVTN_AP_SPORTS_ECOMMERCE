'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Package, Tag, Check, AlertCircle, Search, ChevronDown } from 'lucide-react';
import { InventoryAuditRequest } from '@/types/inventory';
import { Product, ProductVariant } from '@/types/product';
import { adminProductController } from '@/controllers/admin-product-controller';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryAuditRequest) => Promise<unknown>;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
}: StockAdjustmentModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Search Combobox State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const [actualQuantity, setActualQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('Kiểm kê định kỳ');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingProducts(true);
      adminProductController
        .getProducts({ size: 200 })
        .then((res) => {
          if (res.data?.content) {
            setProducts(res.data.content);
          }
        })
        .finally(() => setLoadingProducts(false));
    } else {
      setSearchQuery('');
      setIsDropdownOpen(false);
      setSelectedProductId(null);
      setSelectedProduct(null);
      setSelectedVariantId(null);
      setSelectedVariant(null);
      setActualQuantity(0);
      setReason('Kiểm kê định kỳ');
    }
  }, [isOpen]);

  const handleProductSelect = async (prod: Product) => {
    setSelectedProductId(prod.id);
    setSelectedProduct(prod);
    setSearchQuery(prod.name);
    setIsDropdownOpen(false);
    setSelectedVariantId(null);
    setSelectedVariant(null);
    setLoadingVariants(true);

    try {
      const res = await adminProductController.getProductById(prod.id);
      if (res.data) {
        setSelectedProduct(res.data);
      }
    } catch {
      // handled
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleClearSelectedProduct = () => {
    setSelectedProductId(null);
    setSelectedProduct(null);
    setSelectedVariantId(null);
    setSelectedVariant(null);
    setSearchQuery('');
    setIsDropdownOpen(true);
  };

  const handleVariantSelect = (varId: number) => {
    setSelectedVariantId(varId);
    if (selectedProduct?.variants) {
      const v = selectedProduct.variants.find((v) => v.id === varId) || null;
      setSelectedVariant(v);
      if (v) {
        setActualQuantity(v.stockQuantity);
      }
    }
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.slug && p.slug.toLowerCase().includes(q));
  });

  const currentSystemStock = selectedVariant ? selectedVariant.stockQuantity : 0;
  const stockDifference = actualQuantity - currentSystemStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId || actualQuantity < 0) return;

    setSubmitting(true);
    const result = await onSubmit({
      variantId: selectedVariantId,
      actualQuantity,
      reason: reason.trim() || 'Kiểm kê kho',
    });
    setSubmitting(false);

    if (result) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-6 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <RefreshCw className="w-7 h-7 text-orange-600" />
            <span>Kiểm Kê & Điều Chỉnh Tồn Kho Real-time</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Searchable Combobox for Main Product */}
          <div className="space-y-2 relative">
            <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              <span>Bước 1: Tìm & Chọn Sản Phẩm Cần Kiểm Kê <span className="text-rose-500">*</span></span>
            </label>

            {selectedProduct ? (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 border border-orange-200 text-slate-900 font-bold text-sm">
                <div className="flex items-center gap-3">
                  {selectedProduct.mainImage && (
                    <img src={selectedProduct.mainImage} alt="" className="w-10 h-10 object-cover rounded-xl border border-orange-200" />
                  )}
                  <div>
                    <div className="text-base font-extrabold text-slate-900">{selectedProduct.name}</div>
                    <div className="text-xs text-slate-600 font-mono">Tồn kho hiện tại: {selectedProduct.totalStock || selectedProduct.stock || 0} {selectedProduct.unit || 'SP'}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearSelectedProduct}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-orange-600 hover:border-orange-500 font-bold text-xs shadow-2xs transition-all"
                >
                  Đổi Sản Phẩm
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required={!selectedProductId}
                    placeholder="Gõ từ khóa để tìm nhanh sản phẩm (Tên, Mã, Slug)..."
                    value={searchQuery}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-sm font-bold focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <ChevronDown className="w-5 h-5 absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                </div>

                {/* Dropdown Live Results */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-300 shadow-2xl divide-y divide-slate-100">
                    {loadingProducts ? (
                      <div className="p-4 text-center text-xs font-semibold text-slate-500 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                        <span>Đang tải danh sách sản phẩm...</span>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="p-4 text-center text-xs font-semibold text-slate-500">
                        Không tìm thấy sản phẩm nào khớp với từ khóa "{searchQuery}"
                      </div>
                    ) : (
                      filteredProducts.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleProductSelect(p)}
                          className="w-full text-left p-3.5 hover:bg-orange-50 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            {p.mainImage ? (
                              <img src={p.mainImage} alt="" className="w-10 h-10 object-cover rounded-xl border border-slate-200" />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-500 font-mono">
                                /{p.slug} • Tồn: <strong className="text-slate-800">{p.totalStock || p.stock || 0} {p.unit || 'SP'}</strong>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 opacity-0 group-hover:opacity-100 transition-all">
                            Chọn
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Select Variant */}
          {loadingVariants ? (
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-200 text-center text-sm font-extrabold text-orange-600 flex items-center justify-center gap-2.5">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang tải danh sách biến thể mẫu mã sản phẩm...</span>
            </div>
          ) : selectedProduct && (
            <div className="space-y-3 p-5 rounded-2xl bg-orange-50/50 border border-orange-200">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />
                <span>
                  Bước 2: Chọn Biến Thể Cụ Thể <span className="text-rose-500">*</span>
                </span>
              </label>

              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                  {selectedProduct.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;

                    return (
                      <button
                        type="button"
                        key={v.id ?? v.sku}
                        onClick={() => v.id && handleVariantSelect(v.id)}
                        className={`p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-orange-600 bg-orange-600 text-white font-extrabold shadow-md'
                            : 'border-slate-300 bg-white text-slate-900 hover:border-orange-400'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="font-mono text-xs opacity-90 font-bold">SKU: {v.sku}</div>
                          <div className="text-sm">Size: <strong>{v.size || 'Mặc định'}</strong> {v.color ? `• Màu: ${v.color}` : ''}</div>
                          <div className="text-xs font-extrabold">Tồn sổ sách: {v.stockQuantity}</div>
                        </div>
                        {isSelected && <Check className="w-5 h-5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-rose-500 italic p-2 font-semibold">Sản phẩm này chưa được cấu hình biến thể nào.</div>
              )}
            </div>
          )}

          {/* Actual Quantity Input & Differences */}
          {selectedVariant && (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-slate-500 font-medium block">Tồn kho trên hệ thống:</span>
                  <span className="text-xl font-black text-slate-900">{currentSystemStock} cái</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Chênh lệch kiểm kê:</span>
                  <span className={`text-xl font-black ${
                    stockDifference > 0
                      ? 'text-emerald-600'
                      : stockDifference < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                  }`}>
                    {stockDifference > 0 ? `+${stockDifference}` : stockDifference} cái
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-800">
                  Số lượng thực tế kiểm kê thực tế <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={actualQuantity}
                  onChange={(e) => setActualQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 text-base font-extrabold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-slate-800 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span>Lý do điều chỉnh kho <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Kiểm kê định kỳ tháng 9, Hàng bị thất thoát/hư hỏng..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 font-extrabold text-sm hover:bg-slate-100 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedVariantId}
              className="px-7 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>{submitting ? 'Đang Điều Chỉnh...' : 'Cập Nhật Tồn Kho Real'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
