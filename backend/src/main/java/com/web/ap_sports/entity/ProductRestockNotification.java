package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Thực thể lưu trữ danh sách khách hàng đăng ký nhận thông báo tự động khi sản phẩm/biến thể có hàng trở lại.
 * Đảm bảo 1 khách hàng chỉ có tối đa 1 thông báo ở trạng thái PENDING cho mỗi biến thể.
 */
@Entity
@Table(
    name = "product_restock_notifications",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_user_variant_pending",
            columnNames = {"user_id", "variant_id", "status"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRestockNotification {

    public enum Status {
        PENDING,   // Đang chờ hàng về
        NOTIFIED,  // Đã bắn thông báo & gửi email
        CANCELLED  // Người dùng chủ động hủy nhận tin
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người dùng đăng ký nhận tin (Bắt buộc đăng nhập để bảo mật chống spam)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Sản phẩm liên kết
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Biến thể cụ thể khách hàng đang chờ (Ví dụ: Giày size 41, Áo size L)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    // Email nhận tin (lấy trực tiếp từ tài khoản người dùng)
    @Column(nullable = false)
    private String email;

    // Trạng thái thông báo
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    // Thời gian đăng ký nhận tin
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Thời gian hệ thống tự động bắn thông báo khi hàng về kho
    private LocalDateTime notifiedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = Status.PENDING;
        }
    }
}
