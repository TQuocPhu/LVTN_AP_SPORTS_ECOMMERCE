package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng 'coupons' trong Cơ Sở Dữ Liệu (Mã Giảm Giá / Voucher Enterprise).
 */
@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    /**
     * Enum định nghĩa các loại Mã Giảm Giá:
     * - FIXED: Giảm số tiền cố định trực tiếp (ví dụ: Giảm 50.000 VNĐ)
     * - PERCENT: Giảm theo phần trăm đơn hàng (ví dụ: Giảm 15%)
     * - FREESHIP: Giảm phí vận chuyển đơn hàng (ví dụ: Miễn phí ship tối đa 30.000 VNĐ)
     */
    public enum CouponType {
        FIXED, PERCENT, FREESHIP
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CouponType type;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "min_order_value", precision = 10, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "user_usage_limit")
    private Integer userUsageLimit;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount;

    @Column(name = "category_scope", length = 50)
    private String categoryScope;

    @Column(name = "starts_at")
    private LocalDateTime startsAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (usedCount == null) usedCount = 0;
        if (userUsageLimit == null) userUsageLimit = 1;
        if (categoryScope == null || categoryScope.isBlank()) categoryScope = "ALL";
        if (status == null || status.isBlank()) status = "active";
        if (isActive == null) isActive = true;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Phương thức helper trả về boolean cho trạng thái isActive.
     */
    public boolean isActive() {
        return Boolean.TRUE.equals(isActive);
    }

    /**
     * Phương thức helper thiết lập trạng thái isActive.
     */
    public void setActive(boolean active) {
        this.isActive = active;
    }
}
