package com.web.ap_sports.dto.response.support;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportConversationResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAvatar;
    private Long staffId;
    private String staffName;
    private String staffAvatar;
    private Long orderId;
    private String orderCode;
    private String status; // WAITING, IN_PROGRESS, RESOLVED, CLOSED
    private String subject;
    private Long unreadCount;
    private Integer rating;
    private String feedbackNote;
    private LocalDateTime lastMessageAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
}
