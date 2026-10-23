package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_messages", indexes = {
    @Index(name = "idx_support_msg_conv_created", columnList = "conversation_id, created_at ASC")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private SupportConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id") // Nullable cho SYSTEM notifications
    private User sender;

    @Column(name = "sender_role", nullable = false, length = 20)
    private String senderRole; // CUSTOMER, STAFF, SYSTEM

    @Column(columnDefinition = "TEXT")
    private String content; // Nullable neu chi gui anh

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl; // Link anh Cloudinary

    @Column(name = "is_violation", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isViolation = false;

    @Column(name = "violation_reason", length = 255)
    private String violationReason;

    @Column(name = "masked_content", columnDefinition = "TEXT")
    private String maskedContent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
