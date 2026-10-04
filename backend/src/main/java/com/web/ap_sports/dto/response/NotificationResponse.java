package com.web.ap_sports.dto.response;

import com.web.ap_sports.enums.NotificationActionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private Long senderId;
    private boolean isRead;
    private LocalDateTime readAt;
    private String targetUrl;
    private NotificationActionType actionType;
    private String payload;
    private LocalDateTime createdAt;
}
