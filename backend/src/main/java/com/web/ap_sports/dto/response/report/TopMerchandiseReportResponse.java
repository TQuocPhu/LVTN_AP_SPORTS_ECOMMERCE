package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopMerchandiseReportResponse {
    private List<TopProductItemResponse> topProducts;
    private List<CategoryRevenueItemResponse> categoryBreakdown;
}
