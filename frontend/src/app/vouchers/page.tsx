'use client';

import React from 'react';
import ClientTopBar from '@/components/layout/ClientTopBar';
import { CustomerVouchersContentUI } from '@/components/customer/voucher/CustomerVouchersContentUI';

/**
 * Page Router: /vouchers
 * Trang Kho Voucher Khuyến Mãi phong cách Shopee Portal phía Khách hàng.
 * Tuân thủ quy chuẩn Clean Page Router, chuyển toàn bộ giao diện cho CustomerVouchersContentUI.
 */
export default function CustomerVouchersPage() {
  return (
    <>
      {/* Thanh thông tin định vị, email & mạng xã hội đầu trang (Desktop Client) */}
      <ClientTopBar />
      <CustomerVouchersContentUI />
    </>
  );
}
