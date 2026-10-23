package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    public enum ChatSender {
        user, bot, staff
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private User staff;

    @Column(name = "guest_token", length = 100)
    private String guestToken;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatSender sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "suggested_products_json", columnDefinition = "TEXT")
    private String suggestedProductsJson;

    @Column(name = "is_read", nullable = false)
    private boolean isRead;

    @Column(name = "is_violation", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isViolation = false;

    @Column(name = "violation_reason", length = 255)
    private String violationReason;

    @Column(name = "masked_content", columnDefinition = "TEXT")
    private String maskedContent;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
