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

    // Giá vốn & Lợi nhuận gộp
    private BigDecimal totalCostOfGoodsSold;
    private BigDecimal grossProfit;
    private double grossMarginPercent;

    // Tăng trưởng so với kỳ liền trước (null nếu lọc Toàn bộ thời gian)
    private Double revenueGrowthPercent;
    private Double ordersGrowthPercent;
    private Double aovGrowthPercent;

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
