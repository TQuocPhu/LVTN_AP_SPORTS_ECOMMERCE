'use client';

import React from 'react';
import { AdminVouchersContentUI } from '@/components/admin/voucher/AdminVouchersContentUI';

/**
 * Page Router: /admin/vouchers
 * Trang Quản lý Mã Giảm Giá phía Admin.
 * Tuân thủ quy chuẩn Clean Page Router, chuyển toàn bộ giao diện cho AdminVouchersContentUI.
 */
export default function AdminVouchersPage() {
  return <AdminVouchersContentUI />;
}
