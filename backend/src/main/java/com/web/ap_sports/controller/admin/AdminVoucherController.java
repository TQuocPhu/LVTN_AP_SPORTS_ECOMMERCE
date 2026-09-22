package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.request.admin.VoucherFilterRequest;
import com.web.ap_sports.dto.request.admin.VoucherRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.common.VoucherResponse;
import com.web.ap_sports.service.admin.AdminVoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản trị (Admin REST Controller) dành riêng cho quản lý Mã Giảm Giá / Voucher.
 * Đường dẫn cơ sở: /api/v1/admin/vouchers
 * Phân quyền: Cần quyền Admin/Staff tùy cấu hình Security
 */
@RestController
@RequestMapping("/api/v1/admin/vouchers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminVoucherController {

    private final AdminVoucherService adminVoucherService;

    /**
     * API lấy danh sách voucher có hỗ trợ Tìm kiếm, Lọc theo loại/trạng thái/hạn sử dụng và Sắp xếp đa tiêu chí + Phân trang.
     *
     * @param filter DTO chứa các thông tin lọc, từ khóa và tham số phân trang, sắp xếp
     * @return Trang (Page) chứa danh sách các VoucherResponse bọc trong ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<VoucherResponse>>> getVouchers(@Valid @ModelAttribute VoucherFilterRequest filter) {
        log.info("Admin truy vấn danh sách voucher với bộ lọc: {}", filter);
        Page<VoucherResponse> result = adminVoucherService.getVouchers(filter);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách mã giảm giá thành công", result));
    }

    /**
     * API xem chi tiết thông tin voucher theo ID.
     *
     * @param id ID của voucher cần xem
     * @return VoucherResponse thông tin chi tiết bọc trong ApiResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherById(@PathVariable Long id) {
        log.info("Admin xem chi tiết voucher ID: {}", id);
        VoucherResponse response = adminVoucherService.getVoucherById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin chi tiết mã giảm giá thành công", response));
    }

    /**
     * API tạo mới Voucher / Mã giảm giá.
     *
     * @param request DTO chứa các thông tin tạo voucher mới
     * @return VoucherResponse thông tin voucher vừa được tạo bọc trong ApiResponse
     */
    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@Valid @RequestBody VoucherRequest request) {
        log.info("Admin gửi yêu cầu tạo voucher mới: {}", request.getCode());
        VoucherResponse created = adminVoucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Tạo mới mã giảm giá thành công", created));
    }

    /**
     * API cập nhật thông tin Voucher theo ID.
     *
     * @param id ID của voucher cần chỉnh sửa
     * @param request DTO thông tin cập nhật
     * @return VoucherResponse thông tin voucher sau khi cập nhật thành công bọc trong ApiResponse
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request) {
        log.info("Admin cập nhật voucher ID: {}", id);
        VoucherResponse updated = adminVoucherService.updateVoucher(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật mã giảm giá thành công", updated));
    }

    /**
     * API xóa Voucher theo ID.
     *
     * @param id ID của voucher cần xóa
     * @return Phản hồi thành công bọc trong ApiResponse
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVoucher(@PathVariable Long id) {
        log.info("Admin xóa voucher ID: {}", id);
        adminVoucherService.deleteVoucher(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa mã giảm giá thành công", null));
    }

    /**
     * API bật / tắt nhanh trạng thái kích hoạt (isActive) của Voucher.
     *
     * @param id ID của voucher cần đổi trạng thái
     * @return VoucherResponse sau khi đã thay đổi trạng thái bọc trong ApiResponse
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<VoucherResponse>> toggleVoucherStatus(@PathVariable Long id) {
        log.info("Admin thay đổi trạng thái kích hoạt của voucher ID: {}", id);
        VoucherResponse response = adminVoucherService.toggleVoucherStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Đổi trạng thái mã giảm giá thành công", response));
    }
}
