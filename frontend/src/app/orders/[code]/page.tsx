import React from 'react';
import { Metadata } from 'next';
import { CustomerOrderTrackingContentUI } from '@/components/customer/order/CustomerOrderTrackingContentUI';

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Tra Cứu Đơn Hàng #${resolvedParams.code} - AP Sports`,
    description: `Theo dõi vị trí vận chuyển real-time và chi tiết đơn hàng #${resolvedParams.code} trên hệ thống AP Sports.`,
  };
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <CustomerOrderTrackingContentUI orderCode={resolvedParams.code} />;
}
