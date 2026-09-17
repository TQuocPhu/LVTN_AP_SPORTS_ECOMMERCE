package com.web.ap_sports.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 255, message = "Tên danh mục không được vượt quá 255 ký tự")
    private String name;

    @Size(max = 255, message = "Slug không được vượt quá 255 ký tự")
    private String slug;

    @Size(max = 5000, message = "Mô tả không được vượt quá 5000 ký tự")
    private String description;

    /**
     * Chuỗi ảnh Base64 hoặc URL (Chỉ áp dụng cho danh mục gốc khi parentId == null)
     */
    private String image;

    /**
     * ID danh mục cha (Null nếu là danh mục gốc)
     */
    @Positive(message = "ID danh mục cha phải là số nguyên dương")
    private Long parentId;
}
