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
    long countByUserIdAndStatusIn(Long userId, List<OrderStatus> statuses);
    List<Order> findByUserIdAndStatusIn(Long userId, List<OrderStatus> statuses);

    long countByStatus(OrderStatus status);
    boolean existsByShippingAddressId(Long shippingAddressId);

    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.status = com.web.ap_sports.enums.OrderStatus.delivered OR o.status = com.web.ap_sports.enums.OrderStatus.completed")
    BigDecimal sumDeliveredRevenue();
}
