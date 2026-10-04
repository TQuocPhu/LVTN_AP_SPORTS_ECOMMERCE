package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.customer.CreateReviewRequest;
import com.web.ap_sports.dto.response.customer.ProductReviewSummaryResponse;
import com.web.ap_sports.dto.response.customer.ReviewResponse;
import com.web.ap_sports.entity.*;
import com.web.ap_sports.repository.*;
import com.web.ap_sports.service.common.CloudinaryService;
import com.web.ap_sports.service.customer.CustomerReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerReviewServiceImpl implements CustomerReviewService {

    private static final String REVIEW_FOLDER = "ap-sports-e-commerce/reviews";

    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ReviewResponse createReview(String userEmail, CreateReviewRequest request) {
        // 1. Kiểm tra tài khoản khách hàng
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Khách hàng không tồn tại"));

        // 2. Kiểm tra sản phẩm
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại"));

        // 3. Kiểm tra OrderItem trong đơn hàng
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new IllegalArgumentException("Chi tiết mục đơn hàng không tồn tại"));

        // Kiểm tra khớp sản phẩm với mục đơn hàng
        if (orderItem.getProduct() == null || !orderItem.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Sản phẩm đánh giá không khớp với mục đơn hàng");
        }

        // 4. Kiểm tra quyền sở hữu đơn hàng & Trạng thái giao hàng thành công (delivered)
        Order order = orderItem.getOrder();
        if (order == null || !order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Mục đơn hàng này không thuộc về tài khoản của bạn");
        }
        if (order.getStatus() != com.web.ap_sports.enums.OrderStatus.delivered && order.getStatus() != com.web.ap_sports.enums.OrderStatus.completed) {
            throw new IllegalArgumentException("Chỉ có thể viết đánh giá cho sản phẩm thuộc đơn hàng đã giao thành công");
        }

        // 5. Kiểm tra quy tắc: Mỗi OrderItem chỉ được phép đánh giá 1 lần
        if (reviewRepository.existsByOrderItemId(orderItem.getId())) {
            throw new IllegalArgumentException("Mục đơn hàng này đã được gửi đánh giá trước đó");
        }

        // 6. Xử lý tải ảnh song song lên Cloudinary (nếu có) - giữ nguyên thứ tự ảnh người dùng chọn
        List<String> uploadedCloudinaryUrls = new ArrayList<>();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            log.info("Bắt đầu tải {} hình ảnh đánh giá sản phẩm lên Cloudinary...", request.getImageUrls().size());
            Map<String, String> uploadMap = cloudinaryService.uploadBase64OrUrlBatch(
                    request.getImageUrls(),
                    REVIEW_FOLDER
            );
            for (String source : request.getImageUrls()) {
                String uploadedUrl = uploadMap.get(source);
                if (uploadedUrl == null || uploadedUrl.isBlank()) {
                    throw new IllegalStateException("Tải ảnh đánh giá lên Cloudinary thất bại, vui lòng thử lại");
                }
                if (!uploadedCloudinaryUrls.contains(uploadedUrl)) {
                    uploadedCloudinaryUrls.add(uploadedUrl);
                }
            }
        }

        // 7. Tạo Entity Review
        Review review = Review.builder()
                .user(user)
                .product(product)
                .orderItem(orderItem)
                .rating(request.getRating())
                .comment(request.getComment())
                .status("approved") // Mặc định phê duyệt hiển thị ngay
                .build();

        // saveAndFlush để unique constraint (order_item_id) được kiểm tra ngay, chống gửi trùng khi đồng thời
        Review savedReview;
        try {
            savedReview = reviewRepository.saveAndFlush(review);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Mục đơn hàng này đã được gửi đánh giá trước đó");
        }

        // 8. Lưu các hình ảnh đính kèm
        if (!uploadedCloudinaryUrls.isEmpty()) {
            List<ReviewImage> reviewImages = uploadedCloudinaryUrls.stream()
                    .map(url -> ReviewImage.builder()
                            .review(savedReview)
                            .imageUrl(url)
                            .build())
                    .collect(Collectors.toList());
            reviewImageRepository.saveAll(reviewImages);
            savedReview.setImages(reviewImages);
        }

        log.info("Tạo mới thành công bài đánh giá ID: {} cho sản phẩm ID: {} từ khách hàng: {}",
                savedReview.getId(), product.getId(), user.getEmail());

        return mapToReviewResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Integer rating, Boolean withImagesOnly, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage;

        boolean filterByRating = rating != null && rating >= 1 && rating <= 5;
        boolean filterByImages = Boolean.TRUE.equals(withImagesOnly);

        if (filterByImages && filterByRating) {
            reviewPage = reviewRepository.findWithImagesAndRatingByProductIdAndStatus(productId, rating, "approved", pageable);
        } else if (filterByImages) {
            reviewPage = reviewRepository.findWithImagesByProductIdAndStatus(productId, "approved", pageable);
        } else if (filterByRating) {
            reviewPage = reviewRepository.findByProductIdAndStatusAndRatingOrderByCreatedAtDesc(productId, "approved", rating, pageable);
        } else {
            reviewPage = reviewRepository.findByProductIdAndStatusOrderByCreatedAtDesc(productId, "approved", pageable);
        }

        return reviewPage.map(this::mapToReviewResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewSummaryResponse getProductReviewSummary(Long productId) {
        Double avgRating = reviewRepository.findAverageRatingByProductId(productId);

        // 1 query GROUP BY thay cho 6 query đếm riêng lẻ
        Map<Integer, Long> starCounts = new HashMap<>();
        for (Object[] row : reviewRepository.countApprovedByRating(productId)) {
            starCounts.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        long c1 = starCounts.getOrDefault(1, 0L);
        long c2 = starCounts.getOrDefault(2, 0L);
        long c3 = starCounts.getOrDefault(3, 0L);
        long c4 = starCounts.getOrDefault(4, 0L);
        long c5 = starCounts.getOrDefault(5, 0L);
        long total = c1 + c2 + c3 + c4 + c5;

        double roundedAvg = avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 5.0;

        return ProductReviewSummaryResponse.builder()
                .averageRating(roundedAvg)
                .totalReviews(total)
                .fiveStarCount(c5)
                .fourStarCount(c4)
                .threeStarCount(c3)
                .twoStarCount(c2)
                .oneStarCount(c1)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getReviewedOrderItemIds(String userEmail, List<Long> orderItemIds) {
        if (orderItemIds == null || orderItemIds.isEmpty()) return Collections.emptyList();
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return Collections.emptyList();

        return reviewRepository.findReviewedOrderItemIdsByUser(user.getId(), orderItemIds);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        List<String> imageUrls = review.getImages() != null ?
                review.getImages().stream().map(ReviewImage::getImageUrl).collect(Collectors.toList())
                : Collections.emptyList();

        return ReviewResponse.builder()
                .id(review.getId())
                .userName(review.getUser() != null ? review.getUser().getName() : "Khách hàng AP Sports")
                .userAvatar(review.getUser() != null ? review.getUser().getAvatar() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrls(imageUrls)
                .adminReply(review.getAdminReply())
                .repliedByName(review.getRepliedBy() != null ? review.getRepliedBy().getName() : null)
                .repliedAt(review.getRepliedAt())
                .createdAt(review.getCreatedAt())
                .verifiedPurchase(review.getOrderItem() != null)
                .build();
    }
}
