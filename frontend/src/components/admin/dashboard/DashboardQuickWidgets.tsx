'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  MessageSquare,
  ArrowRight,
  Star,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  RecentOrderWidget,
  TopProductWidget,
  LowStockAlertWidget,
  RecentReviewWidget,
} from '@/types/dashboard';

interface DashboardQuickWidgetsProps {
  isAdmin: boolean;
  isStaff: boolean;
  isWarehouse: boolean;
  recentOrders?: RecentOrderWidget[];
  topSellingProducts?: TopProductWidget[];
  lowStockAlerts?: LowStockAlertWidget[];
  recentReviews?: RecentReviewWidget[];
  loading: boolean;
}

export function DashboardQuickWidgets({
  isAdmin,
  isStaff,
  isWarehouse,
  recentOrders = [],
  topSellingProducts = [],
  lowStockAlerts = [],
  recentReviews = [],
  loading,
}: DashboardQuickWidgetsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-72 animate-pulse" />
        ))}
      </div>
    );
  }

  // Helper render badge trạng thái đơn hàng
  const getOrderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">Hoàn tất</span>;
      case 'shipping':
      case 'shipped':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-800">Đang giao</span>;
      case 'confirmed':
      case 'processing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800">Đã xác nhận</span>;
      case 'cancelled':
      case 'returned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800">Đã hủy</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700">Chờ duyệt</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* =========================================================================
          WIDGET 1: TOP 5 ĐƠN HÀNG GẦN ĐÂY (HIỂN THỊ CHO CẢ 3 ROLES)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Đơn Hàng Gần Đây</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              Mới nhất
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-700">Chưa có đơn hàng nào phát sinh</div>
            ) : (
              recentOrders.slice(0, 5).map((o) => (
                <div key={o.orderId} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 px-1 rounded-lg transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-700">{o.orderCode}</span>
                      {getOrderStatusBadge(o.status)}
                    </div>
                    <div className="text-[11px] text-slate-700 truncate mt-0.5">
                      {o.customerName} • <span className="text-slate-700">{o.createdAt}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-slate-900">{formatCurrency(o.finalAmount)}</div>
                    <span className="text-[10px] font-semibold text-slate-700">{o.paymentMethod}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors group"
          >
            <span>Xem toàn bộ danh sách đơn hàng</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          WIDGET 2: TOP 5 SẢN PHẨM BÁN CHẠY (CHỈ ADMIN & STAFF)
          ========================================================================= */}
      {(isAdmin || isStaff) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Sản Phẩm Bán Chạy Nhất</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                30 ngày qua
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {topSellingProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-700">Chưa có số liệu sản phẩm bán ra</div>
              ) : (
                topSellingProducts.slice(0, 5).map((p, idx) => (
                  <div key={p.productId} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 px-1 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-slate-700 w-4 text-center">{idx + 1}</span>
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden relative shrink-0">
                        {p.image ? (
                          <Image src={p.image} alt={p.productName} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-700 text-[10px]">SP</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate max-w-[200px]">{p.productName}</div>
                        <div className="text-[11px] text-slate-700">Đã bán: <strong className="text-emerald-700">{p.quantitySold.toLocaleString('vi-VN')}</strong> cái</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900">{formatCurrency(p.revenue)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors group"
            >
              <span>Xem quản lý danh mục sản phẩm</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          WIDGET 3: TOP 5 CẢNH BÁO TỒN KHO HẾT HÀNG (CHỈ ADMIN & WAREHOUSE_MANAGER)
          ========================================================================= */}
      {(isAdmin || isWarehouse) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Cảnh Báo Tồn Kho Cần Nhập Gấp</h3>
              </div>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Tồn kho ≤ 5
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {lowStockAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-emerald-700 font-bold">
                  Kho an toàn - Hiện tại không có SKU nào bị thiếu hụt!
                </div>
              ) : (
                lowStockAlerts.slice(0, 5).map((item) => (
                  <div key={item.variantId} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 px-1 rounded-lg transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-700">{item.sku}</span>
                        {item.stockQuantity === 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-700">HẾT HÀNG</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">SẮP HẾT</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-700 truncate mt-0.5">
                        {item.productName} (Size: {item.size || 'MĐ'} | Màu: {item.color || 'MĐ'})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-black text-sm ${item.stockQuantity === 0 ? 'text-rose-600' : 'text-amber-700'}`}>
                        {item.stockQuantity} cái
                      </div>
                      <span className="text-[10px] text-slate-700">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors group"
            >
              <span>Xem bảng quản lý kho & lập phiếu nhập</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          WIDGET 4: TOP 5 ĐÁNH GIÁ MỚI NHẤT (CHỈ ADMIN & STAFF)
          ========================================================================= */}
      {(isAdmin || isStaff) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">Đánh Giá & Phản Hồi Mới</h3>
              </div>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                Khách hàng
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentReviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-700">Chưa có đánh giá nào từ khách hàng</div>
              ) : (
                recentReviews.slice(0, 5).map((r) => (
                  <div key={r.reviewId} className="py-2.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-50/60 px-1 rounded-lg transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{r.customerName}</span>
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-700 line-clamp-1 italic mt-0.5">
                        &quot;{r.comment || 'Không có bình luận'}&quot;
                      </p>
                      <span className="text-[10px] text-slate-700 font-semibold">{r.productName}</span>
                    </div>
                    <div className="text-[10px] text-slate-700 shrink-0 pt-0.5">{r.createdAt}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              href="/admin/reviews"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors group"
            >
              <span>Xem tất cả đánh giá để phản hồi khách</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
