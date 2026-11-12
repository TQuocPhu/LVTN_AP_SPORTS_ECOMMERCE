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
    /** Điểm đánh giá trung bình thực tế từ các đánh giá đã duyệt (status = 'approved') */
    private Double rating;
    /** Tổng số lượt đánh giá đã duyệt của sản phẩm */
    private Long reviewsCount;
    private Integer totalStock;
    private String status;
    private String unit;
    private Integer weight;
    private String mainImage;
    private Long primaryCategoryId;
    private String primaryCategoryName;

    @Builder.Default
    private List<CategoryResponse> categories = new ArrayList<>();

    private int variantCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
