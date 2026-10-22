package com.web.ap_sports.service.ai;

import com.web.ap_sports.dto.request.ai.AiChatSuggestRequest;
import com.web.ap_sports.dto.response.ai.AiChatSuggestResponse;

/**
 * Interface cho Agent 5: AI Support Chat Assistant - Smart Reply (Gợi ý câu trả lời nhanh cho nhân viên CSKH).
 */
public interface SupportChatAiService {

    /**
     * Gợi ý 3 câu trả lời nhanh theo ngữ cảnh tin nhắn của khách và chính sách cửa hàng
     */
    AiChatSuggestResponse suggestReplies(AiChatSuggestRequest request);
}
