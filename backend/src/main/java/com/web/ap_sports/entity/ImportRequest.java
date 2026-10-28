package com.web.ap_sports.entity;

import com.web.ap_sports.enums.ImportRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Phiếu Yêu Cầu Nhập Kho sản phẩm (Import Request)
 * Được gửi từ Nhân viên (Staff) hoặc Quản trị viên (Admin) tới bộ phận Quản lý kho.
 */
@Entity
@Table(name = "import_requests", indexes = {
    @Index(name = "idx_import_req_status", columnList = "status"),
    @Index(name = "idx_import_req_code", columnList = "code", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // Ví dụ: YCNK-20261029-XXXX

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ImportRequestStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedBy;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * Mã phiếu nhập kho chính thức phát sinh sau khi Quản lý kho duyệt (PNK-yyyyMMdd-XXXX)
     */
    @Column(name = "import_ticket_code", length = 50)
    private String importTicketCode;

    @OneToMany(mappedBy = "importRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ImportRequestItem> items = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ImportRequestStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
