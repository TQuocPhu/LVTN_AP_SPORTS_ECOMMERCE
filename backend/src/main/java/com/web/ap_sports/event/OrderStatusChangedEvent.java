package com.web.ap_sports.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderStatusChangedEvent {
    private final Long orderId;
    private final String orderCode;
    private final String oldStatus;
    private final String newStatus;
    private final Long customerId; // to send to the customer
    private final Long adminId;    // who triggered it
}
