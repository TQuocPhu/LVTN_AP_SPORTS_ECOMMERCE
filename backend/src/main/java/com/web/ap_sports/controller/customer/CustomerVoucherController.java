package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.ApplyVoucherRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.common.VoucherResponse;
import com.web.ap_sports.dto.response.customer.VoucherApplyResponse;
import com.web.ap_sports.service.customer.CustomerVoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dành cho Khách hàng (Customer REST Controller) thao tác với Mã Giảm Giá / Voucher.
 * Đường dẫn cơ sở: /api/v1/customer/vouchers
 * Phục vụ cho Kho Voucher Shopee-style (/vouchers) và Giỏ hàng / Đặt hàng (Cart/Checkout).
 */
@RestController
@RequestMapping("/api/v1/customer/vouchers")
@RequiredArgsConstructor
@Slf4j
public class CustomerVoucherController {

    private final CustomerVoucherService customerVoucherService;

    /**
     * API lấy danh sách các voucher đang phát hành công khai cho khách hàng săn/sử dụng.
     *
     * @param categoryScope Lọc theo phân loại áp dụng (ví dụ: ALL, FREESHIP, FASHION, APPAREL, SHOES...). Mặc định lấy ALL.
     * @return Danh sách các VoucherResponse đang hiệu lực bọc trong ApiResponse
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getPublicVouchers(
            @RequestParam(required = false, defaultValue = "ALL") String categoryScope) {
        log.info("Khách hàng truy vấn danh sách voucher công khai categoryScope: {}", categoryScope);
        List<VoucherResponse> vouchers = customerVoucherService.getPublicVouchers(categoryScope);
        return ResponseEntity.ok(ApiResponse.success("Lấy kho voucher công khai thành công", vouchers));
    }

    /**
     * API kiểm tra mã voucher và tính toán mức giảm giá trực tiếp cho đơn hàng/giỏ hàng.
     *
     * @param request DTO chứa thông tin mã voucher, tổng tiền đơn hàng và phí ship
     * @return VoucherApplyResponse kết quả tính toán giảm giá bọc trong ApiResponse
     */
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<VoucherApplyResponse>> calculateDiscount(@Valid @RequestBody ApplyVoucherRequest request) {
        log.info("Khách hàng kiểm tra áp dụng mã voucher [{}] cho tổng tiền đơn hàng {} VNĐ", request.getCode(), request.getOrderAmount());
        VoucherApplyResponse response = customerVoucherService.calculateVoucherDiscount(request);
        return ResponseEntity.ok(ApiResponse.success("Tính toán giảm giá voucher thành công", response));
    }
}
