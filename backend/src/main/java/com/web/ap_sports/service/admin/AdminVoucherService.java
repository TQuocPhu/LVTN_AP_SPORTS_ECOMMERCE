package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.VoucherFilterRequest;
import com.web.ap_sports.dto.request.admin.VoucherRequest;
import com.web.ap_sports.dto.response.common.VoucherResponse;
import org.springframework.data.domain.Page;

/**
 * Interface Service định nghĩa các nghiệp vụ Quản lý Mã Giảm Giá / Voucher dành cho Quản trị viên (Admin).
 */
public interface AdminVoucherService {

    /**
     * Lấy danh sách Voucher có hỗ trợ Tìm kiếm theo từ khóa, Lọc theo trạng thái/loại voucher và Phân trang + Sắp xếp đa tiêu chí.
     *
     * @param filterRequest DTO chứa tham số lọc, phân trang và sắp xếp
     * @return Trang (Page) chứa các dữ liệu VoucherResponse
     */
    Page<VoucherResponse> getVouchers(VoucherFilterRequest filterRequest);

    /**
     * Xem thông tin chi tiết một Voucher theo ID.
     *
     * @param id ID của voucher
     * @return VoucherResponse thông tin chi tiết
     */
    VoucherResponse getVoucherById(Long id);

    /**
     * Tạo mới một Mã giảm giá / Voucher.
     *
     * @param request DTO chứa các thuộc tính khởi tạo voucher
     * @return VoucherResponse thông tin sau khi được tạo thành công
     */
    VoucherResponse createVoucher(VoucherRequest request);

    /**
     * Cập nhật thông tin một Voucher đã tồn tại.
     *
     * @param id ID của voucher cần sửa
     * @param request DTO chứa các thông tin cập nhật
     * @return VoucherResponse thông tin sau khi cập nhật thành công
     */
    VoucherResponse updateVoucher(Long id, VoucherRequest request);

    /**
     * Đổi nhanh trạng thái Kích hoạt / Tạm dừng (isActive) của Voucher.
     *
     * @param id ID của voucher
     * @return VoucherResponse sau khi thay đổi trạng thái
     */
    VoucherResponse toggleVoucherStatus(Long id);

    /**
     * Xóa hoàn toàn một Voucher theo ID.
     *
     * @param id ID của voucher cần xóa
     */
    void deleteVoucher(Long id);
}
