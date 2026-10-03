package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Lấy danh sách đánh giá hiển thị công khai cho sản phẩm (status = 'approved')
     */
    Page<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Long productId, String status, Pageable pageable);

    /**
     * Lọc đánh giá công khai cho sản phẩm theo số sao (1-5)
     */
    Page<Review> findByProductIdAndStatusAndRatingOrderByCreatedAtDesc(Long productId, String status, Integer rating, Pageable pageable);

    /**
     * Lọc các đánh giá công khai có hình ảnh cho sản phẩm
     */
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.status = :status AND SIZE(r.images) > 0 ORDER BY r.createdAt DESC")
    Page<Review> findWithImagesByProductIdAndStatus(@Param("productId") Long productId, @Param("status") String status, Pageable pageable);

    /**
     * Lọc các đánh giá công khai có hình ảnh kết hợp số sao cho sản phẩm
     */
    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.status = :status AND r.rating = :rating AND SIZE(r.images) > 0 ORDER BY r.createdAt DESC")
    Page<Review> findWithImagesAndRatingByProductIdAndStatus(@Param("productId") Long productId, @Param("rating") Integer rating, @Param("status") String status, Pageable pageable);

    /**
     * Kiểm tra xem OrderItem cụ thể đã được viết đánh giá chưa
     */
    boolean existsByOrderItemId(Long orderItemId);

    /**
     * Tìm danh sách OrderItem IDs đã được đánh giá bởi User cho danh sách OrderItem IDs truyền vào
     */
    @Query("SELECT r.orderItem.id FROM Review r WHERE r.user.id = :userId AND r.orderItem.id IN :orderItemIds")
    List<Long> findReviewedOrderItemIdsByUser(@Param("userId") Long userId, @Param("orderItemIds") List<Long> orderItemIds);

    /**
     * Tính điểm sao trung bình cho sản phẩm
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = 'approved'")
    Double findAverageRatingByProductId(@Param("productId") Long productId);

    /**
     * Đếm tổng số đánh giá đã phê duyệt cho sản phẩm
     */
    Long countByProductIdAndStatus(Long productId, String status);

    /**
     * Đếm số lượt đánh giá từng mốc sao (1-5)
     */
    Long countByProductIdAndStatusAndRating(Long productId, String status, Integer rating);

    /**
     * Tìm kiếm & Lọc đánh giá cho Admin với Bộ lọc Phân trang
     */
    @Query("SELECT r FROM Review r WHERE " +
           "(:rating IS NULL OR r.rating = :rating) AND " +
           "(:status IS NULL OR :status = 'ALL' OR r.status = :status) AND " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           " LOWER(r.product.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(r.user.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           " LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Review> findAdminReviewsWithFilter(
            @Param("rating") Integer rating,
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable);
}
