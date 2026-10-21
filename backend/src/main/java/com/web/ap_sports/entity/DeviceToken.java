package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_tokens", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"device_token"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_token", nullable = false)
    private String deviceToken;

    @Column(name = "os_type")
    private String osType; // e.g. ANDROID, IOS, WEB

    @Column(name = "device_name")
    private String deviceName; // e.g. Chrome Windows, Samsung Galaxy S24

    @Column(name = "last_ip")
    private String lastIp;

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
