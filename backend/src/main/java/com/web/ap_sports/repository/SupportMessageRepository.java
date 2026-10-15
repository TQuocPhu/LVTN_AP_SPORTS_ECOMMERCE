package com.web.ap_sports.repository;

import com.web.ap_sports.entity.SupportMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {

    /**
     * Lấy toàn bộ tin nhắn của một phiên chat theo thứ tự thời gian tăng dần
     */
    List<SupportMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    /**
     * Phân trang tin nhắn nếu cuộc hội thoại quá dài
     */
    Page<SupportMessage> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    /**
     * Đếm toàn bộ tin nhắn theo vai trò người gửi khi chưa có mốc đọc (lastRead is null)
     */
    long countByConversationIdAndSenderRole(Long conversationId, String senderRole);

    /**
     * Đếm tin nhắn theo vai trò người gửi sau một mốc thời gian cụ thể (lastRead != null)
     */
    long countByConversationIdAndSenderRoleAndCreatedAtAfter(Long conversationId, String senderRole, LocalDateTime createdAt);

    /**
     * Đếm số tin nhắn chưa đọc của nhân viên (khách gửi sau mốc staff_last_read_at).
     * Phân nhánh trực tiếp trên Java để PostgreSQL tối ưu Index và tránh lỗi infer kiểu dữ liệu khi param null.
     */
    default long countUnreadForStaff(Long convId, LocalDateTime lastRead) {
        if (lastRead == null) {
            return countByConversationIdAndSenderRole(convId, "CUSTOMER");
        }
        return countByConversationIdAndSenderRoleAndCreatedAtAfter(convId, "CUSTOMER", lastRead);
    }

    /**
     * Đếm số tin nhắn chưa đọc của khách hàng (nhân viên gửi sau mốc customer_last_read_at).
     */
    default long countUnreadForCustomer(Long convId, LocalDateTime lastRead) {
        if (lastRead == null) {
            return countByConversationIdAndSenderRole(convId, "STAFF");
        }
        return countByConversationIdAndSenderRoleAndCreatedAtAfter(convId, "STAFF", lastRead);
    }
}
