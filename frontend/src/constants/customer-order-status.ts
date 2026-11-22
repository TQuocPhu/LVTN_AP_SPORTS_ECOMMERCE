/**
 * Cấu hình hiển thị 10 trạng thái đơn hàng dành cho giao diện Khách hàng (hỗ trợ Light & Dark mode).
 */
export interface CustomerOrderStatusMeta {
  label: string;
  badgeClass: string;
}

export const CUSTOMER_ORDER_STATUS_MAP: Record<string, CustomerOrderStatusMeta> = {
  pending: {
    label: 'Chờ xác nhận',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  processing: {
    label: 'Đang đóng gói',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  shipped: {
    label: 'Đã bàn giao GHN',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  },
  shipping: {
    label: 'Đang giao hàng',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
  },
  delivered: {
    label: 'Đã giao hàng',
    badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
  },
  completed: {
    label: 'Hoàn tất',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  },
  returned: {
    label: 'Đã trả hàng',
    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  payment_failed: {
    label: 'TT thất bại',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
};

export function getCustomerOrderStatusMeta(status?: string): CustomerOrderStatusMeta {
  const key = status?.toLowerCase() || '';
  return (
    CUSTOMER_ORDER_STATUS_MAP[key] || {
      label: status || '---',
      badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    }
  );
}

/**
 * Cấu hình hiển thị 4 trạng thái thanh toán dành cho Khách hàng (hỗ trợ Light & Dark mode).
 */
export interface CustomerPaymentStatusMeta {
  value: 'completed' | 'refunded' | 'failed' | 'pending';
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const CUSTOMER_PAYMENT_STATUS_MAP: Record<string, CustomerPaymentStatusMeta> = {
  completed: {
    value: 'completed',
    label: 'Đã thanh toán',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  refunded: {
    value: 'refunded',
    label: 'Đã hoàn tiền',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    dotClass: 'bg-cyan-500',
  },
  failed: {
    value: 'failed',
    label: 'TT thất bại',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    dotClass: 'bg-rose-500',
  },
  pending: {
    value: 'pending',
    label: 'Chờ thanh toán',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-500 animate-pulse',
  },
};

export interface CustomerPaymentMethodMeta {
  isVnPay: boolean;
  label: string;
  badgeClass: string;
}

export const CUSTOMER_PAYMENT_STATUS_OPTIONS: CustomerPaymentStatusMeta[] = Object.values(
  CUSTOMER_PAYMENT_STATUS_MAP
);

export const CUSTOMER_PAYMENT_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: 'COD', label: 'Thanh toán COD' },
  { value: 'VNPAY', label: 'Chuyển khoản VNPay' },
];

export function getCustomerPaymentStatusMeta(status?: string): CustomerPaymentStatusMeta {
  const key = status?.toLowerCase() || 'pending';
  return CUSTOMER_PAYMENT_STATUS_MAP[key] || CUSTOMER_PAYMENT_STATUS_MAP.pending;
}

export function getCustomerPaymentMethodMeta(method?: string): CustomerPaymentMethodMeta {
  const isVnPay = method?.toUpperCase() === 'VNPAY';
  return {
    isVnPay,
    label: isVnPay ? 'VNPay' : 'COD',
    badgeClass: isVnPay
      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      : 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
  };
}
