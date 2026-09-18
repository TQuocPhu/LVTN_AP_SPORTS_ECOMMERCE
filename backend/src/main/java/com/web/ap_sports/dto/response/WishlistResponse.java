package com.web.ap_sports.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {
    private Long id;
    private Long productId;
    private String name;
    private String slug;
    private String mainImage;
    private BigDecimal price;
    private BigDecimal salePrice;
    private String unit;
    private Boolean inStock;
    private String primaryCategoryName;
    private LocalDateTime addedAt;
}
