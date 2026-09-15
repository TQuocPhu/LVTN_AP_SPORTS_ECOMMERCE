package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA Entity lưu trữ Refresh Token phía Backend CSDL.
 * Chuỗi token được băm bằng thuật toán HMAC-SHA256 với secret key JWT_REFRESH_SECRET để bảo vệ khi CSDL rò rỉ.
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Chuỗi Hash HMAC-SHA256 của Refresh Token (Unique).
     */
    @Column(nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "previous_token", length = 500)
    private String previousToken;

    @Column(name = "last_rotated_at")
    private LocalDateTime lastRotatedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    private boolean revoked = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
