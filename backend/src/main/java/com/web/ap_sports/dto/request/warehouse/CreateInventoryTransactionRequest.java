package com.web.ap_sports.dto.request.warehouse;

import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import jakarta.validation.constraints.AssertTrue;
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

    private String code;

    private Long variantId;

    private Long supplierId;

    @NotNull(message = "Loại giao dịch kho không được để trống")
    private TransactionType type;

    private Integer quantity;

    private BigDecimal unitCost;

    private String note;

    private List<TransactionItemRequest> items;

    /**
     * Chỉ bắt buộc chọn Nhà cung cấp khi loại giao dịch là IMPORT (Nhập kho).
     * Các giao dịch EXPORT / ADJUSTMENT vẫn cho phép để trống supplierId.
     */
    @AssertTrue(message = "Vui lòng chọn Nhà cung cấp cho phiếu nhập kho")
    public boolean isSupplierValidForImport() {
        return type != TransactionType.IMPORT || supplierId != null;
    }
}
