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
public class RevenueOverviewReportResponse {
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalNetRevenue;
    private BigDecimal totalDeliveredRevenue;
    private BigDecimal totalDiscountAmount;
    private BigDecimal totalShippingFee;

    private long totalOrders;
    private long completedOrders;
    private long deliveringOrders;
    private long cancelledOrders;
    private long returnedOrders;

    private double successRate;
    private double cancellationRate;
    private BigDecimal averageOrderValue;

    private BigDecimal cashPaymentRevenue;
    private BigDecimal vnpayPaymentRevenue;

    private List<TimeSeriesPointResponse> timeSeries;
}
