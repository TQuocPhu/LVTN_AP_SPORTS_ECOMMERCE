'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  Package,
  Building2,
  DollarSign,
  Tag,
  Check,
  RefreshCw,
  Search,
  ChevronDown,
  Plus,
  Trash2,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import { Supplier, CreateInventoryTransactionRequest, LowStockItem } from '@/types/inventory';
import { Product, ProductVariant } from '@/types/product';
import { adminProductController } from '@/controllers/admin-product-controller';

interface ImportDraftItem {
  variantId: number;
  productId?: number;
  sku: string;
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  unitCost: number;
}

interface CreateImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInventoryTransactionRequest) => Promise<unknown>;
  suppliers: Supplier[];
  initialLowStockItems?: LowStockItem[];
}

export function CreateImportModal({
  isOpen,
  onClose,
  onSubmit,
  suppliers,
  initialLowStockItems,
}: CreateImportModalProps) {
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

  const [itemQuantity, setItemQuantity] = useState<number>(10);
  const [itemUnitCost, setItemUnitCost] = useState<string>('');

  // Ticket Items List (Multi-Item support!)
  const [ticketItems, setTicketItems] = useState<ImportDraftItem[]>([]);

  const [supplierId, setSupplierId] = useState<number | undefined>(undefined);
  const [note, setNote] = useState<string>('');
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

      // Batch pre-fill low stock items if passed!
      if (initialLowStockItems && initialLowStockItems.length > 0) {
        const prefilled: ImportDraftItem[] = initialLowStockItems.map((item) => ({
          variantId: item.variantId,
          sku: item.sku,
          productName: item.productName,
          size: item.size,
          color: item.color,
          quantity: Math.max(10, 15 - item.stockQuantity), // Intelligent restock qty suggestion
          unitCost: item.costPrice || item.price || 0,
        }));
        setTicketItems(prefilled);
        setNote('Phiếu nhập bổ sung hàng cảnh báo sắp hết kho tự động');
      } else {
        setTicketItems([]);
      }
    } else {
      // Reset form
      setSearchQuery('');
      setIsDropdownOpen(false);
      setSelectedProductId(null);
      setSelectedProduct(null);
      setSelectedVariantId(null);
      setSelectedVariant(null);
      setItemQuantity(10);
      setItemUnitCost('');
      setTicketItems([]);
      setSupplierId(undefined);
      setNote('');
    }
  }, [isOpen, initialLowStockItems]);

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
      if (v?.costPrice || v?.price) {
        setItemUnitCost(String(v.costPrice || v.price));
      }
    }
  };

  const handleAddDraftItem = () => {
    if (!selectedVariant || !selectedProduct || itemQuantity <= 0) return;

    const existingIdx = ticketItems.findIndex((i) => i.variantId === selectedVariant.id);
    const cost = itemUnitCost ? parseFloat(itemUnitCost) : (selectedVariant.costPrice || selectedVariant.price || 0);

    if (existingIdx >= 0) {
      const updated = [...ticketItems];
      updated[existingIdx].quantity += itemQuantity;
      if (itemUnitCost) updated[existingIdx].unitCost = cost;
      setTicketItems(updated);
    } else {
      setTicketItems([
        ...ticketItems,
        {
          variantId: selectedVariant.id!,
          sku: selectedVariant.sku,
          productName: selectedProduct.name,
          size: selectedVariant.size || '',
          color: selectedVariant.color || '',
          quantity: itemQuantity,
          unitCost: cost,
        },
      ]);
    }

    // Reset single selection
    setSelectedVariantId(null);
    setSelectedVariant(null);
    setItemQuantity(10);
    setItemUnitCost('');
  };

  const handleRemoveDraftItem = (variantId: number) => {
    setTicketItems(ticketItems.filter((i) => i.variantId !== variantId));
  };

  const handleUpdateItemQuantity = (variantId: number, qty: number) => {
    setTicketItems(
      ticketItems.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  };

  const handleUpdateItemCost = (variantId: number, cost: number) => {
    setTicketItems(
      ticketItems.map((i) => (i.variantId === variantId ? { ...i, unitCost: Math.max(0, cost) } : i))
    );
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.slug && p.slug.toLowerCase().includes(q));
  });

  const totalTicketValue = ticketItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const totalTicketQty = ticketItems.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketItems.length === 0) return;

    setSubmitting(true);

    const payload: CreateInventoryTransactionRequest = {
      supplierId: supplierId || undefined,
      type: 'IMPORT',
      note: note.trim() || undefined,
      items: ticketItems.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
        unitCost: i.unitCost,
      })),
    };

    const result: any = await onSubmit(payload);
    setSubmitting(false);

    if (result && typeof result === 'object') {
      const selectedSupplier = suppliers.find((s) => s.id === supplierId);
      result.quantity = totalTicketQty;
      result.totalAmount = totalTicketValue;
      if (selectedSupplier) {
        result.supplierName = selectedSupplier.name;
        result.supplierCode = selectedSupplier.code;
      }
      result.items = ticketItems.map((item) => ({
        variantId: item.variantId,
        variantSku: item.sku,
        variantSize: item.size,
        variantColor: item.color,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalAmount: item.quantity * item.unitCost,
      }));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden space-y-6 p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="space-y-0.5">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <ArrowDownLeft className="w-7 h-7 text-orange-600" />
              <span>Lập Phiếu Nhập Kho Đa Sản Phẩm</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Cho phép chọn & lập phiếu nhập hàng loạt nhiều mẫu hàng trong 1 phiếu duy nhất
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Top Section: Supplier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange-500" />
                <span>Nhà Cung Cấp Hàng</span>
              </label>
              <select
                value={supplierId || ''}
                onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:border-orange-500"
              >
                <option value="">-- Chọn Nhà Cung Cấp --</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Ghi Chú Đợt Nhập Hàng
              </label>
              <input
                type="text"
                placeholder="Số hóa đơn VAT, chứng từ đi kèm, ghi chú nhập kho..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* STEP 1: Searchable Combobox for Main Product */}
          <div className="space-y-2 relative">
            <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              <span>Thêm Sản Phẩm & Biến Thể Vào Phiếu Nhập</span>
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

          {/* STEP 2: Select Variant & Quantity */}
          {loadingVariants ? (
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-200 text-center text-sm font-extrabold text-orange-600 flex items-center justify-center gap-2.5">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Đang tải danh sách biến thể mẫu mã sản phẩm...</span>
            </div>
          ) : selectedProduct && (
            <div className="space-y-4 p-5 rounded-2xl bg-orange-50/50 border border-orange-200">
              <label className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-500" />
                <span>Chọn Biến Thể & Số Lượng</span>
              </label>

              {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-1">
                  {selectedProduct.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;
                    return (
                      <button
                        type="button"
                        key={v.id ?? v.sku}
                        onClick={() => v.id && handleVariantSelect(v.id)}
                        className={`p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-orange-600 bg-orange-600 text-white font-extrabold shadow-md'
                            : 'border-slate-300 bg-white text-slate-900 hover:border-orange-400'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1 pr-2">
                          <div className="font-mono text-xs opacity-90 font-bold break-all leading-tight">SKU: {v.sku}</div>
                          <div className="text-xs truncate">Size: <strong>{v.size || 'Mặc định'}</strong> {v.color ? `• Màu: ${v.color}` : ''}</div>
                          <div className="text-xs font-bold">Tồn sổ sách: {v.stockQuantity}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-rose-500 italic p-2 font-semibold">Sản phẩm này chưa được cấu hình biến thể nào.</div>
              )}

              {selectedVariant && (
                <div className="flex flex-col sm:flex-row items-end gap-3 pt-3 border-t border-orange-200">
                  <div className="w-full sm:w-1/3 space-y-1">
                    <label className="text-xs font-bold text-slate-800">Số Lượng Nhập</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-extrabold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="w-full sm:w-1/3 space-y-1">
                    <label className="text-xs font-bold text-slate-800">Đơn Giá Vốn (VND)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="200000"
                      value={itemUnitCost}
                      onChange={(e) => setItemUnitCost(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-extrabold focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDraftItem}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4 text-orange-400 stroke-[3]" />
                    <span>Thêm Vào Danh Sách Phiếu</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table of Added Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-orange-500" />
                <span>Danh Sách Mặt Hàng Trong Phiếu Nhập ({ticketItems.length} dòng - {totalTicketQty} sản phẩm)</span>
              </h4>
              {ticketItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setTicketItems([])}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase">
                    <th className="p-3 pl-4">STT</th>
                    <th className="p-3">Sản Phẩm & Biến Thể</th>
                    <th className="p-3">Mã SKU</th>
                    <th className="p-3 text-center w-32">Số Lượng Nhập</th>
                    <th className="p-3 text-right w-36">Đơn Giá Vốn (đ)</th>
                    <th className="p-3 text-right w-36">Thành Tiền</th>
                    <th className="p-3 pr-4 text-center w-16">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ticketItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        Chưa có mặt hàng nào trong phiếu nhập. Hãy tìm sản phẩm ở trên và nhấn "Thêm Vào Danh Sách Phiếu".
                      </td>
                    </tr>
                  ) : (
                    ticketItems.map((item, idx) => (
                      <tr key={item.variantId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 pl-4 font-bold text-slate-500">{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">{item.productName}</div>
                          <div className="text-[11px] text-slate-500">
                            Size: <strong>{item.size || 'Mặc định'}</strong> {item.color ? `• Màu: ${item.color}` : ''}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">{item.sku}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQuantity(item.variantId, parseInt(e.target.value) || 1)}
                            className="w-20 text-center px-2 py-1 rounded-lg border border-slate-300 font-extrabold text-xs"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            min={0}
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItemCost(item.variantId, parseFloat(e.target.value) || 0)}
                            className="w-28 text-right px-2 py-1 rounded-lg border border-slate-300 font-bold text-xs"
                          />
                        </td>
                        <td className="p-3 text-right font-black text-orange-600">
                          {formatCurrency(item.quantity * item.unitCost)}
                        </td>
                        <td className="p-3 pr-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftItem(item.variantId)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total Footer Summary */}
            {ticketItems.length > 0 && (
              <div className="flex justify-between items-center p-4 rounded-2xl bg-orange-50 border border-orange-200">
                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  TỔNG CỘNG ({totalTicketQty} SP):
                </span>
                <span className="text-xl font-black text-orange-600">
                  {formatCurrency(totalTicketValue)}
                </span>
              </div>
            )}
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
              disabled={submitting || ticketItems.length === 0}
              className="px-7 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2"
            >
              <ArrowDownLeft className="w-5 h-5 stroke-[3]" />
              <span>{submitting ? 'Đang Lập Phiếu...' : `Xác Nhận Nhập Kho (${ticketItems.length} Mặt Hàng)`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
