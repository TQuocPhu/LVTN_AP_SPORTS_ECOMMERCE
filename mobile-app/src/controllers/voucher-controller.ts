import { apiClient } from '../services/apiClient';
import { ApiResponse, Voucher, VoucherApplyResult } from '../types';

export const voucherController = {
  /**
   * Lấy danh sách mã khuyến mãi công khai kèm lượt dùng cá nhân của khách hàng hiện tại
   */
  async getPublicVouchers(categoryScope = 'ALL'): Promise<ApiResponse<Voucher[]>> {
    const res = await apiClient.get<ApiResponse<Voucher[]>>(
      `/customer/vouchers?categoryScope=${encodeURIComponent(categoryScope)}`
    );
    return res.data;
  },

  /**
   * Kiểm tra tính hợp lệ và tính số tiền giảm giá cho đơn hàng
   */
  async applyVoucher(payload: {
    code: string;
    orderAmount: number;
    shippingFee: number;
  }): Promise<ApiResponse<VoucherApplyResult>> {
    const res = await apiClient.post<ApiResponse<VoucherApplyResult>>('/customer/vouchers/apply', payload);
    return res.data;
  },
};
