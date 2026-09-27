import { ShippingAddress } from './address';
import { OrderItem } from './order';
import { UserResponse } from './user';

export interface AdminOrderFilterParams {
  keyword?: string;
  status?: string; // ALL, pending, confirmed, processing, shipping, delivered, cancelled, payment_failed
  paymentMethod?: string; // ALL, COD, VNPAY
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface AdminOrderSummary {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paymentFailedOrders: number;
  totalRevenue: number;
}

export interface OrderStatusHistoryItem {
  id: number;
  status: string;
  note?: string;
  changedByUserId?: number;
  changedByName?: string;
  changedByEmail?: string;
  changedByRole?: string;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: number;
  orderCode: string;
  totalPrice: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
  status: string; // pending, confirmed, processing, shipping, delivered, cancelled, payment_failed
  paymentMethod: 'COD' | 'VNPAY' | string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' | string;
  paymentUrl?: string;
  couponCode?: string;
  couponName?: string;

  userId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  processedByStaff?: Partial<UserResponse> & { name?: string };

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

  // Shipper Simulation coordinates for GPS Tracking Map
  shipperCurrentLatitude?: number;
  shipperCurrentLongitude?: number;
  shipperName?: string;
  shipperPhone?: string;

  note?: string;
  items: OrderItem[];
  statusHistories?: OrderStatusHistoryItem[];

  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
  note?: string;
}

export interface CancelOrderPayload {
  reason: string;
}
