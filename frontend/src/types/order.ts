import { ShippingAddress } from './address';

export interface CreateOrderRequest {
  shippingAddressId: number;
  paymentMethod: 'COD' | 'VNPAY';
  couponCode?: string;
  note?: string;
  cartItemIds?: number[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  variantId?: number;
  sku?: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  status: string; // pending, confirmed, shipping, delivered, cancelled, payment_failed
  paymentMethod: 'COD' | 'VNPAY' | string;
  paymentStatus: 'pending' | 'completed' | 'failed' | string;
  paymentUrl?: string;
  shippingAddress?: ShippingAddress;
  trackingCode?: string;
  shippingProvider?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  ghnStationId?: number;
  ghnStationName?: string;
  ghnStationAddress?: string;
  ghnStationLatitude?: number;
  ghnStationLongitude?: number;
  note?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
