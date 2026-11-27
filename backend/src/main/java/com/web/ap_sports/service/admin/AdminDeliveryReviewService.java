package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.AdminDeliveryReviewFilterRequest;
import com.web.ap_sports.dto.request.admin.AdminReplyReviewRequest;
import com.web.ap_sports.dto.response.admin.AdminDeliveryReviewResponse;
import com.web.ap_sports.dto.response.admin.AdminDeliveryReviewSummaryResponse;
import org.springframework.data.domain.Page;

public interface AdminDeliveryReviewService {

    Page<AdminDeliveryReviewResponse> getDeliveryReviews(AdminDeliveryReviewFilterRequest filterRequest);

    AdminDeliveryReviewSummaryResponse getSummary();

    AdminDeliveryReviewResponse replyDeliveryReview(Long id, String staffEmail, AdminReplyReviewRequest request);

    AdminDeliveryReviewResponse toggleDeliveryReviewStatus(Long id);
}
