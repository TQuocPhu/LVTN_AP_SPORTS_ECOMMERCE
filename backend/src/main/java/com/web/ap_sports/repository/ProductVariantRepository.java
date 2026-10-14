package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByProductIdIn(java.util.Collection<Long> productIds);

    Optional<ProductVariant> findBySku(String sku);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);


    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    void deleteByProductId(Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p WHERE v.stockQuantity <= :threshold ORDER BY v.stockQuantity ASC")
    java.util.List<ProductVariant> findLowStockVariants(@org.springframework.data.repository.query.Param("threshold") int threshold, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.stockQuantity <= :threshold")
    long countLowStockVariants(@org.springframework.data.repository.query.Param("threshold") int threshold);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.stockQuantity = 0")
    long countOutOfStockVariants();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(v.stockQuantity), 0) FROM ProductVariant v")
    long sumTotalStockQuantity();
}
