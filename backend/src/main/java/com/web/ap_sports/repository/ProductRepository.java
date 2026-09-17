package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByCategoriesId(Long categoryId);

    @Query("SELECT p.category.id, COUNT(DISTINCT p.id) FROM Product p WHERE p.status = 'in_stock' GROUP BY p.category.id")
    List<Object[]> countInStockProductsGroupedByPrimaryCategory();

    @Query("SELECT c.id, COUNT(DISTINCT p.id) FROM Product p JOIN p.categories c WHERE p.status = 'in_stock' GROUP BY c.id")
    List<Object[]> countInStockProductsGroupedBySecondaryCategory();

    /**
     * Truy vấn tất cả sản phẩm đang kinh doanh (in_stock) kèm danh mục để đưa vào tập dữ liệu (Corpus)
     * cho thuật toán tìm kiếm TF-IDF & Attribute Scoring trên bộ nhớ Java
     */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE p.status = 'in_stock'")
    List<Product> findAllInStockProductsWithCategories();

    @Query(
        value = "SELECT DISTINCT p.*, " +
                "((CASE WHEN LOWER(p.name) = LOWER(:keyword) THEN 100 ELSE 0 END) + " +
                "(CASE WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 50 ELSE 0 END) + " +
                "(CASE WHEN EXISTS (SELECT 1 FROM categories c WHERE c.id = p.category_id AND LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) THEN 30 ELSE 0 END) + " +
                "(CASE WHEN EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND (LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.color) LIKE LOWER(CONCAT('%', :keyword, '%')))) THEN 20 ELSE 0 END) + " +
                "(CASE WHEN LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 10 ELSE 0 END)) AS relevance_score " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.status = 'in_stock' AND (" +
                "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                "EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND (LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.color) LIKE LOWER(CONCAT('%', :keyword, '%')))) OR " +
                "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
                ") ORDER BY relevance_score DESC, p.id DESC",
        countQuery = "SELECT COUNT(DISTINCT p.id) FROM products p " +
                     "LEFT JOIN categories c ON p.category_id = c.id " +
                     "WHERE p.status = 'in_stock' AND (" +
                     "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND (LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.color) LIKE LOWER(CONCAT('%', :keyword, '%')))) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
                     ")",
        nativeQuery = true
    )
    org.springframework.data.domain.Page<Product> searchProductsByRelevanceScoring(
        @org.springframework.data.repository.query.Param("keyword") String keyword,
        org.springframework.data.domain.Pageable pageable
    );
}

