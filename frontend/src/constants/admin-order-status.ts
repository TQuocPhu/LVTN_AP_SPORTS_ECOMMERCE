/**
 * Cấu hình chuẩn 10 trạng thái đơn hàng khớp 100% với enum OrderStatus ở Backend.
 * Dùng chung cho bộ lọc AdminOrderFilterBar và bảng AdminOrderTable (giao diện Light-only).
 */
export interface AdminOrderStatusMeta {
  value: string;
  filterValue: string;
  label: string;
  filterLabel: string;
  badgeClass: string;
}

export const ADMIN_ORDER_STATUS_MAP: Record<string, AdminOrderStatusMeta> = {
  pending: {
    value: 'pending',
    filterValue: 'PENDING',
    label: 'Chờ xác nhận',
    filterLabel: 'Chờ xác nhận (pending)',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  confirmed: {
    value: 'confirmed',
    filterValue: 'CONFIRMED',
    label: 'Đã xác nhận',
    filterLabel: 'Đã xác nhận (confirmed)',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  processing: {
    value: 'processing',
    filterValue: 'PROCESSING',
    label: 'Đang đóng gói',
    filterLabel: 'Đang đóng gói (processing)',
    badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  shipped: {
    value: 'shipped',
    filterValue: 'SHIPPED',
    label: 'Đã bàn giao GHN',
    filterLabel: 'Đã bàn giao bên vận chuyển (shipped)',
    badgeClass: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  shipping: {
    value: 'shipping',
    filterValue: 'SHIPPING',
    label: 'Đang vận chuyển',
    filterLabel: 'Đang vận chuyển (shipping)',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  delivered: {
    value: 'delivered',
    filterValue: 'DELIVERED',
    label: 'Đã giao hàng',
    filterLabel: 'Đã giao hàng (delivered)',
    badgeClass: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  completed: {
    value: 'completed',
    filterValue: 'COMPLETED',
    label: 'Hoàn tất',
    filterLabel: 'Hoàn tất (completed)',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  cancelled: {
    value: 'cancelled',
    filterValue: 'CANCELLED',
    label: 'Đã hủy',
    filterLabel: 'Đã hủy (cancelled)',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  returned: {
    value: 'returned',
    filterValue: 'RETURNED',
    label: 'Đã trả hàng',
    filterLabel: 'Đã trả hàng (returned)',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  payment_failed: {
    value: 'payment_failed',
    filterValue: 'PAYMENT_FAILED',
    label: 'TT thất bại',
    filterLabel: 'Thanh toán thất bại (payment_failed)',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const ADMIN_ORDER_STATUS_OPTIONS: AdminOrderStatusMeta[] = Object.values(ADMIN_ORDER_STATUS_MAP);

/**
 * Lấy metadata hiển thị chuẩn cho trạng thái đơn hàng ở trang quản trị.
 */
export function getAdminOrderStatusMeta(status?: string): AdminOrderStatusMeta {
  const key = status?.toLowerCase() || '';
  return (
    ADMIN_ORDER_STATUS_MAP[key] || {
      value: key,
      filterValue: key.toUpperCase(),
      label: status || '---',
      filterLabel: status || '---',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    }
  );
}

/**
 * Cấu hình chuẩn 4 trạng thái thanh toán khớp 100% với enum PaymentStatus ở Backend (giao diện Light-only).
 */
export type AdminPaymentStatusKey = 'pending' | 'completed' | 'failed' | 'refunded';

export interface AdminPaymentStatusMeta {
  value: AdminPaymentStatusKey;
  label: string;
  badgeClass: string;
  dotClass?: string;
}

export const ADMIN_PAYMENT_STATUS_MAP: Record<AdminPaymentStatusKey, AdminPaymentStatusMeta> = {
  completed: {
    value: 'completed',
    label: 'Đã thanh toán',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  refunded: {
    value: 'refunded',
    label: 'Đã hoàn tiền',
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  failed: {
    value: 'failed',
    label: 'Thất bại',
    badgeClass: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  pending: {
    value: 'pending',
    label: 'Chờ thanh toán',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500 animate-pulse',
  },
};

export const ADMIN_PAYMENT_STATUS_OPTIONS: AdminPaymentStatusMeta[] = Object.values(ADMIN_PAYMENT_STATUS_MAP);

/**
 * Lấy metadata hiển thị chuẩn cho trạng thái thanh toán ở trang quản trị.
 */
export function getAdminPaymentStatusMeta(status?: string): AdminPaymentStatusMeta {
  const key = (status?.toLowerCase() || 'pending') as AdminPaymentStatusKey;
  return ADMIN_PAYMENT_STATUS_MAP[key] || ADMIN_PAYMENT_STATUS_MAP.pending;
}
