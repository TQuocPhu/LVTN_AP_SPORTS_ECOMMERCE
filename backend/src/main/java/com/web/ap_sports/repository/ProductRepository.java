package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);
    
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByCategoriesId(Long categoryId);

    @Query("SELECT p.category.id, COUNT(DISTINCT p.id) FROM Product p WHERE p.status = 'in_stock' GROUP BY p.category.id")
    List<Object[]> countInStockProductsGroupedByPrimaryCategory();

    /**
     * Đếm số sản phẩm đang kinh doanh (in_stock) theo danh mục phụ,
     * loại trừ trường hợp danh mục phụ trùng với danh mục chính (c.id <> p.category.id) để tránh đếm nhân đôi 1 sản phẩm thành 2.
     */
    @Query("SELECT c.id, COUNT(DISTINCT p.id) FROM Product p JOIN p.categories c WHERE p.status = 'in_stock' AND (p.category IS NULL OR c.id <> p.category.id) GROUP BY c.id")
    List<Object[]> countInStockProductsGroupedBySecondaryCategory();

    /**
     * Lấy danh sách cặp [categoryId, productId] từ danh mục chính của các sản phẩm đang kinh doanh (in_stock)
     * phục vụ gộp tập hợp Set<Long> chống trùng lặp tuyệt đối khi cộng dồn từ danh mục con lên danh mục cha.
     */
    @Query("SELECT p.category.id, p.id FROM Product p WHERE p.status = 'in_stock' AND p.category IS NOT NULL")
    List<Object[]> findInStockPrimaryCategoryProductPairs();

    /**
     * Lấy danh sách cặp [categoryId, productId] từ bảng danh mục phụ (product_categories) của các sản phẩm đang kinh doanh (in_stock).
     */
    @Query("SELECT c.id, p.id FROM Product p JOIN p.categories c WHERE p.status = 'in_stock'")
    List<Object[]> findInStockSecondaryCategoryProductPairs();

    /**
     * Truy vấn tất cả sản phẩm đang kinh doanh (in_stock) kèm danh mục để đưa vào tập dữ liệu (Corpus)
     * cho thuật toán tìm kiếm TF-IDF & Attribute Scoring trên bộ nhớ Java
     */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.categories WHERE p.status = 'in_stock'")
    List<Product> findAllInStockProductsWithCategories();

    /**
     * Nạp hàng loạt sản phẩm kèm danh mục từ bảng trung gian product_categories theo danh sách ID.
     */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.categories WHERE p.id IN :ids")
    List<Product> findAllWithCategoriesByIdIn(@Param("ids") java.util.Collection<Long> ids);

    /**
     * Nạp toàn bộ sản phẩm kèm danh mục từ bảng trung gian product_categories phục vụ thống kê Dashboard.
     */
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.categories")
    List<Product> findAllProductsWithCategories();

    @Query(
        value = "SELECT DISTINCT p.*, " +
                "((CASE WHEN LOWER(p.name) = LOWER(:keyword) THEN 100 ELSE 0 END) + " +
                "(CASE WHEN LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 50 ELSE 0 END) + " +
                "(CASE WHEN (EXISTS (SELECT 1 FROM product_categories pc JOIN categories c2 ON c2.id = pc.category_id WHERE pc.product_id = p.id AND LOWER(c2.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR EXISTS (SELECT 1 FROM categories c WHERE c.id = p.category_id AND LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))) THEN 30 ELSE 0 END) + " +
                "(CASE WHEN EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND (LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.color) LIKE LOWER(CONCAT('%', :keyword, '%')))) THEN 20 ELSE 0 END) + " +
                "(CASE WHEN LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) THEN 10 ELSE 0 END)) AS relevance_score " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.status = 'in_stock' AND (" +
                "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                "EXISTS (SELECT 1 FROM product_categories pc JOIN categories c2 ON c2.id = pc.category_id WHERE pc.product_id = p.id AND LOWER(c2.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                "EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND (LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.color) LIKE LOWER(CONCAT('%', :keyword, '%')))) OR " +
                "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
                ") ORDER BY relevance_score DESC, p.id DESC",
        countQuery = "SELECT COUNT(DISTINCT p.id) FROM products p " +
                     "LEFT JOIN categories c ON p.category_id = c.id " +
                     "WHERE p.status = 'in_stock' AND (" +
                     "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "EXISTS (SELECT 1 FROM product_categories pc JOIN categories c2 ON c2.id = pc.category_id WHERE pc.product_id = p.id AND LOWER(c2.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
                     "EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND (LOWER(v.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(v.color) LIKE LOWER(CONCAT('%', :keyword, '%')))) OR " +
                     "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
                     ")",
        nativeQuery = true
    )
    org.springframework.data.domain.Page<Product> searchProductsByRelevanceScoring(
        @org.springframework.data.repository.query.Param("keyword") String keyword,
        org.springframework.data.domain.Pageable pageable
    );

    /**
     * Tìm Top sản phẩm đang kinh doanh theo từ khóa tên phục vụ Pre-filtering context cho AI
     */
    List<Product> findTop6ByStatusAndNameContainingIgnoreCaseOrderByIdDesc(String status, String name);

    /**
     * Lấy Top sản phẩm mới nhất đang kinh doanh khi người dùng hỏi chung chung
     */
    List<Product> findTop6ByStatusOrderByIdDesc(String status);

    /**
     * Lấy danh sách ID sản phẩm đang kinh doanh (in_stock) xếp hạng theo điểm đánh giá cao nhất.
     * - Dùng LEFT JOIN với reviews (status = 'approved') để vẫn giữ sản phẩm chưa có đánh giá làm nguồn bù nếu chưa đủ limit.
     * - COALESCE(AVG(r.rating), 0.0) chuyển NULL thành 0.0 để sản phẩm chưa có review luôn xếp sau khi ORDER BY DESC.
     * - Thứ tự ưu tiên: Điểm sao trung bình giảm dần -> Số lượt đánh giá giảm dần -> Ngày tạo mới nhất.
     */
    @Query(
        "SELECT p.id FROM Product p " +
        "LEFT JOIN Review r ON r.product.id = p.id AND r.status = 'approved' " +
        "WHERE p.status = 'in_stock' " +
        "GROUP BY p.id, p.createdAt " +
        "ORDER BY COALESCE(AVG(r.rating), 0.0) DESC, COUNT(r.id) DESC, p.createdAt DESC"
    )
    List<Long> findTopRatedProductIds(org.springframework.data.domain.Pageable pageable);

    /**
     * Lấy danh sách ID sản phẩm nổi bật (in_stock) theo 3 tầng ưu tiên:
     * - Mức 2: Vừa có đơn hàng thành công (delivered/completed) vừa có đánh giá tốt (>= 4.0 sao).
     * - Mức 1: Có đơn hàng thành công hoặc có đánh giá đã duyệt.
     * - Mức 0: Chưa có đơn hàng và chưa có đánh giá (tự động bù theo sản phẩm mới nhất created_at DESC nếu chưa đủ limit).
     * Lưu ý kỹ thuật: Tách 2 subquery tổng hợp sẵn `sales` và `rev` theo product_id trước khi LEFT JOIN
     * để tránh tích Đề-các (Cartesian product) làm nhân sai số lượng bán SUM(oi.quantity) và lượt đánh giá COUNT(r.id).
     */
    @Query(
        value = "SELECT p.id " +
                "FROM products p " +
                "LEFT JOIN (" +
                // Subquery 1: Tổng hợp số lượng đã bán thực tế từ các đơn đã giao / hoàn tất
                "  SELECT oi.product_id, COALESCE(SUM(oi.quantity), 0) AS sold_qty " +
                "  FROM order_items oi " +
                "  JOIN orders o ON oi.order_id = o.id " +
                "  WHERE o.status IN ('delivered', 'completed') " +
                "  GROUP BY oi.product_id" +
                ") sales ON sales.product_id = p.id " +
                "LEFT JOIN (" +
                // Subquery 2: Tổng hợp điểm sao trung bình và số lượt đánh giá đã duyệt
                "  SELECT r.product_id, COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS review_cnt " +
                "  FROM reviews r " +
                "  WHERE r.status = 'approved' " +
                "  GROUP BY r.product_id" +
                ") rev ON rev.product_id = p.id " +
                "WHERE p.status = 'in_stock' " +
                "ORDER BY " +
                "  CASE WHEN COALESCE(sales.sold_qty, 0) > 0 AND COALESCE(rev.avg_rating, 0) >= 4.0 THEN 2 " +
                "       WHEN COALESCE(sales.sold_qty, 0) > 0 OR COALESCE(rev.review_cnt, 0) > 0 THEN 1 " +
                "       ELSE 0 END DESC, " +
                "  COALESCE(sales.sold_qty, 0) DESC, " +
                "  COALESCE(rev.avg_rating, 0) DESC, " +
                "  COALESCE(rev.review_cnt, 0) DESC, " +
                "  p.created_at DESC",
        nativeQuery = true
    )
    List<Long> findFeaturedProductIds(org.springframework.data.domain.Pageable pageable);
}

