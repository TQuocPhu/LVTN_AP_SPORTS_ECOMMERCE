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
public class StaffPerformanceReportResponse {
    private Long staffId;
    private String staffName;
    private String staffEmail;
    private String staffRole;
    private String staffAvatar;
    private String employeeCode;

    private long totalHandledOrders;
    private long completedOrders;
    private long deliveringOrders;
    private long cancelledOrders;

    private double successRate;
    private double cancellationRate;

    private BigDecimal deliveredRevenue;
    private BigDecimal averageOrderValue;

    private BigDecimal commissionRate;
    private BigDecimal estimatedCommission;
    private BigDecimal kpiBonus;
    private BigDecimal totalEstimatedEarnings;

    private String performanceBadge; // EXCELLENT, GOOD, STANDARD, NEEDS_IMPROVEMENT
}
