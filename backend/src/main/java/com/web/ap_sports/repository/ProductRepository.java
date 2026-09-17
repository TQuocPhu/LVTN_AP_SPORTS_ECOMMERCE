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
}
