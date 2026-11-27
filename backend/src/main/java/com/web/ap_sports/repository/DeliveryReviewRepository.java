package com.web.ap_sports.repository;

import com.web.ap_sports.entity.DeliveryReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeliveryReviewRepository extends JpaRepository<DeliveryReview, Long>, JpaSpecificationExecutor<DeliveryReview> {

    Optional<DeliveryReview> findByOrderId(Long orderId);

    boolean existsByOrderId(Long orderId);

    @Query("SELECT COALESCE(AVG(dr.rating), 0) FROM DeliveryReview dr")
    double getAverageRating();

    long countByRatingGreaterThanEqual(Integer rating);

    long countByAdminReplyIsNull();
}
