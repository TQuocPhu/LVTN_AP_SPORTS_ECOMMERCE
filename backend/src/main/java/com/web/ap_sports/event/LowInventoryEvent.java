package com.web.ap_sports.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LowInventoryEvent {
    private final Long productId;
    private final Long variantId;
    private final String productName;
    private final int remaining;
}
