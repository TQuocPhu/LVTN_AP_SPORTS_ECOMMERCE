package com.web.ap_sports.service.ai;

import com.web.ap_sports.dto.request.ai.AiSportsAdvisorRequest;
import com.web.ap_sports.dto.response.ai.AiSportsAdvisorResponse;
import com.web.ap_sports.entity.ChatMessage;
import com.web.ap_sports.entity.User;

import java.util.List;

/**
 * Interface cho Agent 1: Trợ lý AI Sports Advisor (Tư vấn thể thao, size số, trang bị và sản phẩm).
 */
public interface SportsAdvisorService {

    /**
     * Tư vấn thể thao cho khách hàng (có ghi nhận lịch sử ngữ cảnh vào chat_messages)
     */
    AiSportsAdvisorResponse advise(AiSportsAdvisorRequest request, User currentUser);

    /**
     * Lấy toàn bộ lịch sử tư vấn của khách hàng hiện tại
     */
    List<ChatMessage> getChatHistory(User currentUser, String guestToken);
}
