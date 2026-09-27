'use client';

import React from 'react';
import { AdminOrdersContentUI } from '@/components/admin/order/AdminOrdersContentUI';

/**
 * Page Router: /admin/orders
 * Trang Quản lý Đơn hàng phía Admin.
 * Tuân thủ quy chuẩn Clean Page Router, chuyển toàn bộ giao diện cho AdminOrdersContentUI.
 */
export default function AdminOrdersPage() {
  return <AdminOrdersContentUI />;
}
