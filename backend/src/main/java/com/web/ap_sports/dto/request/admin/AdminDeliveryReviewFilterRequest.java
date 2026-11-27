package com.web.ap_sports.dto.request.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Bộ lọc truy vấn danh sách Đánh giá giao hàng phía Quản trị & CSKH.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDeliveryReviewFilterRequest {
    private String keyword;
    private Integer rating;
    private String status; // approved, hidden
    private Boolean hasReply;
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 10;
}
