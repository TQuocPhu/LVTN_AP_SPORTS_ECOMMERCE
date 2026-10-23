package com.web.ap_sports.dto.response.support;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportMessageResponse {

    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderRole; // CUSTOMER, STAFF, SYSTEM
    private String content;
    private String attachmentUrl;
    private String senderAvatar;
    private String conversationStatus; // WAITING, IN_PROGRESS, RESOLVED, CLOSED

    @com.fasterxml.jackson.annotation.JsonProperty("isViolation")
    private boolean isViolation;

    private String violationReason;
    private String maskedContent;
    private String originalContent;
    private LocalDateTime createdAt;
}
