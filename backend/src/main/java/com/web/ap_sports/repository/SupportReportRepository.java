package com.web.ap_sports.repository;

import com.web.ap_sports.entity.SupportReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportReportRepository extends JpaRepository<SupportReport, Long> {

    /**
     * Danh sách báo cáo vi phạm phân trang cho Admin
     */
    Page<SupportReport> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    /**
     * Danh sách báo cáo theo trạng thái không phân trang
     */
    List<SupportReport> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * Lịch sử báo cáo đối với một khách hàng cụ thể
     */
    List<SupportReport> findByReportedCustomerIdOrderByCreatedAtDesc(Long customerId);

    /**
     * Kiểm tra xem ca hỗ trợ đã có báo cáo với trạng thái cụ thể (ví dụ PENDING) chưa
     */
    boolean existsByConversationIdAndStatus(Long conversationId, String status);

    /**
     * Lấy báo cáo vi phạm mới nhất của một ca hỗ trợ theo trạng thái (ví dụ PENDING để Admin xem xét)
     */
    Optional<SupportReport> findFirstByConversationIdAndStatusOrderByCreatedAtDesc(Long conversationId, String status);
}
