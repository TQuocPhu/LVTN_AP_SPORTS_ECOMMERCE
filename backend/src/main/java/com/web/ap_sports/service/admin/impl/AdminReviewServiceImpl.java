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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminReviewServiceImpl implements AdminReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminReviewDetailResponse> getAdminReviews(AdminReviewFilterRequest filterRequest) {
        int page = (filterRequest.getPage() != null && filterRequest.getPage() >= 0) ? filterRequest.getPage() : 0;
        int size = (filterRequest.getSize() != null && filterRequest.getSize() > 0) ? filterRequest.getSize() : 10;
        String sortBy = (filterRequest.getSortBy() != null && !filterRequest.getSortBy().isBlank()) ? filterRequest.getSortBy() : "createdAt";
        Sort.Direction sortDirection = "ASC".equalsIgnoreCase(filterRequest.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<Review> reviewPage = reviewRepository.findAdminReviewsWithFilter(
                filterRequest.getRating(),
                filterRequest.getStatus(),
                filterRequest.getKeyword(),
                pageable
        );

        return reviewPage.map(this::mapToAdminReviewDetailResponse);
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

    private AdminReviewDetailResponse mapToAdminReviewDetailResponse(Review review) {
        List<String> imageUrls = review.getImages() != null ?
                review.getImages().stream().map(ReviewImage::getImageUrl).collect(Collectors.toList())
                : Collections.emptyList();

        String productName = null;
        String productImage = null;
        if (review.getProduct() != null) {
            productName = review.getProduct().getName();
            List<com.web.ap_sports.entity.ProductImage> pImages = productImageRepository.findByProductId(review.getProduct().getId());
            if (pImages != null && !pImages.isEmpty()) {
                productImage = pImages.stream()
                        .filter(com.web.ap_sports.entity.ProductImage::isPrimary)
                        .map(com.web.ap_sports.entity.ProductImage::getImagePath)
                        .findFirst()
                        .orElse(pImages.get(0).getImagePath());
            }
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
