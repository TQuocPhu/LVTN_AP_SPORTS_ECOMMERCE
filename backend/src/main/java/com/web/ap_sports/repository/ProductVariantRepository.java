package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long>, JpaSpecificationExecutor<ProductVariant> {

    List<ProductVariant> findByProductId(Long productId);

    List<ProductVariant> findByProductIdIn(java.util.Collection<Long> productIds);

    Optional<ProductVariant> findBySku(String sku);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);


    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    void deleteByProductId(Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT v FROM ProductVariant v JOIN FETCH v.product p WHERE v.stockQuantity <= :threshold ORDER BY v.stockQuantity ASC, v.id DESC")
    java.util.List<ProductVariant> findLowStockVariants(@org.springframework.data.repository.query.Param("threshold") int threshold, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.stockQuantity <= :threshold")
    long countLowStockVariants(@org.springframework.data.repository.query.Param("threshold") int threshold);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(v) FROM ProductVariant v WHERE v.stockQuantity = 0")
    long countOutOfStockVariants();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(v.stockQuantity), 0) FROM ProductVariant v")
    long sumTotalStockQuantity();

    /**
     * Truy vấn Projection siêu nhẹ lấy trực tiếp (productId, size, attributes) của các biến thể ACTIVE
     * trên toàn sàn (hoặc lọc theo từ khóa) để trích xuất bộ lọc kích thước động mà không qua Redis.
     */
    @org.springframework.data.jpa.repository.Query(
            "SELECT v.product.id, v.size, v.attributes " +
            "FROM ProductVariant v JOIN v.product p " +
            "WHERE v.status = com.web.ap_sports.enums.ProductVariantStatus.ACTIVE " +
            "AND p.status = 'in_stock' " +
            "AND (:keywordPattern IS NULL " +
            "     OR LOWER(p.name) LIKE :keywordPattern " +
            "     OR LOWER(p.slug) LIKE :keywordPattern " +
            "     OR LOWER(v.sku) LIKE :keywordPattern)"
    )
    java.util.List<Object[]> findActiveVariantFacetsAll(
            @org.springframework.data.repository.query.Param("keywordPattern") String keywordPattern
    );

    /**
     * Truy vấn Projection siêu nhẹ lấy trực tiếp (variantId, productId, size, attributes) của các biến thể ACTIVE
     * thuộc tập danh mục đang chọn (bao gồm danh mục cha + con + cháu) và từ khóa tìm kiếm.
     */
    @org.springframework.data.jpa.repository.Query(
            "SELECT DISTINCT v.id, p.id, v.size, v.attributes " +
            "FROM ProductVariant v JOIN v.product p LEFT JOIN p.categories sc " +
            "WHERE v.status = com.web.ap_sports.enums.ProductVariantStatus.ACTIVE " +
            "AND p.status = 'in_stock' " +
            "AND (p.category.id IN :categoryIds OR sc.id IN :categoryIds) " +
            "AND (:keywordPattern IS NULL " +
            "     OR LOWER(p.name) LIKE :keywordPattern " +
            "     OR LOWER(p.slug) LIKE :keywordPattern " +
            "     OR LOWER(v.sku) LIKE :keywordPattern)"
    )
    java.util.List<Object[]> findActiveVariantFacetsByCategories(
            @org.springframework.data.repository.query.Param("categoryIds") java.util.Collection<Long> categoryIds,
            @org.springframework.data.repository.query.Param("keywordPattern") String keywordPattern
    );
}
