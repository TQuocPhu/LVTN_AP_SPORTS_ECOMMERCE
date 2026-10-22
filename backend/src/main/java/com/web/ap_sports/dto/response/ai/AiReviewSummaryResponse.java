package com.web.ap_sports.dto.response.ai;

import lombok.*;

import java.util.List;

/**
 * DTO phản hồi tóm tắt và phân tích cảm xúc đánh giá sản phẩm.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiReviewSummaryResponse {

    private Long productId;

    // Tỷ lệ đánh giá tích cực (%)
    private Integer satisfactionRate;

    // Tổng số lượng đánh giá thực tế đã phân tích
    private Integer totalReviewsAnalyzed;

    // Các điểm ưu việt nổi bật khách hàng khen
    private List<String> positiveHighlights;

    // Các điểm lưu ý cần cân nhắc (ví dụ: form giày ôm, nên tăng size)
    private List<String> negativeNotes;

    // Đoạn tóm tắt tổng quát ngắn gọn
    private String summaryText;
}
