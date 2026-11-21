import { OrderResponse } from '@/types/order';

/** Thời hạn cho phép thanh toán lại VNPay tính từ payments.created_at (24 giờ) */
export const VNPAY_RETRY_WINDOW_HOURS = 24;

/**
 * Kiểm tra đồng bộ một đơn hàng có hợp lệ để hiển thị nút "Thanh Toán Lại VNPay" hay không:
 * 1. Bắt buộc đúng phương thức VNPAY (chặn tuyệt đối đơn COD).
 * 2. Giao dịch chưa hoàn tất (completed) và chưa hoàn tiền (refunded).
 * 3. Trạng thái đơn là pending hoặc payment_failed.
 * 4. Còn trong thời hạn 24 giờ kể từ payments.created_at (fallback orders.created_at).
 */
export function canRetryVNPayOrder(order?: OrderResponse | null): boolean {
  if (!order) return false;

  const method = order.paymentMethod?.toUpperCase();
  if (method !== 'VNPAY') return false;

  const payStatus = order.paymentStatus?.toLowerCase();
  if (payStatus === 'completed' || payStatus === 'refunded') return false;

  const orderStatus = order.status?.toLowerCase();
  if (orderStatus !== 'pending' && orderStatus !== 'payment_failed') return false;

  const anchor = order.paymentCreatedAt || order.createdAt;
  if (anchor) {
    const anchorMs = new Date(anchor).getTime();
    if (!Number.isNaN(anchorMs)) {
      const expireMs = anchorMs + VNPAY_RETRY_WINDOW_HOURS * 60 * 60 * 1000;
      if (Date.now() > expireMs) return false;
    }
  }

  return true;
}
