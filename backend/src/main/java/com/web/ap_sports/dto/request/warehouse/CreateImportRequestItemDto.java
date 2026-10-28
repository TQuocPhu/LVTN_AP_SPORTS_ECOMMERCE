package com.web.ap_sports.dto.request.warehouse;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTO chi tiết biến thể khi lập yêu cầu nhập kho
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateImportRequestItemDto {

    @NotNull(message = "ID biến thể không được để trống")
    private Long variantId;

    @NotNull(message = "Số lượng yêu cầu không được để trống")
    @Min(value = 1, message = "Số lượng yêu cầu nhập kho phải lớn hơn 0")
    private Integer requestedQuantity;

    private BigDecimal expectedCostPrice;
}
