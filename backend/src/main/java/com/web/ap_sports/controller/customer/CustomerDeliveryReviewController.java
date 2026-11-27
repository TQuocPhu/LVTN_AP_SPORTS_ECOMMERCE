package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.CreateDeliveryReviewRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.DeliveryReviewResponse;
import com.web.ap_sports.service.customer.CustomerDeliveryReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller xử lý Đánh giá giao hàng / Shipper cho Khách hàng (/api/v1/customer/delivery-reviews).
 */
@RestController
@RequestMapping("/api/v1/customer/delivery-reviews")
@RequiredArgsConstructor
public class CustomerDeliveryReviewController {

    private final CustomerDeliveryReviewService customerDeliveryReviewService;

    @PostMapping("/order/{orderCode}")
    public ResponseEntity<ApiResponse<DeliveryReviewResponse>> createDeliveryReview(
            Authentication authentication,
            @PathVariable String orderCode,
            @Valid @RequestBody CreateDeliveryReviewRequest request) {
        DeliveryReviewResponse created = customerDeliveryReviewService.createDeliveryReview(
                authentication.getName(),
                orderCode,
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Cảm ơn bạn đã đánh giá chất lượng giao hàng!", created));
    }

    @GetMapping("/order/{orderCode}")
    public ResponseEntity<ApiResponse<DeliveryReviewResponse>> getDeliveryReviewByOrderCode(
            Authentication authentication,
            @PathVariable String orderCode) {
        DeliveryReviewResponse review = customerDeliveryReviewService.getDeliveryReviewByOrderCode(
                authentication.getName(),
                orderCode
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đánh giá giao hàng thành công.", review));
    }
}
