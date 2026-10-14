package com.web.ap_sports.event.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.enums.NotificationActionType;
import com.web.ap_sports.event.*;
import com.web.ap_sports.service.common.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    private final com.web.ap_sports.repository.UserRepository userRepository;

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", event.getOrderId());
            payload.put("orderCode", event.getOrderCode());
            payload.put("totalAmount", event.getTotalAmount());

            String payloadStr = objectMapper.writeValueAsString(payload);
            String adminTargetUrl = "/admin/orders/" + event.getOrderId();

            // 1. Gửi thông báo đến những người có quyền quản lý đơn hàng (MANAGE_ORDERS)
            notificationService.sendToUsersWithPermission(
                    "MANAGE_ORDERS",
                    event.getSenderId(),
                    NotificationActionType.ORDER_PLACED,
                    adminTargetUrl,
                    payloadStr
            );

            // 2. Gửi thông báo xác nhận đặt hàng thành công cho Khách hàng
            if (event.getSenderId() != null) {
                String customerTargetUrl = "/profile/orders";
                notificationService.sendToUser(
                        event.getSenderId(),
                        null,
                        NotificationActionType.ORDER_PLACED_CUSTOMER,
                        customerTargetUrl,
                        payloadStr
                );
            }
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo OrderPlacedEvent: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderStatusChangedEvent(OrderStatusChangedEvent event) {
        try {
            boolean isGhnActor = false;
            String actorName = "Hệ thống";
            if (event.getAdminId() != null) {
                var actorOpt = userRepository.findById(event.getAdminId());
                if (actorOpt.isPresent()) {
                    var actor = actorOpt.get();
                    actorName = actor.getName() != null && !actor.getName().isBlank() ? actor.getName() : actor.getEmail();
                    if (actor.getRole() != null) {
                        String role = actor.getRole().getName();
                        isGhnActor = "GHN_STATION".equalsIgnoreCase(role) || "GHN_SHIPPER".equalsIgnoreCase(role);
                    }
                }
            }

            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", event.getOrderId());
            payload.put("orderCode", event.getOrderCode());
            payload.put("oldStatus", event.getOldStatus());
            payload.put("newStatus", event.getNewStatus());
            payload.put("actorName", actorName);

            String payloadStr = objectMapper.writeValueAsString(payload);
            String customerTargetUrl = "/profile/orders";

            if (isGhnActor) {
                // 1. Gửi thông báo đến Khách hàng về cập nhật vận chuyển từ GHN
                notificationService.sendToUser(
                        event.getCustomerId(),
                        event.getAdminId(),
                        NotificationActionType.GHN_ORDER_UPDATE,
                        customerTargetUrl,
                        payloadStr
                );

                // 2. Gửi thông báo cho Quản trị viên / Nhân viên quản lý đơn hàng
                notificationService.sendToUsersWithPermission(
                        "MANAGE_ORDERS",
                        event.getAdminId(),
                        NotificationActionType.GHN_ORDER_UPDATE,
                        "/admin/orders",
                        payloadStr
                );
            } else {
                // Do Admin / Nhân viên cửa hàng cập nhật
                NotificationActionType actionType = NotificationActionType.ORDER_STATUS_CHANGED;
                if ("DELIVERED".equalsIgnoreCase(event.getNewStatus())) {
                    actionType = NotificationActionType.ORDER_DELIVERED;
                } else if ("CANCELLED".equalsIgnoreCase(event.getNewStatus())) {
                    actionType = NotificationActionType.ORDER_CANCELLED_BY_ADMIN;
                }

                notificationService.sendToUser(
                        event.getCustomerId(),
                        event.getAdminId(),
                        actionType,
                        customerTargetUrl,
                        payloadStr
                );
            }
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo OrderStatusChangedEvent: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCancelledByCustomerEvent(OrderCancelledByCustomerEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", event.getOrderId());
            payload.put("orderCode", event.getOrderCode());

            String payloadStr = objectMapper.writeValueAsString(payload);
            String targetUrl = "/admin/orders/" + event.getOrderId();

            // 1. Gửi cho những người có quyền quản lý đơn hàng (MANAGE_ORDERS)
            notificationService.sendToUsersWithPermission(
                    "MANAGE_ORDERS",
                    event.getCustomerId(),
                    NotificationActionType.ORDER_CANCELLED_BY_CUSTOMER,
                    targetUrl,
                    payloadStr
            );

            // 2. Gửi xác nhận hủy thành công cho chính khách hàng
            if (event.getCustomerId() != null) {
                notificationService.sendToUser(
                        event.getCustomerId(),
                        null,
                        NotificationActionType.ORDER_CANCELLED_BY_CUSTOMER,
                        "/profile/orders",
                        payloadStr
                );
            }
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo OrderCancelledByCustomerEvent: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNewReviewEvent(NewReviewEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("reviewId", event.getReviewId());
            payload.put("productId", event.getProductId());
            payload.put("productName", event.getProductName());
            payload.put("rating", event.getRating());

            String payloadStr = objectMapper.writeValueAsString(payload);
            String adminTargetUrl = "/admin/reviews";

            // 1. Gửi thông báo cho những người có quyền quản lý đánh giá (MANAGE_REVIEWS)
            // (Warehouse không có quyền MANAGE_REVIEWS nên sẽ KHÔNG nhận được)
            notificationService.sendToUsersWithPermission(
                    "MANAGE_REVIEWS",
                    event.getCustomerId(),
                    NotificationActionType.NEW_REVIEW,
                    adminTargetUrl,
                    payloadStr
            );

            // 2. Gửi xác nhận đánh giá thành công cho chính Khách hàng
            if (event.getCustomerId() != null) {
                notificationService.sendToUser(
                        event.getCustomerId(),
                        null,
                        NotificationActionType.NEW_REVIEW,
                        "/products/" + event.getProductId(),
                        payloadStr
                );
            }
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo NewReviewEvent: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleReviewRepliedEvent(ReviewRepliedEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("reviewId", event.getReviewId());
            payload.put("productId", event.getProductId());
            payload.put("productName", event.getProductName());

            String payloadStr = objectMapper.writeValueAsString(payload);
            String targetUrl = "/products/" + event.getProductId();

            // Gửi thông báo phản hồi đánh giá trực tiếp đến khách hàng
            notificationService.sendToUser(
                    event.getCustomerId(),
                    event.getAdminId(),
                    NotificationActionType.REVIEW_REPLIED,
                    targetUrl,
                    payloadStr
            );
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo ReviewRepliedEvent: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleLowInventoryEvent(LowInventoryEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("productId", event.getProductId());
            payload.put("variantId", event.getVariantId());
            payload.put("productName", event.getProductName());
            payload.put("remaining", event.getRemaining());

            String payloadStr = objectMapper.writeValueAsString(payload);
            String targetUrl = "/admin/products";

            NotificationActionType actionType = (event.getRemaining() <= 0)
                    ? NotificationActionType.OUT_OF_STOCK
                    : NotificationActionType.LOW_INVENTORY;

            // Gửi thông báo cho những người có quyền quản lý kho (MANAGE_INVENTORY)
            // (Nhân viên bán hàng Staff không có quyền MANAGE_INVENTORY nên sẽ KHÔNG bị làm phiền)
            notificationService.sendToUsersWithPermission(
                    "MANAGE_INVENTORY",
                    null,
                    actionType,
                    targetUrl,
                    payloadStr
            );
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo LowInventoryEvent: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleNotificationSendEvent(NotificationSendEvent event) {
        try {
            if (event.getTargetUserId() != null) {
                notificationService.sendToUser(
                        event.getTargetUserId(),
                        event.getSenderId(),
                        event.getActionType(),
                        event.getTargetUrl(),
                        event.getPayload()
                );
            } else if (event.getRoles() != null && !event.getRoles().isEmpty()) {
                notificationService.sendToInternalUsers(
                        event.getRoles(),
                        event.getSenderId(),
                        event.getActionType(),
                        event.getTargetUrl(),
                        event.getPayload()
                );
            }
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo NotificationSendEvent: {}", e.getMessage(), e);
        }
    }
}
