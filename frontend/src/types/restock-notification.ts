/**
 * Định nghĩa Type cho luồng đăng ký nhận thông tin khi có hàng về kho (Restock Notification)
 */

export interface RegisterRestockNotificationRequest {
  variantId: number;
  customEmail?: string;
  email?: string;
}

export interface RestockNotificationResponse {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  productSlug: string;
  variantId: number;
  variantName?: string;
  sku: string;
  size?: string;
  color?: string;
  email: string;
  status: 'PENDING' | 'NOTIFIED' | 'CANCELLED' | string;
  message?: string;
  createdAt: string;
  notifiedAt?: string;
}

export interface RestockCheckResponse {
  subscribed: boolean;
}
