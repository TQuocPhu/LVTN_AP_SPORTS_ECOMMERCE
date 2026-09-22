/**
 * Định nghĩa các kiểu dữ liệu TypeScript cho Phân hệ Mã Giảm Giá / Kho Voucher Enterprise.
 */

/**
 * Các loại mã giảm giá hệ thống hỗ trợ:
 * - FIXED: Giảm số tiền cố định (VD: 50.000 VNĐ)
 * - PERCENT: Giảm theo phần trăm (VD: 15%)
 * - FREESHIP: Giảm phí vận chuyển (VD: Giảm 30.000 VNĐ tiền ship)
 */
export type VoucherType = 'FIXED' | 'PERCENT' | 'FREESHIP';

/**
 * Trạng thái diễn ra của Voucher:
 * - active: Đang diễn ra và còn hiệu lực
 * - scheduled: Sắp diễn ra (chưa đến ngày startsAt)
 * - expired: Hết hạn hoặc hết lượt dùng
 * - disabled: Tạm dừng bởi admin (isActive = false)
 */
export type VoucherStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

/**
 * Phân loại phạm vi áp dụng voucher:
 * - ALL: Tất cả đơn hàng
 * - FREESHIP: Áp dụng vận chuyển
 * - FASHION: Quần áo thể thao
 * - APPAREL: Dụng cụ thể thao
 * - SHOES: Giày thể thao
 */
export type CategoryScope = 'ALL' | 'FREESHIP' | 'FASHION' | 'APPAREL' | 'SHOES' | string;

/**
 * Interface đại diện cho đối tượng Voucher nhận từ Backend API.
 */
export interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: VoucherType;
  value: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  usedCount: number;
  usagePercentage: number; // Tỷ lệ % đã sử dụng (VD: 85.5)
  categoryScope: CategoryScope;
  startsAt?: string;
  expiresAt?: string;
  status: VoucherStatus;
  isActive?: boolean;
  active?: boolean;
  isUsable?: boolean;
  usable?: boolean;
  displayStatus: string; // Chuỗi trạng thái tiếng Việt (VD: "Đang diễn ra", "Đã hết lượt")
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface gửi từ Frontend lên Backend khi Admin Tạo mới hoặc Sửa Voucher.
 */
export interface VoucherFormData {
  code: string;
  name: string;
  description?: string;
  type: VoucherType;
  value: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  categoryScope?: CategoryScope;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

/**
 * Interface cho Bộ lọc Tìm kiếm, Sắp xếp và Phân trang danh sách Voucher phía Admin.
 */
export interface VoucherFilterParams {
  keyword?: string;
  type?: string; // ALL, FIXED, PERCENT, FREESHIP
  status?: string; // ALL, active, scheduled, expired, disabled
  categoryScope?: string;
  sortBy?: 'createdAt' | 'expiresAt' | 'usedCount' | 'value' | 'code' | 'name';
  sortDir?: 'ASC' | 'DESC';
  page?: number;
  size?: number;
}

/**
 * Interface trả về từ API Phân trang (Spring Data Page DTO).
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * Interface gửi từ Khách hàng khi kiểm tra tính mã voucher cho Giỏ hàng / Thanh toán.
 */
export interface ApplyVoucherParams {
  code: string;
  orderAmount: number;
  shippingFee?: number;
}

/**
 * Interface kết quả kiểm tra và tính toán giảm giá trả về cho Khách hàng.
 */
export interface VoucherApplyResult {
  valid: boolean;
  message: string;
  couponCode?: string;
  couponName?: string;
  discountType?: VoucherType;
  discountValue?: number;
  discountAmount: number;
  freeShippingDiscount?: number;
  finalAmount: number;
  voucher?: Voucher;
}
