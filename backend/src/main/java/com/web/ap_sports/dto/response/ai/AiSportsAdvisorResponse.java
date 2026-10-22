package com.web.ap_sports.dto.response.ai;

import lombok.*;

import java.util.List;

/**
 * DTO phản hồi từ Trợ lý AI Sports Advisor gửi về cho Client (Web/Mobile).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSportsAdvisorResponse {

    // Câu trả lời tư vấn chi tiết từ AI
    private String reply;

    // Danh sách sản phẩm được AI đề xuất (gồm link và thông tin cơ bản để client hiển thị thẻ)
    private List<SuggestedProduct> suggestedProducts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuggestedProduct {
        private String name;
        private String slug;
        private String price;
        private String link;
    }
}
