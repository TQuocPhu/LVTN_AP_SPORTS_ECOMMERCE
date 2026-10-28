package com.web.ap_sports.dto.request.warehouse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO tạo Yêu Cầu Nhập Kho
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateImportRequestDto {

    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    private Long supplierId;

    private String note;

    @NotEmpty(message = "Danh sách mặt hàng nhập kho không được để trống")
    @Valid
    @Builder.Default
    private List<CreateImportRequestItemDto> items = new ArrayList<>();
}
