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

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", event.getOrderId());
            payload.put("orderCode", event.getOrderCode());
            payload.put("totalAmount", event.getTotalAmount());

            String payloadStr = objectMapper.writeValueAsString(payload);
            String targetUrl = "/admin/orders/" + event.getOrderId();

            notificationService.sendToInternalUsers(
                    List.of("ADMIN", "STAFF"),
                    event.getSenderId(),
                    NotificationActionType.ORDER_PLACED,
                    targetUrl,
                    payloadStr
            );
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo OrderPlacedEvent: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderStatusChangedEvent(OrderStatusChangedEvent event) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", event.getOrderId());
            payload.put("orderCode", event.getOrderCode());
            payload.put("oldStatus", event.getOldStatus());
            payload.put("newStatus", event.getNewStatus());

            String payloadStr = objectMapper.writeValueAsString(payload);
            String targetUrl = "/profile/orders";

            notificationService.sendToUser(
                    event.getCustomerId(),
                    event.getAdminId(),
                    NotificationActionType.ORDER_STATUS_CHANGED,
                    targetUrl,
                    payloadStr
            );
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

            notificationService.sendToInternalUsers(
                    List.of("ADMIN", "STAFF"),
                    event.getCustomerId(),
                    NotificationActionType.ORDER_CANCELLED_BY_CUSTOMER,
                    targetUrl,
                    payloadStr
            );
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
            String targetUrl = "/admin/reviews";

            notificationService.sendToInternalUsers(
                    List.of("ADMIN", "STAFF"),
                    event.getCustomerId(),
                    NotificationActionType.NEW_REVIEW,
                    targetUrl,
                    payloadStr
            );
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
            String targetUrl = "/products/" + event.getProductId(); // Link back to product

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
            String targetUrl = "/admin/products/" + event.getProductId();

            notificationService.sendToInternalUsers(
                    List.of("ADMIN", "WAREHOUSE_MANAGER"),
                    null, // System generated
                    NotificationActionType.LOW_INVENTORY,
                    targetUrl,
                    payloadStr
            );
        } catch (Exception e) {
            log.error("Lỗi gửi thông báo LowInventoryEvent: {}", e.getMessage(), e);
        }
    }
}
