package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseReportResponse {
    private BigDecimal totalInventoryValue;
    private long totalStockQuantity;
    private long lowStockVariantCount;
    private long outOfStockVariantCount;
    private long inboundQuantityInPeriod;
    private long outboundQuantityInPeriod;
    private long orderOutboundQuantity;
    private long manualOutboundQuantity;
    private List<LowStockVariantItemResponse> lowStockVariants;
}
