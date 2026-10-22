package com.web.ap_sports.dto.request.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Map;

/**
 * Request gửi từ trang Admin tạo/sửa sản phẩm để AI sinh nội dung bài viết chuẩn SEO và HTML.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiProductContentRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    private String categoryName;

    private String brand;

    // Các thuộc tính kỹ thuật: ví dụ {"Đế giày": "TF", "Chất liệu": "Da nhân tạo", "Trọng lượng": "220g"}
    private Map<String, String> attributes;

    // Tone giọng: "the_thao_manh_me", "chuyen_nghiep", "tre_trung"
    private String tone;
}
