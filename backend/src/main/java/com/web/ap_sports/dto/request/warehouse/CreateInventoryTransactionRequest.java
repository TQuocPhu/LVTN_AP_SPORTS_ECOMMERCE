package com.web.ap_sports.dto.request.warehouse;

import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInventoryTransactionRequest {

    private Long variantId;

    private Long supplierId;

    @NotNull(message = "Loại giao dịch kho không được để trống")
    private TransactionType type;

    private Integer quantity;

    private BigDecimal unitCost;

    private String note;

    private List<TransactionItemRequest> items;
}
