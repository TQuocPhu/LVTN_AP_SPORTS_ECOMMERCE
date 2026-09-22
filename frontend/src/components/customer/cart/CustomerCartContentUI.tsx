'use client';

import React from 'react';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';
import CartItemList from './CartItemList';
import CartSummaryBox from './CartSummaryBox';
import { useCart } from '@/hooks/useCart';

export default function CustomerCartContentUI() {
  const { items } = useCart();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16">
      {/* Header Banner Standard Component */}
      <PageHeaderBanner
        title="GIỎ HÀNG CỦA BẠN"
        subtitle="Quản lý danh sách sản phẩm, kiểm tra tồn kho và tiến hành thanh toán đơn hàng dễ dàng"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giỏ hàng' },
        ]}
      />

      {/* Main Container */}
      <main className="max-w-[1536px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 mt-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8">
            <CartItemList />
          </div>

          {/* Right Column: Order Summary (Only show if cart has items) */}
          {items.length > 0 && (
            <div className="lg:col-span-4">
              <CartSummaryBox />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
