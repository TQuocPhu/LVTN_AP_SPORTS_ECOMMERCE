package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO yêu cầu Tạo mới hoặc Cập nhật Voucher / Mã Giảm Giá phía Quản trị viên (Admin).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherRequest {

    /**
     * Mã voucher unique (ví dụ: APSSUMMER50, FREESHIP30K). Tự động in hoa khi lưu.
     */
    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    /**
     * Tên hiển thị ngắn gọn mô tả voucher (ví dụ: Giảm 50K Đơn 200K)
     */
    @NotBlank(message = "Tên hiển thị voucher không được để trống")
    private String name;

    /**
     * Mô tả chi tiết điều kiện áp dụng voucher
     */
    private String description;

    /**
     * Loại mã giảm giá: FIXED (Số tiền cố định), PERCENT (Phần trăm), FREESHIP (Giảm ship)
     */
    @NotBlank(message = "Loại voucher không được để trống")
    private String type;

    /**
     * Giá trị giảm (Ví dụ: 15 cho PERCENT 15%, hoặc 50000 cho FIXED 50.000 VNĐ)
     */
    @NotNull(message = "Giá trị giảm không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal value;

    /**
     * Số tiền giảm tối đa (Áp dụng khi type = PERCENT hoặc FREESHIP, ví dụ: giảm 20% tối đa 100k)
     */
    private BigDecimal maxDiscountAmount;

    /**
     * Giá trị đơn hàng tối thiểu để đủ điều kiện áp dụng mã
     */
    @DecimalMin(value = "0.0", message = "Giá trị đơn tối thiểu không được âm")
    private BigDecimal minOrderValue;

    /**
     * Giới hạn tổng số lượt sử dụng voucher của toàn hệ thống
     */
    @Min(value = 1, message = "Số lượt sử dụng phải từ 1 trở lên")
    private Integer usageLimit;

    /**
     * Giới hạn số lần 1 tài khoản người dùng được áp dụng mã này
     */
    @Min(value = 1, message = "Số lượt dùng của 1 tài khoản phải từ 1 trở lên")
    private Integer userUsageLimit;

    /**
     * Phân loại áp dụng voucher (ALL, FREESHIP, FASHION, APPAREL, SHOES...)
     */
    private String categoryScope;

    /**
     * Ngày giờ bắt đầu có hiệu lực
     */
    private LocalDateTime startsAt;

    /**
     * Ngày giờ hết hạn sử dụng
     */
    private LocalDateTime expiresAt;

    /**
     * Trạng thái kích hoạt mã (true = Hoạt động, false = Tạm dừng)
     */
    private Boolean isActive;
}
