package com.web.ap_sports.controller.customer;

import com.web.ap_sports.dto.request.customer.CreateReviewRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.customer.ProductReviewSummaryResponse;
import com.web.ap_sports.dto.response.customer.ReviewResponse;
import com.web.ap_sports.service.customer.CustomerReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CustomerReviewController {

    private final CustomerReviewService customerReviewService;

    /**
     * Lấy danh sách đánh giá công khai cho sản phẩm (Cho phép truy cập công khai - permitAll)
     */
    @GetMapping("/api/v1/reviews/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable("productId") Long productId,
            @RequestParam(value = "rating", required = false) Integer rating,
            @RequestParam(value = "withImagesOnly", required = false) Boolean withImagesOnly,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        Page<ReviewResponse> reviews = customerReviewService.getProductReviews(productId, rating, withImagesOnly, page, size);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công.", reviews));
    }

    /**
     * Thống kê tổng quan mốc sao & điểm trung bình sản phẩm (Cho phép truy cập công khai - permitAll)
     */
    @GetMapping("/api/v1/reviews/summary/{productId}")
    public ResponseEntity<ApiResponse<ProductReviewSummaryResponse>> getProductReviewSummary(
            @PathVariable("productId") Long productId) {
        ProductReviewSummaryResponse summary = customerReviewService.getProductReviewSummary(productId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê đánh giá thành công.", summary));
    }

    /**
     * Tạo mới đánh giá cho sản phẩm trong đơn hàng đã giao thành công (Bảo mật ROLE_CUSTOMER)
     */
    @PostMapping("/api/v1/customer/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            Authentication authentication,
            @Valid @RequestBody CreateReviewRequest request) {
        String userEmail = authentication.getName();
        ReviewResponse created = customerReviewService.createReview(userEmail, request);
        return ResponseEntity.ok(ApiResponse.success("Gửi đánh giá sản phẩm thành công.", created));
    }

    /**
     * Kiểm tra danh sách OrderItem IDs đã được đánh giá chưa (Bảo mật ROLE_CUSTOMER)
     */
    @PostMapping("/api/v1/customer/reviews/check-reviewed")
    public ResponseEntity<ApiResponse<List<Long>>> getReviewedOrderItemIds(
            Authentication authentication,
            @RequestBody List<Long> orderItemIds) {
        String userEmail = authentication.getName();
        List<Long> reviewedIds = customerReviewService.getReviewedOrderItemIds(userEmail, orderItemIds);
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra trạng thái đánh giá thành công.", reviewedIds));
    }
}
