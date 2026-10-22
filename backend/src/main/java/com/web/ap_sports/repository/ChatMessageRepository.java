package com.web.ap_sports.repository;

import com.web.ap_sports.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository thao tác với bảng chat_messages (tin nhắn hội thoại giữa Khách hàng, Trợ lý AI Bot và Nhân viên CSKH).
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Lấy danh sách tin nhắn gần nhất của người dùng đã đăng nhập (sắp xếp giảm dần theo thời gian)
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.user.id = :userId ORDER BY m.createdAt DESC")
    List<ChatMessage> findRecentMessagesByUserId(@Param("userId") Long userId, Pageable pageable);

    /**
     * Lấy danh sách tin nhắn gần nhất của khách vãng lai qua guestToken (sắp xếp giảm dần theo thời gian)
     */
    @Query("SELECT m FROM ChatMessage m WHERE m.guestToken = :guestToken ORDER BY m.createdAt DESC")
    List<ChatMessage> findRecentMessagesByGuestToken(@Param("guestToken") String guestToken, Pageable pageable);

    /**
     * Lấy toàn bộ lịch sử hội thoại của người dùng sắp xếp tăng dần theo thời gian
     */
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

    /**
     * Lấy toàn bộ lịch sử hội thoại của khách vãng lai sắp xếp tăng dần theo thời gian
     */
    List<ChatMessage> findByGuestTokenOrderByCreatedAtAsc(String guestToken);
}
