package com.web.ap_sports.dto.request.admin;

import com.web.ap_sports.enums.InboundActionType;
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
public class CreateProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 255, message = "Slug sản phẩm không được vượt quá 255 ký tự")
    private String slug; // Auto-generated from name if left empty

    @NotEmpty(message = "Sản phẩm phải thuộc ít nhất một danh mục")
    @Builder.Default
    private Set<Long> categoryIds = new HashSet<>();

    private Long primaryCategoryId; // If null, uses first category in categoryIds

    private String description;

    @NotNull(message = "Giá gốc sản phẩm không được để trống")
    @PositiveOrZero(message = "Giá gốc phải lớn hơn hoặc bằng 0")
    private BigDecimal price;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Size(max = 50, message = "Đơn vị tính không được vượt quá 50 ký tự")
    private String unit;

    @Min(value = 1, message = "Trọng lượng sản phẩm phải lớn hơn 0")
    private Integer weight; // Tính bằng grams, mặc định 500g nếu bỏ trống

    private String mainImage;

    @Builder.Default
    private Map<String, String> specifications = new HashMap<>();

    @NotEmpty(message = "Sản phẩm phải có ít nhất một biến thể")
    @Valid
    @Builder.Default
    private List<VariantRequest> variants = new ArrayList<>();

    /**
     * Tùy chọn xử lý nhập kho ban đầu:
     * NONE: Không nhập kho ban đầu (mặc định)
     * DIRECT_IMPORT: Lập phiếu nhập kho nhanh (chỉ dành cho ADMIN)
     * IMPORT_REQUEST: Gửi yêu cầu nhập kho đến Quản lý kho (dành cho cả ADMIN và STAFF)
     */
    @Builder.Default
    private InboundActionType inboundAction = InboundActionType.NONE;

    private Long supplierId;

    private String importNote;
}
