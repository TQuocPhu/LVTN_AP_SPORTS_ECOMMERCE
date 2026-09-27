import { apiClient, ApiResponse } from '@/services/api-client';
import {
  Voucher,
  VoucherFormData,
  VoucherFilterParams,
  PageResponse,
  ApplyVoucherParams,
  VoucherApplyResult,
} from '@/types/voucher';

/**
 * Controller phụ trách gọi REST API giao tiếp với Backend cho Phân Hệ Voucher / Mã Giảm Giá.
 * Phân chia minh bạch theo kiến trúc 4 tầng: pages -> components -> hooks -> controller (FE).
 * Trả về ApiResponse<T> đồng bộ với toàn bộ hệ thống API Client của dự án.
 */
export const voucherController = {
  // ==========================================
  // 1. DÀNH CHO QUẢN TRỊ VIÊN (ADMIN PORTAL)
  // ==========================================

  /**
   * Lấy danh sách mã giảm giá phía Admin có phân trang, lọc và sắp xếp đa tiêu chí.
   *
   * @param params Bộ lọc tham số tìm kiếm (keyword, type, status, categoryScope, sortBy, sortDir, page, size)
   * @return Promise chứa ApiResponse của dữ liệu phân trang PageResponse<Voucher>
   */
  async getAdminVouchers(params: VoucherFilterParams): Promise<ApiResponse<PageResponse<Voucher>>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.categoryScope) queryParams.append('categoryScope', params.categoryScope);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    queryParams.append('page', (params.page ?? 0).toString());
    queryParams.append('size', (params.size ?? 10).toString());

    return apiClient.get<ApiResponse<PageResponse<Voucher>>>(
      `/admin/vouchers?${queryParams.toString()}`,
      { suppressErrorToast: true }
    );
  },

  /**
   * Xem chi tiết thông tin voucher theo ID cho Admin.
   *
   * @param id ID của voucher cần xem
   * @return Promise chứa ApiResponse đối tượng Voucher
   */
  async getAdminVoucherById(id: number): Promise<ApiResponse<Voucher>> {
    return apiClient.get<ApiResponse<Voucher>>(`/admin/vouchers/${id}`);
  },

  /**
   * Tạo mới một voucher từ form Admin.
   *
   * @param data DTO dữ liệu tạo voucher
   * @return Promise chứa ApiResponse của Voucher vừa được tạo
   */
  async createVoucher(data: VoucherFormData): Promise<ApiResponse<Voucher>> {
    return apiClient.post<ApiResponse<Voucher>>('/admin/vouchers', data);
  },

  /**
   * Cập nhật thông tin voucher theo ID cho Admin.
   *
   * @param id ID của voucher
   * @param data DTO dữ liệu chỉnh sửa
   * @return Promise chứa ApiResponse của Voucher sau khi cập nhật
   */
  async updateVoucher(id: number, data: VoucherFormData): Promise<ApiResponse<Voucher>> {
    return apiClient.put<ApiResponse<Voucher>>(`/admin/vouchers/${id}`, data);
  },

  /**
   * Bật / tắt nhanh trạng thái kích hoạt (isActive) của voucher.
   *
   * @param id ID của voucher cần chuyển trạng thái
   * @return Promise chứa ApiResponse của Voucher với trạng thái mới
   */
  async toggleVoucherStatus(id: number): Promise<ApiResponse<Voucher>> {
    return apiClient.patch<ApiResponse<Voucher>>(`/admin/vouchers/${id}/toggle-status`);
  },

  /**
   * Xóa voucher khỏi hệ thống theo ID.
   *
   * @param id ID của voucher cần xóa
   * @return Promise chứa ApiResponse kết quả xóa
   */
  async deleteVoucher(id: number): Promise<ApiResponse<{ success: boolean; message: string; id: number }>> {
    return apiClient.delete<ApiResponse<{ success: boolean; message: string; id: number }>>(
      `/admin/vouchers/${id}`
    );
  },

  // ==========================================
  // 2. DÀNH CHO KHÁCH HÀNG (CUSTOMER PORTAL)
  // ==========================================

  /**
   * Lấy danh sách các voucher công khai phục vụ cho Kho Voucher (/vouchers) kiểu Shopee.
   *
   * @param categoryScope Tab phân loại lọc (ví dụ: ALL, FREESHIP, FASHION, APPAREL, SHOES)
   * @return Promise chứa ApiResponse mảng Voucher công khai
   */
  async getPublicVouchers(categoryScope = 'ALL'): Promise<ApiResponse<Voucher[]>> {
    return apiClient.get<ApiResponse<Voucher[]>>(
      `/customer/vouchers?categoryScope=${encodeURIComponent(categoryScope)}`
    );
  },

  /**
   * Kiểm tra mã giảm giá và tính toán số tiền giảm khi khách hàng checkout / dùng giỏ hàng.
   *
   * @param params DTO gồm mã code, orderAmount và shippingFee
   * @return Promise chứa ApiResponse của VoucherApplyResult
   */
  async calculateVoucherDiscount(params: ApplyVoucherParams): Promise<ApiResponse<VoucherApplyResult>> {
    return apiClient.post<ApiResponse<VoucherApplyResult>>('/customer/vouchers/apply', params, {
      showSuccessToast: false,
    });
  },
};
