package com.web.ap_sports.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO biểu diễn một dòng Phiếu Giao Dịch Nhập / Xuất Kho trong Modal Bảng Thống Kê
 * khi người dùng click vào biểu đồ Cân đối Nhập - Xuất kho trên Báo cáo kho hoặc Dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseDrilldownTransactionResponse {

    private Long transactionId;
    private String ticketCode;
    /**
     * IMPORT hoặc EXPORT
     */
    private String transactionType;
    private String productName;
    private String sku;
    private String variantLabel;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalAmount;
    private String supplierName;
    private String createdByName;
    private String note;
    private LocalDateTime createdAt;
}
