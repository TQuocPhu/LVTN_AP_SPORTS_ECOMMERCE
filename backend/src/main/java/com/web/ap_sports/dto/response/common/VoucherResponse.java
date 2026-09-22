package com.web.ap_sports.dto.response.common;

import com.web.ap_sports.entity.Coupon;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO đại diện cho dữ liệu Voucher / Mã giảm giá trả về cho Client (cả Admin và Customer).
 * Chứa các thông tin cơ bản, tính toán phần trăm đã dùng, trạng thái hiển thị tiếng Việt và tính khả dụng.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {

    private Long id;
    private String code;
    private String name;
    private String description;
    private String type; // FIXED, PERCENT, FREESHIP
    private BigDecimal value;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderValue;
    private Integer usageLimit;
    private Integer userUsageLimit;
    private Integer usedCount;
    private Double usagePercentage; // e.g., 75.5% đã được sử dụng
    private String categoryScope; // ALL, FREESHIP, FASHION, APPAREL, SHOES
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
    private String status; // active, disabled, expired, scheduled
    private boolean isActive;
    private boolean isUsable; // Đủ điều kiện hiển thị / sử dụng hay không
    private String displayStatus; // Trạng thái hiển thị tiếng Việt (Đang diễn ra, Sắp diễn ra, Hết hạn, Tạm dừng)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Phương thức chuyển đổi từ Coupon Entity sang VoucherResponse DTO.
     * Tự động tính toán các trường status, displayStatus, usagePercentage và isUsable.
     *
     * @param coupon Entity Coupon
     * @return DTO VoucherResponse chuẩn hoá
     */
    public static VoucherResponse fromEntity(Coupon coupon) {
        if (coupon == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        String calculatedStatus = "active";
        String displayStatus = "Đang diễn ra";

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            calculatedStatus = "disabled";
            displayStatus = "Tạm dừng";
        } else if (coupon.getStartsAt() != null && coupon.getStartsAt().isAfter(now)) {
            calculatedStatus = "scheduled";
            displayStatus = "Sắp diễn ra";
        } else if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(now)) {
            calculatedStatus = "expired";
            displayStatus = "Hết hạn";
        } else if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            calculatedStatus = "expired";
            displayStatus = "Đã hết lượt";
        }

        double usagePercentage = 0.0;
        if (coupon.getUsageLimit() != null && coupon.getUsageLimit() > 0 && coupon.getUsedCount() != null) {
            usagePercentage = Math.min(100.0, Math.round((coupon.getUsedCount() * 100.0 / coupon.getUsageLimit()) * 10.0) / 10.0);
        }

        boolean isUsable = Boolean.TRUE.equals(coupon.getIsActive())
                && (coupon.getStartsAt() == null || !coupon.getStartsAt().isAfter(now))
                && (coupon.getExpiresAt() == null || !coupon.getExpiresAt().isBefore(now))
                && (coupon.getUsageLimit() == null || coupon.getUsedCount() == null || coupon.getUsedCount() < coupon.getUsageLimit());

        return VoucherResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .name(coupon.getName())
                .description(coupon.getDescription())
                .type(coupon.getType() != null ? coupon.getType().name() : "FIXED")
                .value(coupon.getValue())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minOrderValue(coupon.getMinOrderValue())
                .usageLimit(coupon.getUsageLimit())
                .userUsageLimit(coupon.getUserUsageLimit())
                .usedCount(coupon.getUsedCount() != null ? coupon.getUsedCount() : 0)
                .usagePercentage(usagePercentage)
                .categoryScope(coupon.getCategoryScope() != null ? coupon.getCategoryScope() : "ALL")
                .startsAt(coupon.getStartsAt())
                .expiresAt(coupon.getExpiresAt())
                .status(calculatedStatus)
                .displayStatus(displayStatus)
                .isActive(Boolean.TRUE.equals(coupon.getIsActive()))
                .isUsable(isUsable)
                .createdAt(coupon.getCreatedAt())
                .updatedAt(coupon.getUpdatedAt())
                .build();
    }
}
