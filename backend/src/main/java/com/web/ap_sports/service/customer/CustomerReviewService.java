package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.CreateReviewRequest;
import com.web.ap_sports.dto.response.customer.ProductReviewSummaryResponse;
import com.web.ap_sports.dto.response.customer.ReviewResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CustomerReviewService {

    /**
     * Tạo mới bài đánh giá sản phẩm dựa trên OrderItem trong đơn hàng đã giao thành công.
     */
    ReviewResponse createReview(String userEmail, CreateReviewRequest request);

    /**
     * Lấy danh sách đánh giá đã duyệt của sản phẩm kèm bộ lọc.
     */
    Page<ReviewResponse> getProductReviews(Long productId, Integer rating, Boolean withImagesOnly, int page, int size);

    /**
     * Thống kê tổng quan điểm rating & số lượt đánh giá theo từng mốc sao.
     */
    ProductReviewSummaryResponse getProductReviewSummary(Long productId);

    /**
     * Lấy danh sách ID mục đơn hàng mà người dùng đã đánh giá.
     */
    List<Long> getReviewedOrderItemIds(String userEmail, List<Long> orderItemIds);
}
