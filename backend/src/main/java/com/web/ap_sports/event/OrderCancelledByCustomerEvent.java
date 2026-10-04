package com.web.ap_sports.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderCancelledByCustomerEvent {
    private final Long orderId;
    private final String orderCode;
    private final Long customerId;
}
