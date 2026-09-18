package com.web.ap_sports.dto.response.warehouse;

import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransactionResponse {
    private Long id;
    private String ticketNumber;
    private Long variantId;
    private String variantSku;
    private String variantSize;
    private String variantColor;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productMainImage;
    private Long supplierId;
    private String supplierName;
    private String supplierCode;
    private TransactionType type;
    private Integer quantity;
    private BigDecimal unitCost;
    private BigDecimal totalAmount;
    private String note;
    private Long createdByUserId;
    private String createdByUserName;
    private LocalDateTime createdAt;
}
