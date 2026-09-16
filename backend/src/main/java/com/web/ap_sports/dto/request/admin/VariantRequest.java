package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantRequest {

    private Long id;

    @NotBlank(message = "Mã SKU không được để trống")
    private String sku;

    @NotBlank(message = "Kích thước (Size) không được để trống")
    private String size;

    private String color;

    @NotNull(message = "Giá bán biến thể không được để trống")
    @PositiveOrZero(message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "Giá nhập biến thể không được để trống")
    @PositiveOrZero(message = "Giá nhập phải lớn hơn hoặc bằng 0")
    private BigDecimal costPrice;

    // Stock quantity is mandatory during creation, ignored/locked during product update
    private Integer stockQuantity;

    @Builder.Default
    private List<String> images = new ArrayList<>();
}
