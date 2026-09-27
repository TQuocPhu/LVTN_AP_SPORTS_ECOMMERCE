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
    Optional<Order> findByIdAndUserId(Long id, Long userId);
    Optional<Order> findByOrderCodeAndUserId(String orderCode, Long userId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status, Pageable pageable);
    long countByUserIdAndCouponIdAndStatusNotIn(Long userId, Long couponId, List<OrderStatus> excludedStatuses);

    long countByStatus(OrderStatus status);
    boolean existsByShippingAddressId(Long shippingAddressId);

    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.status = com.web.ap_sports.enums.OrderStatus.delivered OR o.status = com.web.ap_sports.enums.OrderStatus.completed")
    BigDecimal sumDeliveredRevenue();
}
