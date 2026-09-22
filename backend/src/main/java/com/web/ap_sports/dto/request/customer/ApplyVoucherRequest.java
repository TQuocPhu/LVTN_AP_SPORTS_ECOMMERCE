package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO yêu cầu kiểm tra và tính toán giảm giá của Mã Voucher phía Khách hàng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyVoucherRequest {

    /**
     * Mã giảm giá / Voucher code nhập từ ô tìm kiếm hoặc click chọn từ Kho Voucher
     */
    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    /**
     * Tổng giá trị đơn hàng (chưa trừ giảm giá và phí ship)
     */
    @NotNull(message = "Tổng tiền hàng không được để trống")
    @DecimalMin(value = "0.0", message = "Tổng tiền hàng phải từ 0 trở lên")
    private BigDecimal orderAmount;

    /**
     * Phí vận chuyển ước tính của đơn hàng (dùng cho loại voucher FREESHIP)
     */
    @DecimalMin(value = "0.0", message = "Phí vận chuyển phải từ 0 trở lên")
    private BigDecimal shippingFee;

    /**
     * Getter hỗ trợ gọi thay thế cho orderAmount.
     */
    public BigDecimal getOrderTotal() {
        return orderAmount;
    }

    /**
     * Setter hỗ trợ gán orderTotal sang orderAmount.
     */
    public void setOrderTotal(BigDecimal orderTotal) {
        this.orderAmount = orderTotal;
    }
}
