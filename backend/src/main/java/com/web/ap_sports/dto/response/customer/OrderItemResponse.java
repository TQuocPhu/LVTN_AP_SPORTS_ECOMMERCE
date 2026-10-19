package com.web.ap_sports.dto.response.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private Long variantId;
    private String sku;
    private String barcode;
    private String color;
    private String size;
    private String attributes;
    private String variantSummary;
    private Integer quantity;
    private BigDecimal price;
    private String image;
    private boolean isReviewed;
}
