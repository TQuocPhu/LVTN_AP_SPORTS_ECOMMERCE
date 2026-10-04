package com.web.ap_sports.event;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class OrderPlacedEvent {
    private final Long orderId;
    private final String orderCode;
    private final BigDecimal totalAmount;
    private final Long senderId; // The user who placed the order
}
