package com.web.ap_sports.service.common;

import com.web.ap_sports.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Phát sóng sự kiện thay đổi đơn hàng qua WebSocket (/topic/orders)
 * để các client (Web Khách, Web Admin, Cổng Logistics, Mobile App) tự động đồng bộ thời gian thực.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderRealtimePublisher {

    private static final String TOPIC_ORDERS = "/topic/orders";
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Phát sóng sự kiện sau khi Transaction hiện tại đã commit thành công,
     * đảm bảo client khi refetch REST API luôn nhận được dữ liệu mới nhất.
     */
    public void publishOrderChanged(Order order) {
        if (order == null) {
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", order.getId());
        payload.put("orderCode", order.getOrderCode());
        payload.put("status", order.getStatus() != null ? order.getStatus().getValue() : null);
        payload.put("userId", order.getUser() != null ? order.getUser().getId() : null);
        payload.put("updatedAt", order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : LocalDateTime.now().toString());

        Runnable sendTask = () -> {
            try {
                messagingTemplate.convertAndSend(TOPIC_ORDERS, payload);
                log.debug("Đã phát sóng WebSocket {} cho đơn #{} (status={})",
                        TOPIC_ORDERS, order.getOrderCode(), payload.get("status"));
            } catch (Exception e) {
                log.error("Lỗi phát sóng WebSocket {} cho đơn #{}: {}",
                        TOPIC_ORDERS, order.getOrderCode(), e.getMessage());
            }
        };

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendTask.run();
                }
            });
        } else {
            sendTask.run();
        }
    }
}
