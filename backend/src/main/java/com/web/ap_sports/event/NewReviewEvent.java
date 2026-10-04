package com.web.ap_sports.event;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NewReviewEvent {
    private final Long reviewId;
    private final Long productId;
    private final String productName;
    private final int rating;
    private final Long customerId;
}
