import { ApiResponse } from '@/services/api-client';
import { ApplyVoucherParams, VoucherApplyResult } from '@/types/voucher';
import { voucherController } from './voucher-controller';
import { addressController } from './address-controller';
import { cartController } from './cart-controller';
import { ShippingAddress } from '@/types/address';
import { CartSummary } from '@/types/cart';

/**
 * Controller chịu trách nhiệm đóng gói tất cả các gọi API phục vụ quy trình Đặt Hàng (Checkout).
 * Tuân thủ kiến trúc: pages -> components -> hooks -> controller (FE).
 */
export const checkoutController = {
  /**
   * Lấy danh sách địa chỉ giao hàng của khách hàng
   */
  async getAddresses(): Promise<ApiResponse<ShippingAddress[]>> {
    return addressController.getAddresses();
  },

  /**
   * Lấy giỏ hàng của khách hàng
   */
  async getCart(): Promise<ApiResponse<CartSummary>> {
    return cartController.getCart();
  },

  /**
   * Áp dụng mã giảm giá voucher vào đơn hàng
   */
  async applyVoucher(params: ApplyVoucherParams): Promise<ApiResponse<VoucherApplyResult>> {
    return voucherController.calculateVoucherDiscount(params);
  },
};
