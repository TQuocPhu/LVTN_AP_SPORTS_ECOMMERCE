package com.web.ap_sports.repository;

import com.web.ap_sports.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("SELECT oi.product.id, oi.product.name, oi.product.slug, SUM(oi.quantity), SUM(oi.price * oi.quantity) " +
           "FROM OrderItem oi " +
           "WHERE (oi.order.status = com.web.ap_sports.enums.OrderStatus.delivered OR oi.order.status = com.web.ap_sports.enums.OrderStatus.completed) " +
           "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt >= :fromDate) " +
           "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt <= :toDate) " +
           "GROUP BY oi.product.id, oi.product.name, oi.product.slug " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts(
            @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDateTime fromDate,
            @org.springframework.data.repository.query.Param("toDate") java.time.LocalDateTime toDate,
            org.springframework.data.domain.Pageable pageable
    );

    @org.springframework.data.jpa.repository.Query("SELECT c.id, c.name, SUM(oi.quantity), SUM(oi.price * oi.quantity) " +
           "FROM OrderItem oi " +
           "JOIN oi.product p " +
           "JOIN p.category c " +
           "WHERE (oi.order.status = com.web.ap_sports.enums.OrderStatus.delivered OR oi.order.status = com.web.ap_sports.enums.OrderStatus.completed) " +
           "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt >= :fromDate) " +
           "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR oi.order.createdAt <= :toDate) " +
           "GROUP BY c.id, c.name " +
           "ORDER BY SUM(oi.price * oi.quantity) DESC")
    List<Object[]> findCategoryRevenueBreakdown(
            @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDateTime fromDate,
            @org.springframework.data.repository.query.Param("toDate") java.time.LocalDateTime toDate
    );
}
