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
public class CategoryRevenueItemResponse {
    private Long categoryId;
    private String categoryName;
    private long totalQuantitySold;
    private BigDecimal totalRevenue;
    private double percentage;
}
