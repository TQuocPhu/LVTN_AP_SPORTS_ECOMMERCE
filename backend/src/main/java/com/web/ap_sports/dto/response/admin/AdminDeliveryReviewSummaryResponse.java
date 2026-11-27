package com.web.ap_sports.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Thống kê tổng quan chất lượng giao hàng phục vụ KPI Cards phía Quản trị & CSKH.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDeliveryReviewSummaryResponse {
    private long totalReviews;
    private double averageRating;
    private long positiveReviews; // >= 4 sao
    private long pendingReplyCount;
}
