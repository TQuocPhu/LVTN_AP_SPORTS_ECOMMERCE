package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.CreateDeliveryReviewRequest;
import com.web.ap_sports.dto.response.customer.DeliveryReviewResponse;

public interface CustomerDeliveryReviewService {

    DeliveryReviewResponse createDeliveryReview(String customerEmail, String orderCode, CreateDeliveryReviewRequest request);

    DeliveryReviewResponse getDeliveryReviewByOrderCode(String customerEmail, String orderCode);
}
