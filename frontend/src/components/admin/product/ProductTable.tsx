'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Product } from '@/types/product';
import {
  Package,
  FileText,
  Layers,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  actionLoading: boolean;
  onOpenVariantDrawer: (productId: number) => void;
  onOpenDescriptionModal: (productId: number) => void;
  onToggleStatus: (productId: number) => void;
  onDeleteProduct: (productId: number) => void;
}

export function ProductTable({
  products,
  loading,
  actionLoading,
  onOpenVariantDrawer,
  onOpenDescriptionModal,
  onToggleStatus,
  onDeleteProduct,
}: ProductTableProps) {
  const { user } = useAdminAuth();
  const canManageInventory = user?.roleName === 'ADMIN' || user?.roleName === 'WAREHOUSE_MANAGER';

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm w-full">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3.5 px-4 text-left">Sản phẩm</th>
            <th className="py-3.5 px-3 text-left whitespace-nowrap">Giá niêm yết</th>
            <th className="py-3.5 px-3 text-left whitespace-nowrap">Tổng tồn kho</th>
            <th className="py-3.5 px-2.5 text-center whitespace-nowrap">Mô tả</th>
            <th className="py-3.5 px-2.5 text-center whitespace-nowrap">Biến thể</th>
            <th className="py-3.5 px-3 text-center whitespace-nowrap">Trạng thái</th>
            <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {loading ? (
            <tr>
              <td colSpan={7} className="py-14 text-center text-slate-400">
                <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-orange-500" />
                Đang tải danh sách sản phẩm...
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-14 text-center text-slate-400">
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const isDiscontinued = product.status === 'discontinued';

              return (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Name, Image, Weight & Category */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-start gap-3">
                      {product.mainImage ? (
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-xs flex-shrink-0 mt-0.5"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0 mt-0.5">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors block break-words leading-snug">
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                          <span className="font-mono text-slate-400 break-all">
                            /{product.slug}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-slate-600">
                            Trọng lượng: <span className="font-semibold text-slate-800">{product.weight ?? 500}g</span>
                          </span>
                        </div>

                        {/* Danh mục đưa vào ngay phía dưới trọng lượng */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {product.categories && product.categories.length > 0 ? (
                            product.categories.map((c) => (
                              <span
                                key={c.id}
                                className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/80"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {product.primaryCategoryName || 'Chưa phân loại'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap align-middle">
                    {product.price?.toLocaleString('vi-VN')} đ
                  </td>

                  {/* Total Stock */}
                  <td className="py-3.5 px-3 whitespace-nowrap align-middle">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          product.totalStock > 10
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : product.totalStock > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                            : 'bg-rose-50 text-rose-700 border-rose-200/80'
                        }`}
                      >
                        {product.totalStock > 0
                          ? `${product.totalStock} ${product.unit}`
                          : `Hết hàng (0 ${product.unit})`}
                      </span>

                      {canManageInventory && product.totalStock <= 0 && (
                        <Link
                          href={`/admin/inventory?keyword=${encodeURIComponent(product.name)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors mt-0.5"
                          title="Lập phiếu nhập kho bổ sung hàng mới"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500" /> Nhập kho ngay
                        </Link>
                      )}
                    </div>
                  </td>

                  {/* Description Button */}
                  <td className="py-3.5 px-2.5 text-center whitespace-nowrap align-middle">
                    <button
                      onClick={() => onOpenDescriptionModal(product.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-orange-500" /> Xem mô tả
                    </button>
                  </td>

                  {/* Variant Drawer Trigger */}
                  <td className="py-3.5 px-2.5 text-center whitespace-nowrap align-middle">
                    <button
                      onClick={() => onOpenVariantDrawer(product.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg border border-orange-200/80 transition-colors shadow-2xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {product.variantCount} biến thể
                    </button>
                  </td>

                  {/* Status Toggle Switch */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap align-middle">
                    <button
                      onClick={() => onToggleStatus(product.id)}
                      disabled={actionLoading}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                        !isDiscontinued
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {!isDiscontinued ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Kinh doanh
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          Tạm ngừng
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenVariantDrawer(product.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Xem biến thể & thông số"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
