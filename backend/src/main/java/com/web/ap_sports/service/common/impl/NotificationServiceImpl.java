package com.web.ap_sports.service.common.impl;

import com.web.ap_sports.dto.response.NotificationResponse;
import com.web.ap_sports.entity.Notification;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.exception.ResourceNotFoundException;
import com.web.ap_sports.repository.NotificationRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.common.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserId(userId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Không có quyền cập nhật thông báo này");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void sendToUser(Long targetUserId, Long senderId, NotificationActionType actionType, String targetUrl, String payload) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người nhận"));

        Notification notification = Notification.builder()
                .user(targetUser)
                .senderId(senderId)
                .actionType(actionType)
                .targetUrl(targetUrl)
                .payload(payload)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        sendWebSocketMessage(targetUserId, mapToResponse(notification));
    }

    @Override
    @Transactional
    public void sendToInternalUsers(List<String> roles, Long senderId, NotificationActionType actionType, String targetUrl, String payload) {
        List<User> internalUsers = userRepository.findActiveUsersByRoles(roles);

        for (User targetUser : internalUsers) {
            Notification notification = Notification.builder()
                    .user(targetUser)
                    .senderId(senderId)
                    .actionType(actionType)
                    .targetUrl(targetUrl)
                    .payload(payload)
                    .isRead(false)
                    .build();

            notification = notificationRepository.save(notification);
            sendWebSocketMessage(targetUser.getId(), mapToResponse(notification));
        }
    }

    private void sendWebSocketMessage(Long targetUserId, NotificationResponse response) {
        try {
            // Spring converts this to /user/{targetUserId}/queue/notifications automatically
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(targetUserId),
                    "/queue/notifications",
                    response
            );
            log.info("Sent WebSocket notification to user {}", targetUserId);
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification to user {}", targetUserId, e);
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .senderId(notification.getSenderId())
                .isRead(notification.isRead())
                .readAt(notification.getReadAt())
                .targetUrl(notification.getTargetUrl())
                .actionType(notification.getActionType())
                .payload(notification.getPayload())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
