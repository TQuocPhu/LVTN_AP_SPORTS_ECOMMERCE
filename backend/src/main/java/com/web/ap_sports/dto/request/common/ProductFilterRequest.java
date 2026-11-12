package com.web.ap_sports.dto.request.common;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterRequest {

    private String keyword;
    private Long categoryId;
    /** Danh sách ID danh mục đã mở rộng đệ quy (bao gồm cả danh mục cha và toàn bộ danh mục con/cháu) */
    private List<Long> categoryIds;
    private String status;
    private String unit;
    private String variantSize; // XS, S, M, L, XL, XXL, 3XL
    /** Mức sao đánh giá tối thiểu (ví dụ: 4 hoặc 5) */
    private Integer rating;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDir = "DESC";
}
