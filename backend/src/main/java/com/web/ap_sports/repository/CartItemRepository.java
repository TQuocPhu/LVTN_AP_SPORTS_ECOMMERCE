package com.web.ap_sports.repository;

import com.web.ap_sports.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<CartItem> findByUserIdAndProductIdAndVariantId(Long userId, Long productId, Long variantId);

    Optional<CartItem> findByUserIdAndProductIdAndVariantIsNull(Long userId, Long productId);

    List<CartItem> findByUserIdAndIdIn(Long userId, List<Long> ids);

    List<CartItem> findByUserIdAndIsSelectedTrue(Long userId);

    void deleteByUserIdAndId(Long userId, Long id);

    void deleteAllByUserId(Long userId);

    void deleteAllByUserIdAndIdIn(Long userId, List<Long> ids);
}
