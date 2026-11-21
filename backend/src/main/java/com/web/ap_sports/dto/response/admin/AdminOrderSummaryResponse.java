package com.web.ap_sports.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderSummaryResponse {
    private long totalOrders;
    private long pendingOrders;
    private long confirmedOrders;
    private long processingOrders;
    private long shippedOrders;
    private long shippingOrders;
    private long deliveredOrders;
    private long completedOrders;
    private long cancelledOrders;
    private long returnedOrders;
    private long paymentFailedOrders;
    private BigDecimal totalRevenue;
}
