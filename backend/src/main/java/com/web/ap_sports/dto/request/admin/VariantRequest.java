package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.*;
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

    @Positive(message = "ID biến thể phải là số nguyên dương")
    private Long id;

    @NotBlank(message = "Mã SKU không được để trống")
    @Size(max = 255, message = "Mã SKU không được vượt quá 255 ký tự")
    private String sku;

    @NotBlank(message = "Kích thước (Size) không được để trống")
    @Size(max = 50, message = "Kích thước không được vượt quá 50 ký tự")
    private String size;

    @Size(max = 50, message = "Màu sắc không được vượt quá 50 ký tự")
    private String color;

    @NotNull(message = "Giá bán biến thể không được để trống")
    @PositiveOrZero(message = "Giá bán phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotNull(message = "Giá nhập biến thể không được để trống")
    @PositiveOrZero(message = "Giá nhập phải lớn hơn hoặc bằng 0")
    private BigDecimal costPrice;

    // Stock quantity is mandatory during creation, ignored/locked during product update
    @Min(value = 0, message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;

    @Builder.Default
    private List<String> images = new ArrayList<>();
}
