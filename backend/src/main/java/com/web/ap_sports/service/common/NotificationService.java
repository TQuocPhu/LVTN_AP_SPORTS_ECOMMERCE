package com.web.ap_sports.service.common;

import com.web.ap_sports.dto.response.NotificationResponse;
import com.web.ap_sports.enums.NotificationActionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    Page<NotificationResponse> getMyNotifications(Long userId, Pageable pageable);

    long getUnreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    /**
     * Send notification to a specific user.
     */
    void sendToUser(Long targetUserId, Long senderId, NotificationActionType actionType, String targetUrl, String payload);

    /**
     * Send notification to users having any of the specified roles.
     */
    void sendToInternalUsers(List<String> roles, Long senderId, NotificationActionType actionType, String targetUrl, String payload);

    /**
     * Send notification to internal users who hold a specific permission (checked via role_permissions table).
     */
    void sendToUsersWithPermission(String permissionName, Long senderId, NotificationActionType actionType, String targetUrl, String payload);

    /**
     * Send notification to internal users who hold any of the specified permissions (checked via role_permissions table).
     */
    void sendToUsersWithAnyPermission(List<String> permissionNames, Long senderId, NotificationActionType actionType, String targetUrl, String payload);

    /**
     * Send notification to users who have permission SUPPORT_LIVE_CHAT or role ADMIN.
     */
    void sendToSupportLiveChatUsers(Long senderId, NotificationActionType actionType, String targetUrl, String payload);
}
