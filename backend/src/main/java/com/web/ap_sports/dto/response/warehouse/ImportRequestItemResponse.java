package com.web.ap_sports.dto.response.warehouse;

import lombok.*;

import java.math.BigDecimal;

/**
 * Response chi tiết mặt hàng trong Yêu Cầu Nhập Kho
 * Sử dụng thuộc tính mở rộng động (attributes & variantName) đại diện cho mọi biến thể thể thao
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportRequestItemResponse {

    private Long id;
    private Long variantId;
    private String sku;
    private String barcode;
    
    /**
     * Chuỗi thuộc tính động JSON hoặc format hiển thị (VD: {"Màu":"Đỏ","Size":"L","Loại sân":"Cỏ nhân tạo"})
     */
    private String attributes;

    /**
     * Tên biến thể tổng hợp trực quan để hiển thị trên UI (VD: "Đỏ / L / Sân cỏ nhân tạo")
     */
    private String variantName;

    private String color;
    private String size;
    private String image;
    private Integer currentStock;
    private Integer requestedQuantity;
    private Integer approvedQuantity;
    private BigDecimal expectedCostPrice;
    private BigDecimal actualCostPrice;
}
