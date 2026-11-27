package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO phản hồi cho Bảng Đối Soát Tài Chính & Sổ Cái Dòng Tiền Theo Ngày / Kênh Thanh Toán.
 * Đảm bảo phương trình cân đối: grossRevenue = netCollectedRevenue + pendingReconciliationRevenue + lostCancelledRevenue.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialReconciliationResponse {
    private long totalOrders;
    private BigDecimal grossRevenue;
    private BigDecimal totalDiscountAmount;
    private BigDecimal totalShippingFee;
    private BigDecimal vnpayCollectedRevenue;
    private BigDecimal codCollectedRevenue;
    private BigDecimal netCollectedRevenue;
    private BigDecimal vnpayPrepaidPendingRevenue;
    private BigDecimal pendingReconciliationRevenue;
    private BigDecimal lostCancelledRevenue;
    private BigDecimal cancelledUnpaidRevenue;
    private BigDecimal paymentFailedRevenue;
    private BigDecimal pendingRefundRevenue;
    private long pendingRefundCount;
    private BigDecimal refundedRevenue;
    private long refundedCount;
    private double collectionRate;

    private List<DailyReconciliationRow> dailyRows;
    private List<ReconciliationExceptionItem> exceptions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyReconciliationRow {
        private String date; // yyyy-MM-dd
        private String label; // dd/MM/yyyy
        private long orderCount;
        private BigDecimal grossRevenue;
        private BigDecimal discountAmount;
        private BigDecimal shippingFee;
        private BigDecimal vnpayCollectedRevenue;
        private BigDecimal codCollectedRevenue;
        private BigDecimal netCollectedRevenue;
        private BigDecimal vnpayPrepaidPendingRevenue;
        private BigDecimal pendingReconciliationRevenue;
        private BigDecimal cancelledUnpaidRevenue;
        private BigDecimal pendingRefundRevenue;
        private BigDecimal refundedRevenue;
        private BigDecimal lostCancelledRevenue;
        private double collectionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReconciliationExceptionItem {
        private Long orderId;
        private String orderCode;
        private String customerName;
        private String paymentMethod;
        private String paymentStatus;
        private String orderStatus;
        private BigDecimal amount;
        private String issueDescription;
        private LocalDateTime createdAt;
    }
}
