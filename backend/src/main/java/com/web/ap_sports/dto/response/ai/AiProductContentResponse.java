package com.web.ap_sports.dto.response.ai;

import lombok.*;

/**
 * DTO phản hồi nội dung sản phẩm do AI sinh cho quản trị viên/nhân viên nội dung.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiProductContentResponse {

    // Đoạn mã HTML bài viết chi tiết để đưa vào RichTextEditor
    private String htmlContent;

    // Tiêu đề gợi ý chuẩn SEO Google
    private String seoTitle;

    // Thẻ mô tả tóm tắt chuẩn SEO (Meta description < 160 ký tự)
    private String metaDescription;
}
