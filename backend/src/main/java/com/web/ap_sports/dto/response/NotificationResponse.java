package com.web.ap_sports.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String senderName;
    private String senderAvatar;
    private String senderRole;
    
    @JsonProperty("isRead")
    private boolean isRead;

    @JsonProperty("isRead")
    public boolean getIsRead() {
        return isRead;
    }

    @JsonProperty("read")
    public boolean isRead() {
        return isRead;
    }

    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }
    private LocalDateTime readAt;
    private String targetUrl;
    private String title;
    private String message;
    private NotificationActionType actionType;
    private String payload;
    private LocalDateTime createdAt;
}
