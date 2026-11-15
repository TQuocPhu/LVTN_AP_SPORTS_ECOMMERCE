package com.web.ap_sports.scheduler;

import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.service.customer.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler định kỳ kiểm tra và giải phóng tồn kho cho các đơn hàng VNPay
 * quá thời hạn thanh toán (15 phút) nhưng khách hàng chưa hoàn tất giao dịch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VNPayExpirationScheduler {

    private static final int VNPAY_EXPIRE_MINUTES = 15;

    private final OrderRepository orderRepository;
    private final CustomerOrderService customerOrderService;

    /**
     * Chạy mỗi 2 phút để quét các đơn hàng VNPay pending quá 15 phút.
     * Mỗi đơn được lock PESSIMISTIC_WRITE riêng trong transaction nhằm tránh xung đột với callback VNPay.
     */
    @Scheduled(fixedDelay = 120_000, initialDelay = 60_000)
    public void releaseExpiredPendingVNPayOrders() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(VNPAY_EXPIRE_MINUTES);
        List<Long> expiredOrderIds = orderRepository.findExpiredPendingVNPayOrderIds(cutoffTime);
        if (expiredOrderIds.isEmpty()) {
            return;
        }

        log.info("Phát hiện {} đơn hàng VNPay quá hạn {} phút chưa thanh toán, tiến hành hoàn kho...",
                expiredOrderIds.size(), VNPAY_EXPIRE_MINUTES);

        for (Long orderId : expiredOrderIds) {
            try {
                customerOrderService.expirePendingVNPayOrder(orderId);
            } catch (Exception e) {
                log.error("Lỗi khi tự động hết hạn đơn hàng VNPay ID #{}: {}", orderId, e.getMessage(), e);
            }
        }
    }
}
