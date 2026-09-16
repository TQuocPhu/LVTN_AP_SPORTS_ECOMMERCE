package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProductId(Long productId);

    List<ProductImage> findByVariantId(Long variantId);

    void deleteByProductId(Long productId);
}
