package com.web.ap_sports.service.ai;

import com.web.ap_sports.dto.response.ai.AiReviewSummaryResponse;

/**
 * Interface cho Agent 4: AI Review Sentiment & Summary (Tóm tắt & Phân tích cảm xúc đánh giá sản phẩm).
 */
public interface ReviewSentimentAiService {

    /**
     * Tóm tắt và phân tích cảm xúc từ các đánh giá thực tế của một sản phẩm
     */
    AiReviewSummaryResponse getReviewSummary(Long productId);
}
