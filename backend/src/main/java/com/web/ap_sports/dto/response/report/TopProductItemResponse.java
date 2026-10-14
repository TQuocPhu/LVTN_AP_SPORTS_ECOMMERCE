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
public class TopProductItemResponse {
    private Long productId;
    private String productName;
    private String slug;
    private String image;
    private long totalQuantitySold;
    private BigDecimal totalRevenue;
}
