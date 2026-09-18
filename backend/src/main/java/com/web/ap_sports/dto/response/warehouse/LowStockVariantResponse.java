package com.web.ap_sports.dto.response.warehouse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LowStockVariantResponse {
    private Long variantId;
    private Long productId;
    private String productName;
    private String productSlug;
    private String mainImage;
    private String sku;
    private String size;
    private String color;
    private Integer stockQuantity;
    private BigDecimal price;
    private BigDecimal costPrice;
    private String status;
}
