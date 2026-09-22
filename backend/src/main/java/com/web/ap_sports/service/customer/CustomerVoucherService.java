package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.ApplyVoucherRequest;
import com.web.ap_sports.dto.response.common.VoucherResponse;
import com.web.ap_sports.dto.response.customer.VoucherApplyResponse;

import java.util.List;

/**
 * Interface Service định nghĩa các nghiệp vụ xử lý Voucher dành cho khách hàng.
 * Bao gồm: Lấy danh sách kho voucher công khai (Shopee style) và Tính toán áp dụng mã giảm giá.
 */
public interface CustomerVoucherService {

    /**
     * Lấy danh sách các voucher đang hoạt động công khai hiển thị trên trang Kho Voucher (/vouchers).
     *
     * @param categoryScope Phân loại voucher muốn lọc (ví dụ: ALL, FREESHIP, FASHION, APPAREL, SHOES...). Nếu null/rỗng sẽ lấy tất cả.
     * @return Danh sách các VoucherResponse phù hợp với điều kiện hiển thị
     */
    List<VoucherResponse> getPublicVouchers(String categoryScope);

    /**
     * Kiểm tra tính hợp lệ của mã giảm giá và tính toán số tiền được giảm giá theo tổng đơn hàng.
     *
     * @param request DTO chứa thông tin mã voucher, tổng tiền đơn hàng và phí vận chuyển
     * @return VoucherApplyResponse chứa kết quả thành công/thất bại, số tiền giảm và lý do nếu không hợp lệ
     */
    VoucherApplyResponse calculateVoucherDiscount(ApplyVoucherRequest request);
}
