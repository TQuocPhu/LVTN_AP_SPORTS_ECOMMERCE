import { CartItem } from './cart';
import { ShippingAddress } from './address';
import { VoucherApplyResult } from './voucher';

export type PaymentMethod = 'COD' | 'VNPAY';

export interface CheckoutFormState {
  selectedAddressId: number | null;
  selectedAddress: ShippingAddress | null;
  cartItems: CartItem[];
  paymentMethod: PaymentMethod;
  voucherCode: string;
  appliedVoucher: VoucherApplyResult | null;
  note: string;
}

export interface CheckoutOrderSummary {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  finalAmount: number;
}
