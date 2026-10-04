package com.web.ap_sports.event;

import com.web.ap_sports.enums.NotificationActionType;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class NotificationSendEvent {
    // Nếu targetUserId != null, gửi cho 1 người. Nếu roles != null, gửi cho nhóm role.
    private final Long targetUserId;
    private final List<String> roles;
    private final Long senderId;
    private final NotificationActionType actionType;
    private final String targetUrl;
    private final String payload;
}
