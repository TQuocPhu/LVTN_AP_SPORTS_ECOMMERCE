package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ShippingAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {

    List<ShippingAddress> findByUserIdOrderByIsDefaultDescCreatedAtDesc(Long userId);

    Optional<ShippingAddress> findByIdAndUserId(Long id, Long userId);

    Optional<ShippingAddress> findByUserIdAndIsDefaultTrue(Long userId);

    long countByUserId(Long userId);

    @Modifying
    @Query("UPDATE ShippingAddress sa SET sa.isDefault = false WHERE sa.user.id = :userId")
    void resetDefaultAddressByUserId(@Param("userId") Long userId);
}
