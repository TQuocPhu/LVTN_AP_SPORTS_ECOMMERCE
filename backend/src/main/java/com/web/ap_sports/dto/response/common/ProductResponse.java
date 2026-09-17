package com.web.ap_sports.dto.response.common;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private BigDecimal price;
    private Integer totalStock;
    private String status;
    private String unit;
    private String mainImage;
    private Long primaryCategoryId;
    private String primaryCategoryName;

    @Builder.Default
    private List<CategoryResponse> categories = new ArrayList<>();

    private int variantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
