package com.web.ap_sports.service.common.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public Page<NotificationResponse> getMyNotifications(Long userId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByUserId(userId, pageable);
        if (page.isEmpty() && pageable.getPageNumber() == 0) {
            userRepository.findById(userId).ifPresent(user -> {
                boolean isAdmin = user.getRole() != null && !"CUSTOMER".equalsIgnoreCase(user.getRole().getName());
                String targetUrl = isAdmin ? "/admin" : "/";
                Notification welcomeNotif = Notification.builder()
                        .user(user)
                        .title("Chào mừng bạn đến với AP Sports!")
                        .message("Hệ thống thông báo thời gian thực đã sẵn sàng phục vụ bạn.")
                        .actionType(NotificationActionType.WELCOME)
                        .targetUrl(targetUrl)
                        .payload("{\"title\":\"Chào mừng bạn đến với AP Sports!\",\"content\":\"Hệ thống thông báo thời gian thực đã sẵn sàng phục vụ bạn.\"}")
                        .isRead(false)
                        .build();
                notificationRepository.save(welcomeNotif);
            });
            page = notificationRepository.findByUserId(userId, pageable);
        }
        return page.map(this::mapToResponse);
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

    private String resolveTitle(NotificationActionType actionType) {
        return switch (actionType) {
            case ORDER_PLACED -> "Đơn hàng mới";
            case ORDER_PLACED_CUSTOMER -> "Đặt hàng thành công";
            case ORDER_STATUS_CHANGED -> "Cập nhật trạng thái đơn hàng";
            case ORDER_DELIVERED -> "Đơn hàng đã giao thành công";
            case GHN_ORDER_UPDATE -> "Cập nhật vận chuyển GHN";
            case ORDER_CANCELLED_BY_CUSTOMER -> "Đơn hàng đã được yêu cầu hủy";
            case ORDER_CANCELLED_BY_ADMIN -> "Đơn hàng đã bị cửa hàng hủy";
            case PAYMENT_SUCCESS -> "Thanh toán đơn hàng thành công";
            case NEW_REVIEW -> "Đánh giá sản phẩm mới";
            case REVIEW_REPLIED -> "Phản hồi đánh giá từ cửa hàng";
            case LOW_INVENTORY -> "Cảnh báo tồn kho thấp";
            case OUT_OF_STOCK -> "Cảnh báo hết hàng trong kho";
            case WELCOME -> "Chào mừng bạn đến với AP Sports!";
            case PRODUCT_RESTOCKED -> "Sản phẩm yêu thích đã có hàng!";
            case ORDER_PACKED -> "Đơn hàng đã được kiểm đếm đóng gói";
            default -> "Thông báo mới từ hệ thống";
        };
    }

    private String mapStatusToVietnamese(String status) {
        if (status == null) return "Cập nhật";
        return switch (status.toLowerCase()) {
            case "pending" -> "Chờ duyệt";
            case "confirmed" -> "Đã duyệt";
            case "processing" -> "Đang đóng gói kho";
            case "shipped" -> "Đã bàn giao bưu cục GHN";
            case "shipping" -> "Đang giao hàng";
            case "delivered" -> "Giao hàng thành công";
            case "cancelled" -> "Đã hủy";
            case "returned" -> "Yêu cầu trả hàng";
            default -> status;
        };
    }

    private String resolveMessage(NotificationActionType actionType, String payload, String defaultTitle) {
        if (payload == null || payload.isBlank()) return defaultTitle;
        try {
            Map<String, Object> map = objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
            String orderCode = map.get("orderCode") != null ? String.valueOf(map.get("orderCode")) : "";
            String customerName = map.get("customerName") != null ? String.valueOf(map.get("customerName")) : "";
            String newStatus = map.get("newStatus") != null ? String.valueOf(map.get("newStatus")).toLowerCase() : "";
            String productName = map.get("productName") != null ? String.valueOf(map.get("productName")) : "";
            Object totalAmount = map.get("totalAmount");

            return switch (actionType) {
                case GHN_ORDER_UPDATE -> {
                    if ("shipped".equals(newStatus)) {
                        yield "Bưu cục GHN đã tiếp nhận kiện hàng #" + orderCode + " từ kho AP Sports và đang phân loại trung chuyển.";
                    } else if ("shipping".equals(newStatus)) {
                        yield "Tài xế GHN đang trên đường giao đơn hàng #" + orderCode + " đến bạn. Quý khách vui lòng chú ý điện thoại.";
                    } else if ("delivered".equals(newStatus)) {
                        yield "Đơn hàng #" + orderCode + " đã được giao thành công bởi GHN. Cảm ơn quý khách đã mua sắm tại AP Sports!";
                    }
                    yield "Đơn vị vận chuyển GHN đã cập nhật trạng thái đơn hàng #" + orderCode + ": " + mapStatusToVietnamese(newStatus);
                }
                case ORDER_PLACED_CUSTOMER -> "Đơn hàng #" + orderCode + " đã được tạo thành công. AP Sports đang chuẩn bị hàng để giao cho bạn.";
                case ORDER_PLACED -> "Khách hàng " + (customerName.isBlank() ? "vừa" : customerName) + " đặt đơn hàng #" + orderCode + " trị giá " + (totalAmount != null ? totalAmount : 0) + "đ.";
                case ORDER_STATUS_CHANGED -> "Đơn hàng #" + orderCode + " đã được cập nhật sang trạng thái: " + mapStatusToVietnamese(newStatus);
                case ORDER_DELIVERED -> "Đơn hàng #" + orderCode + " đã được giao thành công. Hãy để lại đánh giá về trải nghiệm mua sắm nhé!";
                case ORDER_CANCELLED_BY_CUSTOMER -> "Khách hàng " + customerName + " vừa yêu cầu hủy đơn hàng #" + orderCode + ".";
                case ORDER_CANCELLED_BY_ADMIN -> "Đơn hàng #" + orderCode + " đã bị cửa hàng hủy trên hệ thống.";
                case PAYMENT_SUCCESS -> "Đơn hàng #" + orderCode + " đã được thanh toán trực tuyến thành công.";
                case NEW_REVIEW -> "Khách hàng " + (customerName.isBlank() ? "vừa" : customerName) + " gửi đánh giá cho sản phẩm " + productName + ".";
                case REVIEW_REPLIED -> "Cửa hàng AP Sports đã phản hồi bài đánh giá của bạn về sản phẩm " + productName + ".";
                case LOW_INVENTORY -> "Sản phẩm \"" + productName + "\" sắp hết hàng trong kho, chỉ còn " + map.get("remaining") + " sản phẩm.";
                case OUT_OF_STOCK -> "Sản phẩm \"" + productName + "\" đã hết hàng trong kho. Vui lòng nhập thêm hàng.";
                case PRODUCT_RESTOCKED -> map.get("content") != null ? String.valueOf(map.get("content")) : ("Biến thể của sản phẩm \"" + productName + "\" bạn đăng ký theo dõi đã có hàng trở lại!");
                case ORDER_PACKED -> "Đơn hàng #" + orderCode + " đã được bộ phận kho kiểm đếm barcode 100% và đóng gói thành công.";
                case WELCOME -> map.get("content") != null ? String.valueOf(map.get("content")) : "Hệ thống thông báo thời gian thực đã sẵn sàng phục vụ bạn.";
                default -> defaultTitle;
            };
        } catch (Exception e) {
            return (payload != null && !payload.startsWith("{")) ? payload : defaultTitle;
        }
    }

    private Notification buildNotification(User targetUser, Long senderId, NotificationActionType actionType, String targetUrl, String payload) {
        String title = resolveTitle(actionType);
        String msg = resolveMessage(actionType, payload, title);
        return Notification.builder()
                .user(targetUser)
                .senderId(senderId)
                .title(title)
                .message(msg)
                .actionType(actionType)
                .targetUrl(targetUrl)
                .payload(payload)
                .isRead(false)
                .build();
    }

    @Override
    @Transactional
    public void sendToUser(Long targetUserId, Long senderId, NotificationActionType actionType, String targetUrl, String payload) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người nhận"));

        Notification notification = buildNotification(targetUser, senderId, actionType, targetUrl, payload);
        notification = notificationRepository.save(notification);
        sendWebSocketMessage(targetUserId, mapToResponse(notification));
    }

    @Override
    @Transactional
    public void sendToInternalUsers(List<String> roles, Long senderId, NotificationActionType actionType, String targetUrl, String payload) {
        List<User> internalUsers = userRepository.findActiveUsersByRoles(roles);

        for (User targetUser : internalUsers) {
            Notification notification = buildNotification(targetUser, senderId, actionType, targetUrl, payload);
            notification = notificationRepository.save(notification);
            sendWebSocketMessage(targetUser.getId(), mapToResponse(notification));
        }
    }

    @Override
    @Transactional
    public void sendToUsersWithPermission(String permissionName, Long senderId, NotificationActionType actionType, String targetUrl, String payload) {
        List<User> eligibleUsers = userRepository.findActiveUsersByPermission(permissionName);
        log.info("Gửi thông báo action: {} theo quyền [{}], tìm thấy {} người nhận hợp lệ",
                actionType, permissionName, eligibleUsers.size());

        for (User targetUser : eligibleUsers) {
            Notification notification = buildNotification(targetUser, senderId, actionType, targetUrl, payload);
            notification = notificationRepository.save(notification);
            sendWebSocketMessage(targetUser.getId(), mapToResponse(notification));
        }
    }

    @Override
    @Transactional
    public void sendToUsersWithAnyPermission(List<String> permissionNames, Long senderId, NotificationActionType actionType, String targetUrl, String payload) {
        List<User> eligibleUsers = userRepository.findActiveUsersByPermissions(permissionNames);
        log.info("Gửi thông báo action: {} theo danh sách quyền {}, tìm thấy {} người nhận hợp lệ",
                actionType, permissionNames, eligibleUsers.size());

        for (User targetUser : eligibleUsers) {
            Notification notification = buildNotification(targetUser, senderId, actionType, targetUrl, payload);
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
        String senderName = "Hệ thống AP Sports";
        String senderAvatar = "/icon.png";
        String senderRole = "SYSTEM";

        if (notification.getSenderId() != null) {
            Optional<User> senderOpt = userRepository.findById(notification.getSenderId());
            if (senderOpt.isPresent()) {
                User sender = senderOpt.get();
                senderName = sender.getName() != null && !sender.getName().isBlank() ? sender.getName() : "Người dùng AP Sports";
                senderAvatar = sender.getAvatar();
                if (sender.getRole() != null) {
                    senderRole = sender.getRole().getName();
                    if ("GHN_STATION".equalsIgnoreCase(senderRole)) {
                        senderName = "Bưu cục GHN Logistics";
                        if (senderAvatar == null || senderAvatar.isBlank()) {
                            senderAvatar = "https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png";
                        }
                    } else if ("GHN_SHIPPER".equalsIgnoreCase(senderRole)) {
                        senderName = (sender.getName() != null && !sender.getName().isBlank()) ? sender.getName() : "Tài xế giao hàng GHN";
                        if (senderAvatar == null || senderAvatar.isBlank()) {
                            senderAvatar = "https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png";
                        }
                    }
                }
            }
        } else if (notification.getActionType() == NotificationActionType.GHN_ORDER_UPDATE) {
            senderName = "Giao Hàng Nhanh (GHN)";
            senderAvatar = "https://cdn.haitrieu.com/wp-content/uploads/2022/05/Logo-GHN-Orange.png";
            senderRole = "GHN_LOGISTICS";
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .senderId(notification.getSenderId())
                .senderName(senderName)
                .senderAvatar(senderAvatar)
                .senderRole(senderRole)
                .isRead(notification.isRead())
                .readAt(notification.getReadAt())
                .targetUrl(notification.getTargetUrl())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .actionType(notification.getActionType())
                .payload(notification.getPayload())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
