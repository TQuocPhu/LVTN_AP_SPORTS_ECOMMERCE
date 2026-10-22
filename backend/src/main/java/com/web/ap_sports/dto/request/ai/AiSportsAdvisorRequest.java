package com.web.ap_sports.dto.request.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request gửi từ Client (Web/Mobile) tới Trợ lý AI Sports Advisor để tư vấn size và đồ thể thao.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSportsAdvisorRequest {

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    @Size(max = 400, message = "Câu hỏi tối đa 400 ký tự")
    private String question;

    // Slug hoặc ID sản phẩm mà khách hàng đang xem hoặc đang hỏi xoay quanh (nếu có)
    private String activeProductSlug;

    // Token định danh khách vãng lai (nếu chưa đăng nhập)
    private String guestToken;
}
