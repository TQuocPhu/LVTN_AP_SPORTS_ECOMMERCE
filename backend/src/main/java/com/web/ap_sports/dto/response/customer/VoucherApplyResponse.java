package com.web.ap_sports.dto.response.customer;

import com.web.ap_sports.dto.response.common.VoucherResponse;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO kết quả tính toán áp dụng Voucher cho giỏ hàng / đơn hàng của Khách hàng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplyResponse {

    /**
     * cờ báo mã giảm giá có hợp lệ và được áp dụng thành công hay không
     */
    private boolean valid;

    /**
     * Thông điệp giải thích thành công hoặc lý do không thể sử dụng mã
     */
    private String message;

    /**
     * Mã voucher
     */
    private String couponCode;

    /**
     * Tên hiển thị của voucher
     */
    private String couponName;

    /**
     * Loại voucher (FIXED, PERCENT, FREESHIP)
     */
    private String discountType;

    /**
     * Giá trị thiết lập ban đầu (ví dụ 10% hoặc 50.000 VNĐ)
     */
    private BigDecimal discountValue;

    /**
     * Số tiền thực tế được giảm trừ vào đơn hàng
     */
    private BigDecimal discountAmount;

    /**
     * Phí ship được giảm trừ (dành riêng cho loại FREESHIP)
     */
    private BigDecimal freeShippingDiscount;

    /**
     * Tổng số tiền khách hàng cần thanh toán sau khi trừ giảm giá
     */
    private BigDecimal finalAmount;

    /**
     * Chi tiết DTO Voucher đã được áp dụng
     */
    private VoucherResponse voucher;

    // Alias getters for frontend compatibility
    public String getCode() {
        return couponCode;
    }

    public String getName() {
        return couponName;
    }

    public String getType() {
        return discountType;
    }

    public BigDecimal getFinalOrderTotal() {
        return finalAmount;
    }
}
