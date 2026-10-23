package com.web.ap_sports.dto.response.ai;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO phản hồi lịch sử tin nhắn tư vấn AI kèm danh sách sản phẩm gợi ý
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

    private Long id;
    private String sender;
    private String message;
    private boolean isRead;

    @com.fasterxml.jackson.annotation.JsonProperty("isViolation")
    private boolean isViolation;

    private String violationReason;
    private LocalDateTime createdAt;
    private List<AiSportsAdvisorResponse.SuggestedProduct> suggestedProducts;
}
