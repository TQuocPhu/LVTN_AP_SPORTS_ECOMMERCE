package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_conversations", indexes = {
    @Index(name = "idx_support_conv_customer", columnList = "customer_id, last_message_at DESC"),
    @Index(name = "idx_support_conv_status", columnList = "status, last_message_at ASC"),
    @Index(name = "idx_support_conv_staff", columnList = "staff_id, last_message_at DESC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false, length = 20)
    private String status; // WAITING, IN_PROGRESS, RESOLVED, CLOSED

    @Column(length = 255)
    private String subject;

    @Column(name = "customer_last_read_at")
    private LocalDateTime customerLastReadAt;

    @Column(name = "staff_last_read_at")
    private LocalDateTime staffLastReadAt;

    @Column(name = "last_message_at", nullable = false)
    private LocalDateTime lastMessageAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "rating")
    private Integer rating; // 1 to 5 stars

    @Column(name = "feedback_note", columnDefinition = "TEXT")
    private String feedbackNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "WAITING";
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        lastMessageAt = now;
        customerLastReadAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
