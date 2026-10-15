package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_reports", indexes = {
    @Index(name = "idx_support_report_status", columnList = "status, created_at DESC"),
    @Index(name = "idx_support_report_customer", columnList = "reported_customer_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private SupportConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_customer_id", nullable = false)
    private User reportedCustomer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_staff_id", nullable = false)
    private User reportedByStaff;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason; // Ly do bao cao vi pham

    @Column(name = "evidence_image_urls", columnDefinition = "TEXT")
    private String evidenceImageUrls; // Link anh bang chung Cloudinary (reports folder)

    @Column(nullable = false, length = 20)
    private String status; // PENDING, PROCESSED, REJECTED

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_admin_id")
    private User processedByAdmin;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) status = "PENDING";
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
