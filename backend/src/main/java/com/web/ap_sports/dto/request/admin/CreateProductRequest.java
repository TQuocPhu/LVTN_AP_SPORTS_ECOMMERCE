package com.web.ap_sports.dto.request.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String slug; // Auto-generated from name if left empty

    @NotEmpty(message = "Sản phẩm phải thuộc ít nhất một danh mục")
    @Builder.Default
    private Set<Long> categoryIds = new HashSet<>();

    private Long primaryCategoryId; // If null, uses first category in categoryIds

    private String description;

    @NotNull(message = "Giá gốc sản phẩm không được để trống")
    @PositiveOrZero(message = "Giá gốc phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    private String unit;

    private String mainImage;

    @Builder.Default
    private Map<String, String> specifications = new HashMap<>();

    @NotEmpty(message = "Sản phẩm phải có ít nhất một biến thể")
    @Valid
    @Builder.Default
    private List<VariantRequest> variants = new ArrayList<>();
}
