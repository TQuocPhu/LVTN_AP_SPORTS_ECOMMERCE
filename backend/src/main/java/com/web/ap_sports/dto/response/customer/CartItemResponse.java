package com.web.ap_sports.dto.response.customer;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String mainImage;

    private Long variantId;
    private String sku;
    private String size;
    private String color;
    private String variantName;

    private BigDecimal price;
    private Integer stockQuantity;
    private Integer quantity;
    private BigDecimal subtotal;

    private Boolean inStock;
}
