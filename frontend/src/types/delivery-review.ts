/**
 * Kiểu dữ liệu cho module Đánh Giá Giao Hàng (Shipper) ở cả Customer và Admin/Staff.
 */

export interface DeliveryReview {
  id: number;
  orderId: number;
  orderCode: string;
  shipperName?: string | null;
  shipperPhone?: string | null;
  shippingProvider?: string | null;
  trackingCode?: string | null;
  rating: number;
  tags: string[];
  comment?: string | null;
  adminReply?: string | null;
  repliedByName?: string | null;
  repliedAt?: string | null;
  status: 'approved' | 'hidden' | string;
  createdAt: string;
}

export interface CreateDeliveryReviewRequest {
  rating: number;
  tags: string[];
  comment?: string;
}

export interface AdminDeliveryReviewItem {
  id: number;
  orderId: number;
  orderCode: string;
  trackingCode?: string | null;
  shippingProvider?: string | null;
  userId: number;
  customerName: string;
  customerEmail?: string | null;
  customerAvatar?: string | null;
  shipperId?: number | null;
  shipperName: string;
  shipperPhone?: string | null;
  rating: number;
  tags: string[];
  comment?: string | null;
  adminReply?: string | null;
  repliedByName?: string | null;
  repliedAt?: string | null;
  status: 'approved' | 'hidden' | string;
  createdAt: string;
}

export interface AdminDeliveryReviewSummary {
  totalReviews: number;
  averageRating: number;
  positiveReviews: number;
  pendingReplyCount: number;
}

export interface AdminDeliveryReviewFilter {
  keyword?: string;
  rating?: number;
  status?: string;
  hasReply?: boolean;
  page?: number;
  size?: number;
}
