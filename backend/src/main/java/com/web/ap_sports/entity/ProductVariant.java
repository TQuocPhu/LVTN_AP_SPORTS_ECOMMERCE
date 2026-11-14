package com.web.ap_sports.entity;

import com.web.ap_sports.enums.ProductVariantStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(name = "barcode", unique = true, length = 50)
    private String barcode;

    private String size; // Size số: 38..43 hoặc Size chữ: S..XXL

    private String color;

    @Column(columnDefinition = "TEXT")
    private String attributes; // JSON text hoặc chuỗi thuộc tính biến thể mở rộng (VD: {"Loại sân":"AG","Size":"5"})

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "cost_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ProductVariantStatus status = ProductVariantStatus.ACTIVE;

    @Version
    private Long version;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<ProductImage> images = new java.util.ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (stockQuantity == null) stockQuantity = 0;
        if (barcode == null || barcode.trim().isEmpty()) {
            barcode = buildSafeBarcodeFromSku(sku);
        } else if (barcode.length() > 50) {
            barcode = buildSafeBarcodeFromSku(barcode);
        }
        if (status == null) {
            status = ProductVariantStatus.ACTIVE;
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Đảm bảo barcode luôn vừa giới hạn VARCHAR(50) của DB và không bị trùng lặp nếu SKU dài > 50 ký tự.
     */
    private static String buildSafeBarcodeFromSku(String source) {
        if (source == null) return null;
        String trimmed = source.trim();
        if (trimmed.length() <= 50) {
            return trimmed;
        }
        java.util.zip.CRC32 crc = new java.util.zip.CRC32();
        crc.update(trimmed.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        String hashHex = String.format("%08X", crc.getValue());
        return trimmed.substring(0, 41) + "-" + hashHex;
    }

    @PreUpdate
    protected void onUpdate() {
        if (status == null) {
            status = ProductVariantStatus.ACTIVE;
        }
        updatedAt = LocalDateTime.now();
    }
}
