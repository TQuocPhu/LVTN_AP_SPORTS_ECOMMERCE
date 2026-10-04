package com.web.ap_sports.service.admin.impl;

import com.web.ap_sports.dto.request.admin.AdminReplyReviewRequest;
import com.web.ap_sports.dto.request.admin.AdminReviewFilterRequest;
import com.web.ap_sports.dto.response.admin.AdminReviewDetailResponse;
import com.web.ap_sports.entity.Review;
import com.web.ap_sports.entity.ReviewImage;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.ProductImageRepository;
import com.web.ap_sports.repository.ReviewRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.admin.AdminReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminReviewServiceImpl implements AdminReviewService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "rating", "status", "id");
    private static final int MAX_PAGE_SIZE = 50;

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminReviewDetailResponse> getAdminReviews(AdminReviewFilterRequest filterRequest) {
        int page = (filterRequest.getPage() != null && filterRequest.getPage() >= 0) ? filterRequest.getPage() : 0;
        int requestedSize = (filterRequest.getSize() != null && filterRequest.getSize() > 0) ? filterRequest.getSize() : 10;
        int size = Math.min(requestedSize, MAX_PAGE_SIZE);
        String sortBy = (filterRequest.getSortBy() != null && ALLOWED_SORT_FIELDS.contains(filterRequest.getSortBy())) ? filterRequest.getSortBy() : "createdAt";
        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(filterRequest.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<Review> reviewPage = reviewRepository.findAdminReviewsWithFilter(
                filterRequest.getRating(),
                filterRequest.getStatus(),
                filterRequest.getKeyword(),
                pageable
        );

        // Lấy ảnh đại diện của tất cả sản phẩm trong trang bằng 1 query duy nhất (tránh N+1)
        List<Long> productIds = reviewPage.getContent().stream()
                .map(Review::getProduct)
                .filter(p -> p != null)
                .map(com.web.ap_sports.entity.Product::getId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> primaryImageByProduct = loadPrimaryImages(productIds);

        return reviewPage.map(r -> mapToAdminReviewDetailResponse(r, primaryImageByProduct));
    }

    @Override
    @Transactional
    public AdminReviewDetailResponse replyReview(Long reviewId, String adminEmail, AdminReplyReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Bài đánh giá không tồn tại ID: " + reviewId));

        User adminUser = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản quản trị không tồn tại"));

        review.setAdminReply(request.getReplyContent());
        review.setRepliedBy(adminUser);
        review.setRepliedAt(LocalDateTime.now());

        Review updatedReview = reviewRepository.save(review);
        log.info("Admin {} đã phản hồi 1-1 bài đánh giá ID: {}", adminUser.getEmail(), reviewId);

        return mapToAdminReviewDetailResponse(updatedReview);
    }

    @Override
    @Transactional
    public AdminReviewDetailResponse toggleReviewStatus(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Bài đánh giá không tồn tại ID: " + reviewId));

        String newStatus = "hidden".equalsIgnoreCase(review.getStatus()) ? "approved" : "hidden";
        review.setStatus(newStatus);

        Review updatedReview = reviewRepository.save(review);
        log.info("Cập nhật trạng thái bài đánh giá ID: {} sang '{}'", reviewId, newStatus);

        return mapToAdminReviewDetailResponse(updatedReview);
    }

    private Map<Long, String> loadPrimaryImages(List<Long> productIds) {
        Map<Long, String> result = new HashMap<>();
        if (productIds.isEmpty()) return result;
        for (com.web.ap_sports.entity.ProductImage img : productImageRepository.findByProductIdIn(productIds)) {
            Long pid = img.getProduct() != null ? img.getProduct().getId() : null;
            if (pid == null) continue;
            // Ảnh primary luôn được ưu tiên; nếu chưa có ảnh nào thì lấy ảnh đầu tiên gặp
            if (img.isPrimary() || !result.containsKey(pid)) {
                result.put(pid, img.getImagePath());
            }
        }
        return result;
    }

    /** Dùng cho các thao tác đơn lẻ (reply, toggle) - chỉ cần ảnh của 1 sản phẩm. */
    private AdminReviewDetailResponse mapToAdminReviewDetailResponse(Review review) {
        Map<Long, String> images = review.getProduct() != null
                ? loadPrimaryImages(List.of(review.getProduct().getId()))
                : Collections.emptyMap();
        return mapToAdminReviewDetailResponse(review, images);
    }

    private AdminReviewDetailResponse mapToAdminReviewDetailResponse(Review review, Map<Long, String> primaryImageByProduct) {
        List<String> imageUrls = review.getImages() != null ?
                review.getImages().stream().map(ReviewImage::getImageUrl).collect(Collectors.toList())
                : Collections.emptyList();

        String productName = null;
        String productImage = null;
        if (review.getProduct() != null) {
            productName = review.getProduct().getName();
            productImage = primaryImageByProduct.get(review.getProduct().getId());
        }

        return AdminReviewDetailResponse.builder()
                .id(review.getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getName() : "Khách hàng AP Sports")
                .userEmail(review.getUser() != null ? review.getUser().getEmail() : null)
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(productName)
                .productImage(productImage)
                .orderItemId(review.getOrderItem() != null ? review.getOrderItem().getId() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrls(imageUrls)
                .adminReply(review.getAdminReply())
                .repliedByName(review.getRepliedBy() != null ? review.getRepliedBy().getName() : null)
                .repliedAt(review.getRepliedAt())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
