package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.web.ap_sports.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByOrderCode(String orderCode);
    
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.orderCode = :orderCode")
    Optional<Order> findByOrderCodeForUpdate(@org.springframework.data.repository.query.Param("orderCode") String orderCode);
    
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
    
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.orderCode = :orderCode AND o.user.id = :userId")
    Optional<Order> findByOrderCodeAndUserIdForUpdate(@org.springframework.data.repository.query.Param("orderCode") String orderCode, @org.springframework.data.repository.query.Param("userId") Long userId);
    
    Optional<Order> findByOrderCodeAndUserId(String orderCode, Long userId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status, Pageable pageable);
    long countByUserIdAndCouponIdAndStatusNotIn(Long userId, Long couponId, List<OrderStatus> excludedStatuses);

    @Query("SELECT o.coupon.id, COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.coupon IS NOT NULL AND o.status NOT IN :excludedStatuses GROUP BY o.coupon.id")
    List<Object[]> findCouponUsageCountsByUserId(
            @org.springframework.data.repository.query.Param("userId") Long userId,
            @org.springframework.data.repository.query.Param("excludedStatuses") List<OrderStatus> excludedStatuses);
    long countByUserIdAndStatusIn(Long userId, List<OrderStatus> statuses);
    List<Order> findByUserIdAndStatusIn(Long userId, List<OrderStatus> statuses);

    long countByStatus(OrderStatus status);
    boolean existsByShippingAddressId(Long shippingAddressId);

    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.status = com.web.ap_sports.enums.OrderStatus.delivered OR o.status = com.web.ap_sports.enums.OrderStatus.completed")
    BigDecimal sumDeliveredRevenue();

    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.processedByStaff " +
           "LEFT JOIN FETCH o.user " +
           "WHERE (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR o.createdAt >= :fromDate) " +
           "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR o.createdAt <= :toDate) " +
           "AND (:staffId IS NULL OR (o.processedByStaff IS NOT NULL AND o.processedByStaff.id = :staffId)) " +
           "ORDER BY o.createdAt ASC")
    List<Order> findOrdersForReport(
            @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDateTime fromDate,
            @org.springframework.data.repository.query.Param("toDate") java.time.LocalDateTime toDate,
            @org.springframework.data.repository.query.Param("staffId") Long staffId
    );

    Page<Order> findByProcessedByStaffIdOrderByCreatedAtDesc(Long staffId, Pageable pageable);

    /**
     * Tìm ID các đơn hàng VNPay còn ở trạng thái pending quá thời hạn thanh toán (15 phút)
     * để Scheduler tự động chuyển sang payment_failed và hoàn trả tồn kho.
     */
    @Query("SELECT DISTINCT o.id FROM Order o JOIN Payment p ON p.order.id = o.id " +
           "WHERE o.status = com.web.ap_sports.enums.OrderStatus.pending " +
           "AND p.paymentMethod = com.web.ap_sports.entity.Payment$PaymentMethod.vnpay " +
           "AND p.status = com.web.ap_sports.entity.Payment$PaymentStatus.pending " +
           "AND COALESCE(o.updatedAt, o.createdAt) < :cutoffTime")
    List<Long> findExpiredPendingVNPayOrderIds(
            @org.springframework.data.repository.query.Param("cutoffTime") java.time.LocalDateTime cutoffTime
    );
}
