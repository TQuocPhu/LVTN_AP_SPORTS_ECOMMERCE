package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.AdminReplyReviewRequest;
import com.web.ap_sports.dto.request.admin.AdminReviewFilterRequest;
import com.web.ap_sports.dto.response.admin.AdminReviewDetailResponse;
import org.springframework.data.domain.Page;

public interface AdminReviewService {

    /**
     * Lấy danh sách quản lý đánh giá phân trang với các bộ lọc
     */
    Page<AdminReviewDetailResponse> getAdminReviews(AdminReviewFilterRequest filterRequest);

    /**
     * Gửi Phản hồi chính thức 1-1 từ Admin đại diện cho AP Sports
     */
    AdminReviewDetailResponse replyReview(Long reviewId, String adminEmail, AdminReplyReviewRequest request);

    /**
     * Ẩn hoặc Phê duyệt hiển thị đánh giá
     */
    AdminReviewDetailResponse toggleReviewStatus(Long reviewId);
}
