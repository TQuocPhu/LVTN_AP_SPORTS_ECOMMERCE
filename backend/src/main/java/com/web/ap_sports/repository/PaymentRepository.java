package com.web.ap_sports.repository;

import com.web.ap_sports.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    List<Payment> findByOrderIdIn(Collection<Long> orderIds);
    Optional<Payment> findByVnpTxnRef(String vnpTxnRef);
}
