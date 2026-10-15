package com.web.ap_sports.repository;

import com.web.ap_sports.entity.SupportReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportReportRepository extends JpaRepository<SupportReport, Long> {

    /**
     * Danh sách báo cáo vi phạm phân trang cho Admin
     */
    Page<SupportReport> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    /**
     * Lịch sử báo cáo đối với một khách hàng cụ thể
     */
    List<SupportReport> findByReportedCustomerIdOrderByCreatedAtDesc(Long customerId);
}
