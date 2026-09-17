package com.web.ap_sports.dto.request.admin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm không được vượt quá 255 ký tự")
    private String name;

    @NotBlank(message = "Slug sản phẩm không được để trống")
    @Size(max = 255, message = "Slug sản phẩm không được vượt quá 255 ký tự")
    private String slug;

    @NotEmpty(message = "Sản phẩm phải thuộc ít nhất một danh mục")
    @Builder.Default
    private Set<Long> categoryIds = new HashSet<>();

    private Long primaryCategoryId;

    private String description;

    @NotNull(message = "Giá gốc sản phẩm không được để trống")
    @PositiveOrZero(message = "Giá gốc phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(max = 50, message = "Đơn vị tính không được vượt quá 50 ký tự")
    private String unit;

    @Pattern(regexp = "^(in_stock|out_of_stock|discontinued)$", message = "Trạng thái sản phẩm không hợp lệ")
    private String status; // in_stock, out_of_stock, discontinued

    private String mainImage;

    @Builder.Default
    private Map<String, String> specifications = new HashMap<>();

    @NotEmpty(message = "Sản phẩm phải có ít nhất một biến thể")
    @Valid
    @Builder.Default
    private List<VariantRequest> variants = new ArrayList<>();
}
