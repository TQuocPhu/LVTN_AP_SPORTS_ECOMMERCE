package com.web.ap_sports.event.listener;

import com.web.ap_sports.event.NotificationSendEvent;
import com.web.ap_sports.service.common.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    @Async("taskExecutor") // Đòi hỏi phải cấu hình bean taskExecutor (ThreadPoolTaskExecutor)
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
            // Nuốt lỗi và log để không ảnh hưởng luồng chính nếu có lỗi ngầm
            log.error("Lỗi khi xử lý gửi thông báo (Async): {}", e.getMessage(), e);
        }
    }
}
