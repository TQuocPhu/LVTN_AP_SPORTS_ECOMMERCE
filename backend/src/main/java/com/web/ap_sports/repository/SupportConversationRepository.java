package com.web.ap_sports.repository;

import com.web.ap_sports.entity.SupportConversation;
import com.web.ap_sports.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportConversationRepository extends JpaRepository<SupportConversation, Long> {

    /**
     * Tìm ca hỗ trợ đang hoạt động của khách hàng (chống spam mở nhiều ca)
     */
    Optional<SupportConversation> findFirstByCustomerIdAndStatusInOrderByCreatedAtDesc(
            Long customerId, List<String> statuses);

    /**
     * Tìm ca hỗ trợ đang hoạt động của khách hàng:
     * - Đang chờ tiếp nhận (WAITING)
     * - Đang trò chuyện (IN_PROGRESS)
     * - Đã giải quyết nhưng khách chưa đánh giá (RESOLVED và rating is null)
     */
    @Query("SELECT c FROM SupportConversation c WHERE c.customer.id = :customerId " +
           "AND (c.status IN ('WAITING', 'IN_PROGRESS') OR (c.status = 'RESOLVED' AND c.rating IS NULL)) " +
           "ORDER BY c.createdAt DESC")
    List<SupportConversation> findActiveConversationsForCustomer(@Param("customerId") Long customerId);

    /**
     * Tìm toàn bộ lịch sử ca hỗ trợ của khách hàng
     */
    Page<SupportConversation> findByCustomerIdOrderByLastMessageAtDesc(Long customerId, Pageable pageable);

    /**
     * Lấy hàng đợi các ca chờ tiếp nhận (WAITING) cho nhân viên trực ca
     */
    List<SupportConversation> findByStatusOrderByCreatedAtAsc(String status);

    /**
     * Lấy danh sách ca đang phụ trách của nhân viên
     */
    List<SupportConversation> findByStaffIdAndStatusInOrderByLastMessageAtDesc(Long staffId, List<String> statuses);

    /**
     * Lấy lịch sử ca hỗ trợ đã hoàn tất hoặc đã đóng (RESOLVED, CLOSED)
     */
    Page<SupportConversation> findByStatusInOrderByLastMessageAtDesc(List<String> statuses, Pageable pageable);

    Page<SupportConversation> findByStaffIdAndStatusInOrderByLastMessageAtDesc(Long staffId, List<String> statuses, Pageable pageable);

    /**
     * Tiếp nhận ca an toàn chống tranh chấp (Atomic Conditional Update)
     * Trả về số dòng cập nhật. Nếu == 0 nghĩa là đã có nhân viên khác nhận trước.
     */
    @Modifying
    @Query("UPDATE SupportConversation c SET c.staff = :staff, c.status = 'IN_PROGRESS', c.acceptedAt = CURRENT_TIMESTAMP " +
           "WHERE c.id = :convId AND c.status = 'WAITING'")
    int assignStaffAtomically(@Param("convId") Long convId, @Param("staff") User staff);

    /**
     * Cập nhật thời điểm đọc tin cuối của khách hàng
     */
    @Modifying
    @Query("UPDATE SupportConversation c SET c.customerLastReadAt = CURRENT_TIMESTAMP WHERE c.id = :convId")
    void markCustomerRead(@Param("convId") Long convId);

    /**
     * Cập nhật thời điểm đọc tin cuối của nhân viên
     */
    @Modifying
    @Query("UPDATE SupportConversation c SET c.staffLastReadAt = CURRENT_TIMESTAMP WHERE c.id = :convId")
    void markStaffRead(@Param("convId") Long convId);
}
