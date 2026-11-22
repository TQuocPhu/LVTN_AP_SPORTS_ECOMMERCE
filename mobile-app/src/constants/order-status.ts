/**
 * Cấu hình chuẩn hóa 10 trạng thái đơn hàng và 4 trạng thái thanh toán trên Mobile App,
 * khớp 100% với enum OrderStatus và PaymentStatus ở Backend.
 */

export interface MobileStatusBadge {
  label: string;
  bg: string;
  text: string;
}

export const MOBILE_ORDER_STATUS_MAP: Record<string, MobileStatusBadge> = {
  pending: { label: 'Chờ xác nhận', bg: '#fef3c7', text: '#d97706' },
  confirmed: { label: 'Đã xác nhận', bg: '#e0f2fe', text: '#0284c7' },
  processing: { label: 'Đang đóng gói', bg: '#f3e8ff', text: '#7c3aed' },
  shipped: { label: 'Đã bàn giao GHN', bg: '#e0e7ff', text: '#4338ca' },
  shipping: { label: 'Đang giao hàng', bg: '#cffafe', text: '#0e7490' },
  delivered: { label: 'Đã giao hàng', bg: '#ccfbf1', text: '#0f766e' },
  completed: { label: 'Hoàn tất', bg: '#dcfce7', text: '#166534' },
  cancelled: { label: 'Đã hủy', bg: '#fee2e2', text: '#b91c1c' },
  returned: { label: 'Đã trả hàng', bg: '#ffedd5', text: '#c2410c' },
  payment_failed: { label: 'TT thất bại', bg: '#f1f5f9', text: '#475569' },
};

export const MOBILE_PAYMENT_STATUS_MAP: Record<string, MobileStatusBadge> = {
  completed: { label: 'Đã thanh toán', bg: '#dcfce7', text: '#15803d' },
  refunded: { label: 'Đã hoàn tiền', bg: '#cffafe', text: '#0e7490' },
  failed: { label: 'Thanh toán thất bại', bg: '#fee2e2', text: '#b91c1c' },
  pending: { label: 'Chờ thanh toán', bg: '#fef3c7', text: '#d97706' },
};

/**
 * Lấy nhãn tiếng Việt & màu badge chuẩn cho trạng thái đơn hàng.
 */
export function getMobileOrderStatusBadge(status?: string): MobileStatusBadge {
  const key = status?.toLowerCase() || '';
  return (
    MOBILE_ORDER_STATUS_MAP[key] || {
      label: status || '---',
      bg: '#f1f5f9',
      text: '#475569',
    }
  );
}

/**
 * Lấy nhãn tiếng Việt & màu badge chuẩn cho trạng thái thanh toán.
 */
export function getMobilePaymentStatusBadge(status?: string): MobileStatusBadge {
  const key = status?.toLowerCase() || 'pending';
  return MOBILE_PAYMENT_STATUS_MAP[key] || MOBILE_PAYMENT_STATUS_MAP.pending;
}

/**
 * Chuẩn hóa tên hiển thị phương thức thanh toán.
 */
export function getMobilePaymentMethodLabel(method?: string): string {
  if (method?.toUpperCase() === 'VNPAY') return 'VNPay Sandbox';
  return 'COD (Thanh toán khi nhận hàng)';
}

export const MOBILE_PAYMENT_METHOD_FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Tất cả PT' },
  { key: 'COD', label: 'COD' },
  { key: 'VNPAY', label: 'VNPay' },
];

export const MOBILE_PAYMENT_STATUS_FILTERS: { key: string; label: string }[] = [
  { key: 'ALL', label: 'Tất cả TT' },
  { key: 'pending', label: 'Chờ TT' },
  { key: 'completed', label: 'Đã TT' },
  { key: 'refunded', label: 'Hoàn tiền' },
  { key: 'failed', label: 'TT thất bại' },
];
