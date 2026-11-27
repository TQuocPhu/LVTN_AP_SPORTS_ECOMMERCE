package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Thực thể lưu trữ Đánh giá Giao hàng / Shipper của khách hàng cho từng đơn hàng.
 * Ràng buộc 1-1 theo order_id để mỗi đơn hàng hoàn tất chỉ được đánh giá giao hàng một lần.
 */
@Entity
@Table(name = "delivery_reviews", uniqueConstraints = {
        @UniqueConstraint(name = "uk_delivery_reviews_order", columnNames = "order_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipper_id")
    private User shipper;

    @Column(nullable = false)
    private Integer rating; // 1 - 5 sao

    @Column(length = 500)
    private String tags; // Danh sách thẻ tiêu chí phân cách bởi dấu phẩy

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "admin_reply", columnDefinition = "TEXT")
    private String adminReply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replied_by_user_id")
    private User repliedBy;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    @Column(nullable = false, length = 20)
    private String status; // approved, hidden

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "approved";
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
