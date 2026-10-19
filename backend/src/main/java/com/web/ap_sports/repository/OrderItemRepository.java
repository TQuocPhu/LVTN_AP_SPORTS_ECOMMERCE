package com.web.ap_sports.repository;

import com.web.ap_sports.entity.OrderItem;
import com.web.ap_sports.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id, oi.product.name, oi.product.slug, SUM(oi.quantity), SUM(oi.price * oi.quantity) " +
           "FROM OrderItem oi " +
           "WHERE (oi.order.status = com.web.ap_sports.enums.OrderStatus.delivered OR oi.order.status = com.web.ap_sports.enums.OrderStatus.completed) " +
           "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt >= :fromDate) " +
           "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt <= :toDate) " +
           "GROUP BY oi.product.id, oi.product.name, oi.product.slug " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );

    @Query("SELECT c.id, c.name, SUM(oi.quantity), SUM(oi.price * oi.quantity) " +
           "FROM OrderItem oi " +
           "JOIN oi.product p " +
           "JOIN p.category c " +
           "WHERE (oi.order.status = com.web.ap_sports.enums.OrderStatus.delivered OR oi.order.status = com.web.ap_sports.enums.OrderStatus.completed) " +
           "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt >= :fromDate) " +
           "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt <= :toDate) " +
           "GROUP BY c.id, c.name " +
           "ORDER BY SUM(oi.price * oi.quantity) DESC")
    List<Object[]> findCategoryRevenueBreakdown(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    @Query("SELECT SUM(oi.quantity) " +
           "FROM OrderItem oi " +
           "WHERE oi.order.status IN :statuses " +
           "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt >= :fromDate) " +
           "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt <= :toDate)")
    Long sumQuantityByOrderStatusesInPeriod(
            @Param("statuses") List<OrderStatus> statuses,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    @Query("SELECT oi.variant.id, SUM(oi.quantity) " +
           "FROM OrderItem oi " +
           "WHERE oi.variant IS NOT NULL " +
           "AND oi.order.createdAt >= :fromDate " +
           "AND oi.order.status NOT IN :excludedStatuses " +
           "GROUP BY oi.variant.id")
    List<Object[]> sumQuantityByVariantInPeriod(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("excludedStatuses") List<OrderStatus> excludedStatuses
    );
}
