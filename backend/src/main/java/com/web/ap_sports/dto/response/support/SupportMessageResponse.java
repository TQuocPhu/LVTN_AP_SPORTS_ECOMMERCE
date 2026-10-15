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
    private LocalDateTime createdAt;
}
