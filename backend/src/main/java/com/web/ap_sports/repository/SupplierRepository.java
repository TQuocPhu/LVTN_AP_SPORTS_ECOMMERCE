package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    Optional<Supplier> findByCode(String code);

    @Query("SELECT s FROM Supplier s WHERE " +
           "(CAST(:keyword AS string) IS NULL OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
           "LOWER(s.code) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
           "LOWER(s.phone) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))")
    Page<Supplier> searchSuppliers(@Param("keyword") String keyword, Pageable pageable);
}
