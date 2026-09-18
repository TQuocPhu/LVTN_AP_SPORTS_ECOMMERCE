package com.web.ap_sports.repository;

import com.web.ap_sports.entity.InventoryTransaction;
import com.web.ap_sports.entity.InventoryTransaction.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {

    @Query(value = "SELECT it FROM InventoryTransaction it " +
           "LEFT JOIN FETCH it.variant v " +
           "LEFT JOIN FETCH v.product p " +
           "LEFT JOIN FETCH it.supplier s " +
           "LEFT JOIN FETCH it.createdBy u " +
           "WHERE (:type IS NULL OR it.type = :type) " +
           "AND (:supplierId IS NULL OR (s IS NOT NULL AND s.id = :supplierId)) " +
           "AND (CAST(:keyword AS string) IS NULL OR " +
           "     LOWER(it.code) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
           "     LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
           "     LOWER(v.sku) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
           "     LOWER(it.note) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
           "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR it.createdAt >= :fromDate) " +
           "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR it.createdAt <= :toDate)",
           countQuery = "SELECT COUNT(it) FROM InventoryTransaction it " +
                        "LEFT JOIN it.variant v " +
                        "LEFT JOIN v.product p " +
                        "LEFT JOIN it.supplier s " +
                        "WHERE (:type IS NULL OR it.type = :type) " +
                        "AND (:supplierId IS NULL OR (s IS NOT NULL AND s.id = :supplierId)) " +
                        "AND (CAST(:keyword AS string) IS NULL OR " +
                        "     LOWER(it.code) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
                        "     LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
                        "     LOWER(v.sku) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
                        "     LOWER(it.note) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) " +
                        "AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR it.createdAt >= :fromDate) " +
                        "AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR it.createdAt <= :toDate)")
    Page<InventoryTransaction> searchTransactions(
            @Param("type") TransactionType type,
            @Param("supplierId") Long supplierId,
            @Param("keyword") String keyword,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );

    java.util.List<InventoryTransaction> findByCode(String code);

    @Query("SELECT SUM(it.quantity) FROM InventoryTransaction it WHERE it.type = :type AND (CAST(:fromDate AS java.time.LocalDateTime) IS NULL OR it.createdAt >= :fromDate) AND (CAST(:toDate AS java.time.LocalDateTime) IS NULL OR it.createdAt <= :toDate)")
    Long sumQuantityByTypeInPeriod(@Param("type") TransactionType type, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    @Query("SELECT SUM(v.stockQuantity * COALESCE(v.costPrice, v.price)) FROM ProductVariant v WHERE v.stockQuantity > 0")
    BigDecimal sumTotalInventoryValue();
}
