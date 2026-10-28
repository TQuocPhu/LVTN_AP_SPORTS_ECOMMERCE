package com.web.ap_sports.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Chi tiết các biến thể sản phẩm trong một Yêu Cầu Nhập Kho
 */
@Entity
@Table(name = "import_request_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_request_id", nullable = false)
    private ImportRequest importRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    /**
     * Số lượng hàng hóa do người tạo yêu cầu đề xuất nhập kho
     */
    @Column(name = "requested_quantity", nullable = false)
    private Integer requestedQuantity;

    /**
     * Số lượng hàng hóa thực tế được Quản lý kho kiểm đếm và phê duyệt nhập
     */
    @Column(name = "approved_quantity")
    private Integer approvedQuantity;

    /**
     * Đơn giá vốn dự kiến lúc lập yêu cầu (VNĐ)
     */
    @Column(name = "expected_cost_price", precision = 12, scale = 2)
    private BigDecimal expectedCostPrice;

    /**
     * Đơn giá vốn thực tế khi Quản lý kho chốt duyệt nhập (VNĐ)
     */
    @Column(name = "actual_cost_price", precision = 12, scale = 2)
    private BigDecimal actualCostPrice;
}
