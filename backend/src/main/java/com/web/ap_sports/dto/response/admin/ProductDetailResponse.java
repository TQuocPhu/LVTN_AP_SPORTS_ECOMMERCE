package com.web.ap_sports.dto.response.admin;

import com.web.ap_sports.dto.response.common.CategoryResponse;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Integer totalStock;
    private String status;
    private String unit;
    private String mainImage;
    private Long primaryCategoryId;
    private String primaryCategoryName;

    @Builder.Default
    private List<CategoryResponse> categories = new ArrayList<>();

    @Builder.Default
    private Map<String, String> specifications = new HashMap<>();

    @Builder.Default
    private List<VariantResponse> variants = new ArrayList<>();

    @Builder.Default
    private List<String> allImages = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
