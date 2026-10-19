package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ProductRestockNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRestockNotificationRepository extends JpaRepository<ProductRestockNotification, Long> {

    /**
     * Tìm bản ghi đăng ký đang chờ của 1 user đối với 1 biến thể cụ thể
     */
    Optional<ProductRestockNotification> findByUserIdAndVariantIdAndStatus(
            Long userId,
            Long variantId,
            ProductRestockNotification.Status status
    );

    /**
     * Lấy toàn bộ danh sách khách hàng đang chờ thông báo khi một biến thể được nhập hàng vào kho
     */
    @Query("SELECT n FROM ProductRestockNotification n " +
           "JOIN FETCH n.user u " +
           "JOIN FETCH n.product p " +
           "JOIN FETCH n.variant v " +
           "WHERE v.id = :variantId AND n.status = :status")
    List<ProductRestockNotification> findByVariantIdAndStatusWithDetails(
            @Param("variantId") Long variantId,
            @Param("status") ProductRestockNotification.Status status
    );

    /**
     * Đếm số lượng thông báo đang chờ của người dùng
     */
    long countByUserIdAndStatus(Long userId, ProductRestockNotification.Status status);

    /**
     * Kiểm tra nhanh sự tồn tại đăng ký của user cho biến thể ở trạng thái cụ thể
     */
    boolean existsByUserIdAndVariantIdAndStatus(Long userId, Long variantId, ProductRestockNotification.Status status);
}
