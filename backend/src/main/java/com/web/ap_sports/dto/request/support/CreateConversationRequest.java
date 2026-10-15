package com.web.ap_sports.dto.request.support;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {

    private String subject; // Tiêu đề/chủ đề cần hỗ trợ (vd: "Tư vấn giày bóng đá")

    private Long orderId;   // Đơn hàng liên quan (nếu có)
}
