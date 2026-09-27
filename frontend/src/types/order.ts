import { ShippingAddress } from './address';

export interface CreateOrderRequest {
  shippingAddressId: number;
  paymentMethod: 'COD' | 'VNPAY';
  couponCode?: string;
  note?: string;
  shippingFee?: number;
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
  attributes?: string;
  quantity: number;
  price: number;
  image?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'returned'
  | 'payment_failed';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface OrderResponse {
  id: number;
  orderCode: string;
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  status: OrderStatus | string;
  paymentMethod: 'COD' | 'VNPAY' | string;
  paymentStatus: PaymentStatus | string;
  paymentUrl?: string;
  couponCode?: string;
  couponName?: string;
  shippingAddress?: ShippingAddress;
  trackingCode?: string;
  shippingProvider?: string;

  // không sử dụng gpsLatitude
  gpsLatitude?: number;
  // không sử dụng gpsLongitude
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
