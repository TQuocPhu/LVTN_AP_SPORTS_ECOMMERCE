package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockVariantItemResponse {
    private Long variantId;
    private Long productId;
    private String productName;
    private String sku;
    private String size;
    private String color;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer stockQuantity;
    private String image;
}
