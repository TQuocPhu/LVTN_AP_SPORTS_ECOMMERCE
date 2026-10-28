package com.web.ap_sports.dto.request.warehouse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO Quản lý kho phê duyệt và chốt số lượng thực tế nhập kho
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApproveImportRequestDto {

    @NotNull(message = "Vui lòng chọn Nhà cung cấp khi phê duyệt nhập kho")
    private Long supplierId;

    private String note;

    @NotEmpty(message = "Danh sách kiểm đếm thực nhập không được để trống")
    @Valid
    @Builder.Default
    private List<ApproveItemDto> items = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApproveItemDto {

        @NotNull(message = "ID dòng yêu cầu nhập kho không được để trống")
        private Long itemId;

        @NotNull(message = "Số lượng thực nhập không được để trống")
        private Integer approvedQuantity;

        private BigDecimal actualCostPrice;
    }
}
