package com.web.ap_sports.dto.request.warehouse;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAuditRequest {

    @NotNull(message = "ID biến thể sản phẩm không được để trống")
    private Long variantId;

    @NotNull(message = "Số lượng đếm thực tế không được để trống")
    @Min(value = 0, message = "Số lượng đếm thực tế không được nhỏ hơn 0")
    private Integer actualQuantity;

    private String note;
}
