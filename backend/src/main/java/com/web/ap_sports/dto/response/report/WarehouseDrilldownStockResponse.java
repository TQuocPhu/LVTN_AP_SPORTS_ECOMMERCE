package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO biểu diễn một dòng Biến thể Tồn kho SKU trong Modal Bảng Thống Kê
 * khi người dùng click vào biểu đồ Tỷ lệ An toàn Tồn kho hoặc Cơ cấu Danh mục Sản phẩm.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDrilldownStockResponse {

    private Long variantId;
    private Long productId;
    private String productName;
    private String categoryName;
    private String sku;
    private String barcode;
    private String variantLabel;
    private BigDecimal costPrice;
    private BigDecimal price;
    private Integer stockQuantity;
    private BigDecimal inventoryValue;
    /**
     * SAFE (> 5), LOW (1..5), OUT (0)
     */
    private String stockStatus;
}
